import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pool from '@/lib/db';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const GLOBAL_LAWS_COMMUNITY = "North Carolina General Statutes";

// DEFINED CONSTANTS
const MASTER_PORTAL_URL = "https://cfnc.cincwebaxis.com";
const MASTER_WORK_ORDER_URL = "https://cfnc.cincwebaxis.com/workorders";
const OFFICE_PHONE = "(919) 564-9134";
const OFFICE_EMAIL = "info@communityfocusnc.com";

export async function POST(request: Request) {
    try {
        const { message, history, communityName } = await request.json();

        if (!message || !communityName) {
            return NextResponse.json({ error: 'Message and Community required' }, { status: 400 });
        }

        console.log(`\n--- NEW CHAT QUERY: "${message}" (Community: ${communityName}) ---`);

        // --- STEP 1: CONSTRUCT HISTORY ---
        let historyLines = history
            ? history.map((h: any) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.text}`)
            : [];
        historyLines.push(`User: ${message}`);
        const historyText = historyLines.join('\n');

        // --- STEP 2: CONTEXTUAL ANALYSIS (UPDATED FOR ANALYTICS) ---
        const analyzerModel = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        // We ask Gemini to categorize the question while it analyzes it
        const analyzerPrompt = `
    You are a conversation analyzer for a Property Management AI.
    
    **USER'S COMMUNITY:** "${communityName}"
    
    **CONVERSATION HISTORY:**
    ${historyText}
    
    **TASK:**
    1. Identify the User's **Role** (Homeowner, Tenant, Board Member). If unknown, assume "Homeowner".
    2. Identify the User's **Core Question**.
    3. Generate a **Search Query** for the database.
    4. **Categorize** the question into EXACTLY one of these: ["Maintenance", "Documents", "Amenities", "Rules", "Billing", "Events", "General", "Complaint"].
    5. Extract a short 2-5 word **Topic** (e.g., "Trash Pickup", "Pool Hours", "Noise Complaint", "ARC Request").

    **OUTPUT JSON:**
    {
      "user_role": "extracted role",
      "core_question": "The user's original question",
      "search_query": "Query for the database",
      "category": "One of the allowed categories",
      "topic": "Short topic summary"
    }
    `;

        const analysisResult = await analyzerModel.generateContent(analyzerPrompt);
        let rawAnalysis = JSON.parse(analysisResult.response.text());
        const analysis = Array.isArray(rawAnalysis) ? rawAnalysis[0] : rawAnalysis;

        console.log("Analysis & Categorization:", analysis);

        // --- STEP 2.5: SAVE ANALYTICS (FIRE AND FORGET) ---
        // We do not await this because we don't want to slow down the user's answer.
        // We use a subquery to find the ID from the name.
        pool.query(
            `INSERT INTO chat_analytics (community_id, category, topic) 
             SELECT id, $1, $2 FROM communities WHERE name = $3`,
            [analysis.category, analysis.topic, communityName]
        ).catch(err => console.error("Analytics Log Error:", err));


        // --- STEP 3: DATABASE SEARCH ---
        const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const embeddingResult = await embeddingModel.embedContent(analysis.search_query);
        const embedding = embeddingResult.embedding.values;

        // QUERY A: Local Community Docs
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

        // --- STEP 4: GENERATE ANSWER ---
        const chatModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const answerPrompt = `
      You are the Community Focus Assistant, a helpful and clear AI for property management.
      
      **CONTEXT:**
      - User Role: ${analysis.user_role}
      - Community: ${communityName}
      - Office Phone: ${OFFICE_PHONE}
      - Office Email: ${OFFICE_EMAIL}
      
      **OFFICIAL DOCUMENTS:**
      ${contextText}
      
      **USER QUESTION:**
      "${analysis.core_question}"
      
      **TONE & STYLE GUIDELINES:**
      1. **Speak Plainly:** Explain rules in simple, everyday language.
      2. **Be Direct:** Answer the question first.
      3. **Use Source:** Only use the provided Official Documents.
      
      **CRITICAL PROTOCOLS:**
      1. **MAINTENANCE:** Direct to [Submit Work Order](${MASTER_WORK_ORDER_URL}).
      2. **ARC REQUESTS:** Direct to [Submit ARC Request](${MASTER_PORTAL_URL}).
      3. **CONTACT:** ${OFFICE_PHONE} or ${OFFICE_EMAIL}.
      4. **EMERGENCY:** If urgent (fire/leak) and HOA responsibility, mention Emergency Work Order.
      5. **PAYMENTS:** [Resident Portal](${MASTER_PORTAL_URL}).
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