import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pool from '@/lib/db';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
    try {
        const { message, history } = await request.json();

        if (!message) {
            return NextResponse.json({ error: 'Message required' }, { status: 400 });
        }

        console.log(`\n--- NEW CHAT QUERY: "${message}" ---`);

        // --- STEP 1: CONTEXTUAL ANALYSIS (The Detective) ---
        // MODEL 1: Strict JSON Mode for logic
        const analyzerModel = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const historyText = history
            ? history.map((h: any) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.text}`).join('\n')
            : `User: ${message}`;

        const analyzerPrompt = `
    You are a conversation analyzer for a Property Management AI.
    
    Conversation History:
    ${historyText}
    
    TASK:
    1. Identify if the User has specified which **Community/HOA** they are asking about (e.g., "Five Oaks", "Forest Hills").
    2. Identify if the User has specified their **Role** (e.g., "Homeowner", "Tenant", "Board Member").
    3. Determine the User's core question or intent.

    OUTPUT IN JSON FORMAT ONLY:
    {
      "has_community": boolean,
      "has_role": boolean,
      "community_name": "extracted name or null",
      "user_role": "extracted role or null",
      "search_query": "A specific search query for the database (e.g. 'parking rules in Five Oaks') OR null if info is missing",
      "missing_info_response": "A polite question asking for the missing community or role. (Only needed if has_community or has_role is false)"
    }
    `;

        const analysisResult = await analyzerModel.generateContent(analyzerPrompt);
        let rawAnalysis = JSON.parse(analysisResult.response.text());

        // Handle array response edge case
        const analysis = Array.isArray(rawAnalysis) ? rawAnalysis[0] : rawAnalysis;

        console.log("Analysis:", analysis);

        // --- STEP 2: DECISION TREE ---

        // A. If missing info, ask for it immediately
        if (!analysis.has_community || !analysis.has_role) {
            return NextResponse.json({ reply: analysis.missing_info_response });
        }

        // B. If we have info, SEARCH THE DATABASE (RAG)
        console.log(`Searching DB for: "${analysis.search_query}"`);

        const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const embeddingResult = await embeddingModel.embedContent(analysis.search_query);
        const embedding = embeddingResult.embedding.values;

        const dbResult = await pool.query(
            `SELECT cd.content, c.name as community_name, (cd.embedding <=> $1::vector) as distance
             FROM community_docs cd
                      JOIN communities c ON cd.community_id = c.id
             ORDER BY distance ASC
                 LIMIT 10`,
            [JSON.stringify(embedding)]
        );

        const contextText = dbResult.rows.map(row =>
            `[SOURCE: ${row.community_name}]\n${row.content}`
        ).join("\n\n");

        // --- STEP 3: GENERATE FINAL ANSWER ---
        // MODEL 2: Standard Text Mode for talking to humans
        const chatModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const answerPrompt = `
      You are the specialized AI Property Manager for Community Focus of NC.
      
      **CONTEXT:**
      - User Role: ${analysis.user_role}
      - Community: ${analysis.community_name}
      
      **OFFICIAL DOCUMENTS:**
      ${contextText}
      
      **USER QUESTION:**
      "${message}"
      
      **INSTRUCTIONS:**
      1. Answer the user's question based ONLY on the provided documents.
      2. If the documents don't have the answer, state that clearly.
      3. Tailor the tone to the user's role (e.g., be more formal with Board Members, helpful with Tenants).
      4. Ensure the answer applies to **${analysis.community_name}**.
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