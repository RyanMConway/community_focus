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
        // We fetch all active communities but EXCLUDE the "Laws" community from the detection list.
        const communityResult = await pool.query('SELECT name FROM communities WHERE is_active = true');

        const validCommunities = communityResult.rows
            .map(row => row.name)
            .filter(name => name !== GLOBAL_LAWS_COMMUNITY) // <--- HIDE GLOBAL COMMUNITY
            .join(", ");

        // --- STEP 1: CONTEXTUAL ANALYSIS (The Detective) ---
        const analyzerModel = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const historyText = history
            ? history.map((h: any) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.text}`).join('\n')
            : `User: ${message}`;

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
    
    3. Identify the User's **Core Question** (look back in history if needed).

    **OUTPUT JSON:**
    {
      "has_community": boolean, 
      "has_role": boolean,
      "community_name": "The FULL VALID NAME from the list or null",
      "user_role": "extracted role or null",
      "core_question": "The user's original question",
      "search_query": "Query for the database",
      "missing_info_response": "If info is missing or ambiguous, ask a specific follow-up."
    }
    `;

        const analysisResult = await analyzerModel.generateContent(analyzerPrompt);
        let rawAnalysis = JSON.parse(analysisResult.response.text());
        const analysis = Array.isArray(rawAnalysis) ? rawAnalysis[0] : rawAnalysis;

        console.log("Analysis:", analysis);

        // --- STEP 2: DECISION TREE ---

        if (!analysis.has_community || !analysis.has_role) {
            return NextResponse.json({ reply: analysis.missing_info_response });
        }

        // --- STEP 3: DATABASE SEARCH (10/5 SPLIT) ---
        console.log(`Searching DB for: "${analysis.search_query}"`);

        const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const embeddingResult = await embeddingModel.embedContent(analysis.search_query);
        const embedding = embeddingResult.embedding.values;

        // QUERY A: Search ONLY the User's Community (Top 10)
        // Increased from 5 to 10 to ensure we catch all relevant local rules
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
        // Kept at 5 to provide legal context without overwhelming the prompt
        const globalQuery = pool.query(
            `SELECT cd.content, c.name as community_name, (cd.embedding <=> $1::vector) as distance
             FROM community_docs cd
                      JOIN communities c ON cd.community_id = c.id
             WHERE c.name = $2
             ORDER BY distance ASC
                 LIMIT 5`,
            [JSON.stringify(embedding), GLOBAL_LAWS_COMMUNITY]
        );

        // Run both in parallel
        const [localResult, globalResult] = await Promise.all([localQuery, globalQuery]);

        // Combine results (up to 15 chunks total)
        const allRows = [...localResult.rows, ...globalResult.rows];

        // Format for the AI
        const contextText = allRows.map(row =>
            `[SOURCE: ${row.community_name}]\n${row.content}`
        ).join("\n\n");

        if (allRows.length === 0) {
            console.log("No documents found locally or globally.");
        }

        const chatModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const answerPrompt = `
      You are the specialized AI Property Manager for Community Focus of NC.
      
      **CONTEXT:**
      - User Role: ${analysis.user_role}
      - Community: ${analysis.community_name}
      
      **OFFICIAL DOCUMENTS:**
      ${contextText}
      
      **USER QUESTION:**
      "${analysis.core_question}"
      
      **INSTRUCTIONS:**
      1. Answer the USER QUESTION based ONLY on the provided documents.
      2. If the documents don't have the answer, state that clearly.
      3. Tailor the tone to the user's role.
      4. Ensure the answer applies to **${analysis.community_name}**.
      
      **CRITICAL DISTINCTIONS (READ CAREFULLY):**
      - **SOLAR PANELS vs. FANS:** If the user asks about "Solar Panels" (photovoltaic systems) but the community documents ONLY mention "Solar Attic Fans" or "Solar Tubes," you MUST acknowledge this gap.
        - SAY: "The community documents specifically address solar attic fans, but do not mention solar panels."
        - THEN: Refer to the NC General Statutes for rights regarding Solar Panels.
      
      **LEGAL HIERARCHY:**
      - Documents labeled "[SOURCE: ${GLOBAL_LAWS_COMMUNITY}]" apply to **ALL** communities.
      - Use these to support your answer or override community rules if the statute is stricter.
      
      **EMERGENCY PROTOCOL (CINC WORK ORDER):**
      If the user's issue meets BOTH criteria:
      (A) It is an **emergency** (e.g., active water leak, fire hazard).
      (B) The official documents indicate it is the **HOA's responsibility**.
      
      ...THEN append this link:
      "\n\n🚨 **This appears to be an urgent HOA matter. Please submit an Emergency Work Order immediately:** [Submit CINC Work Order](https://placeholder.cinc.com/work-order)"
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