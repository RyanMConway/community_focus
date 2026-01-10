import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pool from '@/lib/db';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const GLOBAL_LAWS_COMMUNITY = "North Carolina General Statutes";

// DEFINED CONSTANTS - The Master Links
const MASTER_PORTAL_URL = "https://cfnc.cincwebaxis.com";
const MASTER_WORK_ORDER_URL = "https://cfnc.cincwebaxis.com/workorders";
const OFFICE_PHONE = "(919) 564-9134"; // Replace with your real office number
const OFFICE_EMAIL = "info@communityfocusnc.com"; // Replace with real email

export async function POST(request: Request) {
    try {
        const { message, history, communityName } = await request.json();

        if (!message || !communityName) {
            return NextResponse.json({ error: 'Message and Community required' }, { status: 400 });
        }

        console.log(`\n--- NEW CHAT QUERY: "${message}" (Community: ${communityName}) ---`);

        // --- STEP 1: CONTEXTUAL ANALYSIS ---
        const analyzerModel = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const historyText = history
            ? history.map((h: any) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.text}`).join('\n')
            : `User: ${message}`;

        const analyzerPrompt = `
    You are a conversation analyzer for a Property Management AI.
    
    **USER'S COMMUNITY:** "${communityName}"
    
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
      
      **CRITICAL PROTOCOLS (READ CAREFULLY):**
      
      1. **MAINTENANCE & WORK ORDERS:**
         If the user asks how to submit a work order, repair request, or fix something (non-emergency), reply:
         "You can submit a maintenance request online through our portal: [Submit Work Order](${MASTER_WORK_ORDER_URL})"
         
      2. **ARCHITECTURAL REQUESTS (ARC/ACC):**
         If the user wants to make a change to their home (fence, paint, addition), reply:
         "You must submit an Architectural Request for review. You can do this easily through the Resident Portal: [Submit ARC Request](${MASTER_PORTAL_URL})"
         
      3. **CONTACT INFO:**
         If asked for a phone number or email, provide the office info: ${OFFICE_PHONE} or ${OFFICE_EMAIL}.
         Do NOT invent personal phone numbers for managers.
         
      4. **SPECIFIC DATES / CALENDARS:**
         Do NOT guess dates for meetings or trash pickup. Instead, say:
         "Please check the Calendar or News section of the Resident Portal for the most up-to-date schedules."
      
      5. **EMERGENCY ISSUES:**
         If the issue is an **active emergency** (leak, fire, storm damage) AND the documents indicate it is the **HOA's responsibility**, append:
         "\n\n🚨 **This appears to be an urgent HOA matter. Please submit an Emergency Work Order immediately:** [Submit Emergency Request](${MASTER_WORK_ORDER_URL})"
      
      6. **PAYMENTS:**
         For payments/balances: [Resident Portal](${MASTER_PORTAL_URL})
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