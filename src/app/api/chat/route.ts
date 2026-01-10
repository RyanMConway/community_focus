import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pool from '@/lib/db';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const GLOBAL_LAWS_COMMUNITY = "North Carolina General Statutes";

export async function POST(request: Request) {
    try {
        // NEW: Receive communityName explicitly
        const { message, history, communityName } = await request.json();

        if (!message || !communityName) {
            return NextResponse.json({ error: 'Message and Community required' }, { status: 400 });
        }

        console.log(`\n--- NEW CHAT QUERY: "${message}" (Community: ${communityName}) ---`);

        // --- STEP 1: CONTEXTUAL ANALYSIS (SIMPLIFIED) ---
        // We only need the AI to extract the Role and Core Question now.
        const analyzerModel = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const historyText = history
            ? history.map((h: any) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.text}`).join('\n')
            : `User: ${message}`;

        const analyzerPrompt = `
    You are a conversation analyzer for a Property Management AI.
    
    **USER'S COMMUNITY:** "${communityName}" (This is confirmed).
    
    **CONVERSATION HISTORY:**
    ${historyText}
    
    **TASK:**
    1. Identify the User's **Role** (Homeowner, Tenant, Board Member). If unknown, assume "Homeowner".
    2. Identify the User's **Core Question**.
    3. Generate a **Search Query** for the database.

    **OUTPUT JSON:**
    {
      "user_role": "extracted role",
      "core_question": "The user's original question",
      "search_query": "Query for the database"
    }
    `;

        const analysisResult = await analyzerModel.generateContent(analyzerPrompt);
        let rawAnalysis = JSON.parse(analysisResult.response.text());
        const analysis = Array.isArray(rawAnalysis) ? rawAnalysis[0] : rawAnalysis;

        console.log("Analysis:", analysis);

        // --- STEP 2: DATABASE SEARCH ---
        console.log(`Searching DB for: "${analysis.search_query}"`);

        const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const embeddingResult = await embeddingModel.embedContent(analysis.search_query);
        const embedding = embeddingResult.embedding.values;

        // QUERY A: Search ONLY the Selected Community
        const localQuery = pool.query(
            `SELECT cd.content, c.name as community_name, (cd.embedding <=> $1::vector) as distance
             FROM community_docs cd
                      JOIN communities c ON cd.community_id = c.id
             WHERE c.name = $2
             ORDER BY distance ASC
                 LIMIT 10`,
            [JSON.stringify(embedding), communityName]
        );

        // QUERY B: Global Laws
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

        // --- STEP 3: GENERATE ANSWER ---
        const chatModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const answerPrompt = `
      You are the Community Focus Assistant, a helpful and clear AI for property management.
      
      **CONTEXT:**
      - User Role: ${analysis.user_role}
      - Community: ${communityName}
      
      **OFFICIAL DOCUMENTS:**
      ${contextText}
      
      **USER QUESTION:**
      "${analysis.core_question}"
      
      **TONE & STYLE GUIDELINES:**
      1. **Speak Plainly:** Explain rules in simple, everyday language.
      2. **Be Direct:** Answer the question first ("Yes," "No," "It depends...").
      3. **Use Source:** Only use the provided Official Documents. If the answer isn't there, say you don't know.
      
      **CRITICAL DISTINCTIONS:**
      - If local rules conflict with State Laws (NC Gen Stat), explain that State Law usually wins.
      
      **EMERGENCY PROTOCOL:**
      If issue is (A) Emergency AND (B) HOA Responsibility -> Append CINC Link: [Submit CINC Work Order](https://placeholder.cinc.com/work-order)
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