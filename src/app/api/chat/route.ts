import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pool from '@/lib/db';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Define the name of the "Global" community that holds the laws
const GLOBAL_LAWS_COMMUNITY = "North Carolina General Statutes";

export async function POST(request: Request) {
    try {
        const { message, history } = await request.json();

        if (!message) {
            return NextResponse.json({ error: 'Message required' }, { status: 400 });
        }

        console.log(`\n--- NEW CHAT QUERY: "${message}" ---`);

        // --- STEP 0: FETCH VALID COMMUNITIES ---
        const communityResult = await pool.query('SELECT name FROM communities WHERE is_active = true');

        const validCommunities = communityResult.rows
            .map(row => row.name)
            .filter(name => name !== GLOBAL_LAWS_COMMUNITY)
            .join(", ");

        // --- STEP 1: CONTEXTUAL ANALYSIS (The Detective) ---
        const analyzerModel = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        // Construct history to ALWAYS include the current message
        const historyLines = history
            ? history.map((h: any) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.text}`)
            : [];

        historyLines.push(`User: ${message}`);
        const historyText = historyLines.join('\n');

        const analyzerPrompt = `
    You are a conversation analyzer for a Property Management AI.
    
    **VALID COMMUNITY NAMES:**
    [${validCommunities}]

    **COMMUNITY ALIASES / MAPPINGS:**
    - "4100" -> "4100 Five Oaks"
    - "Five Oaks" -> "4100 Five Oaks" (ONLY if "Five Oaks Lakeside" is NOT in the valid list. Otherwise, treat as ambiguous.)
    
    **CONVERSATION HISTORY:**
    ${historyText}
    
    **TASK:**
    1. Identify the User's **Community/HOA**.
       - **AMBIGUITY CHECK:** If the user provides a name (e.g., "Farrington") that is a partial match for MULTIPLE valid communities:
         - Set "has_community": false.
         - Set "missing_info_response": "We manage both **[Option A]** and **[Option B]**. Which one are you referring to?"
       - **EXACT MATCH:** If the input matches exactly one valid name or alias, accept it.
    
    2. Identify the User's **Role** (Homeowner, Tenant, Board Member).
       - If not explicitly stated, return null (we will handle the default in code).
    
    3. Identify the User's **Core Question**.

    **OUTPUT JSON:**
    {
      "has_community": boolean, 
      "has_role": boolean,
      "community_name": "The FULL VALID NAME from the list or null",
      "user_role": "extracted role or null",
      "core_question": "The user's original question",
      "search_query": "Query for the database",
      "missing_info_response": "If community is missing, ask for it specifically."
    }
    `;

        const analysisResult = await analyzerModel.generateContent(analyzerPrompt);
        let rawAnalysis = JSON.parse(analysisResult.response.text());
        const analysis = Array.isArray(rawAnalysis) ? rawAnalysis[0] : rawAnalysis;

        console.log("Analysis:", analysis);

        // --- STEP 2: DECISION TREE (FRICTION REDUCTION) ---

        // FIX: If we have the community but lack the role, DEFAULT to "Homeowner" and PROCEED.
        // This prevents the bot from stopping just to ask "Are you an owner?"
        if (analysis.has_community && !analysis.has_role) {
            console.log("Community found but role missing. Defaulting to 'Homeowner' to reduce friction.");
            analysis.has_role = true;
            analysis.user_role = "Homeowner";
        }

        // Only stop if we genuinely don't know the community
        if (!analysis.has_community) {
            const reply = analysis.missing_info_response || "Could you please tell me which community you are asking about?";
            return NextResponse.json({ reply });
        }

        // --- STEP 3: DATABASE SEARCH (10/5 SPLIT) ---
        console.log(`Searching DB for: "${analysis.search_query}"`);

        const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const embeddingResult = await embeddingModel.embedContent(analysis.search_query);
        const embedding = embeddingResult.embedding.values;

        // QUERY A: Search ONLY the User's Community (Top 10)
        const localQuery = pool.query(
            `SELECT cd.content, c.name as community_name, (cd.embedding <=> $1::vector) as distance
             FROM community_docs cd
                      JOIN communities c ON cd.community_id = c.id
             WHERE c.name = $2
             ORDER BY distance ASC
                 LIMIT 10`,
            [JSON.stringify(embedding), analysis.community_name]
        );

        // QUERY B: Search ONLY the Global Laws (Top 5)
        const globalQuery = pool.query(
            `SELECT cd.content, c.name as community_name, (cd.embedding <=> $1::vector) as distance
             FROM community_docs cd
                      JOIN communities c ON cd.community_id = c.id
             WHERE c.name = $2
             ORDER BY distance ASC
                 LIMIT 5`,
            [JSON.stringify(embedding), GLOBAL_LAWS_COMMUNITY]
        );

        const [localResult, globalResult] = await Promise.all([localQuery, globalQuery]);
        const allRows = [...localResult.rows, ...globalResult.rows];

        const contextText = allRows.map(row =>
            `[SOURCE: ${row.community_name}]\n${row.content}`
        ).join("\n\n");

        if (allRows.length === 0) {
            console.log("No documents found locally or globally.");
        }

        const chatModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const answerPrompt = `
      You are the Community Focus Assistant, a helpful and clear AI for property management.
      
      **CONTEXT:**
      - User Role: ${analysis.user_role}
      - Community: ${analysis.community_name}
      
      **OFFICIAL DOCUMENTS:**
      ${contextText}
      
      **USER QUESTION:**
      "${analysis.core_question}"
      
      **TONE & STYLE GUIDELINES:**
      1. **Speak Plainly:** Do not just copy-paste legal text. Explain it in simple, everyday language.
      2. **Be Direct:** Answer the question first ("Yes," "No," "It depends..."), then explain why.
      3. **Avoid Jargon:** Briefly explain legal terms if used.
      4. **Summarize:** Use bullet points for long lists or rules.
      
      **CRITICAL DISTINCTIONS:**
      - **SOLAR PANELS vs. FANS:** If the local docs only mention "Solar Fans," state that clearly, then refer to NC General Statute 22B-20 regarding panels.
      
      **LEGAL HIERARCHY:**
      - State Laws (NC General Statutes) override local rules.
      
      **EMERGENCY PROTOCOL:**
      If issue is (A) Emergency AND (B) HOA Responsibility -> Append CINC Link.
    `;

        const finalResult = await chatModel.generateContent(answerPrompt);
        const finalResponse = await finalResult.response.text();

        return NextResponse.json({ reply: finalResponse });

    } catch (error: any) {
        console.error('Chat API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error.message },
            { status: 500 }
        );
    }
}