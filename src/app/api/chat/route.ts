import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pool from '@/lib/db';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// OFFICE FALLBACK
const OFFICE_PHONE = "(919) 564-9134";
const OFFICE_EMAIL = "info@communityfocusnc.com";
const MASTER_WORK_ORDER_URL = "https://cfnc.cincwebaxis.com/workorders";

export async function POST(request: Request) {
    try {
        // --- FIX 1: Accept 'communitySlug' instead of 'communityName' ---
        const { message, history, communitySlug } = await request.json();

        if (!message || !communitySlug) {
            return NextResponse.json({ error: 'Message and Community Slug required' }, { status: 400 });
        }

        console.log(`\n--- NEW CHAT QUERY: "${message}" (Community Slug: ${communitySlug}) ---`);

        // --- STEP 1: CONSTRUCT HISTORY ---
        let historyLines = history
            ? history.map((h: any) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.text}`)
            : [];
        historyLines.push(`User: ${message}`);
        const historyText = historyLines.join('\n');

        // --- STEP 2: ANALYZE INTENT ---
        const analyzerModel = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const analyzerPrompt = `
        You are a conversation analyzer.
        
        **CONTEXT:** User is asking about the community with ID/Slug: "${communitySlug}".
        **HISTORY:** ${historyText}

        **TASK:**
        1. Classify category: ["Complaint", "Documents", "Maintenance", "General", "Rules"].
        2. If "Complaint", identify if it is about a neighbor/noise/pet.
        3. If "Documents", identify keywords (e.g., "Bylaws", "ARC Form").
        4. Generate a search query.

        **OUTPUT JSON:**
        {
          "category": "Category",
          "is_neighbor_complaint": boolean,
          "document_keywords": "keywords if docs requested",
          "search_query": "search string",
          "topic": "short topic summary"
        }
        `;

        const analysisResult = await analyzerModel.generateContent(analyzerPrompt);
        let analysis = JSON.parse(analysisResult.response.text());

        if (Array.isArray(analysis)) {
            analysis = analysis[0];
        }

        console.log("Analysis (Normalized):", analysis);

        const safeCategory = analysis.category || "General";
        const safeTopic = analysis.topic || "General Query";
        const safeSearchQuery = analysis.search_query || message;

        // --- STEP 2.5: LOG ANALYTICS (Async) ---
        // FIX: Look up community by SLUG
        pool.query(
            `INSERT INTO chat_analytics (community_id, category, topic)
             SELECT id, $1, $2 FROM communities WHERE slug = $3`,
            [safeCategory, safeTopic, communitySlug]
        ).catch(err => console.error("Analytics Log Error:", err));


        // --- STEP 3: DATA FETCHING (Parallel) ---
        const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

        const searchTerms = (analysis.document_keywords || safeTopic).split(" ").filter((w: string) => w.length > 2);

        // FIX: Filter by c.slug instead of c.name
        const fileSearchQuery = `
            SELECT title, file_url 
            FROM community_downloads cd
            JOIN communities c ON cd.community_id = c.id
            WHERE c.slug = $1 
            AND (
                title ILIKE $2 OR category ILIKE $2 
                ${searchTerms.length > 0 ? `OR title ILIKE $3` : ''}
            )
            LIMIT 5
        `;

        const fileParams = [
            communitySlug,
            `%${analysis.document_keywords || safeTopic}%`,
            ...(searchTerms.length > 0 ? [`%${searchTerms[0]}%`] : [])
        ];

        const [embeddingResult, managerRes, filesRes] = await Promise.all([
            embeddingModel.embedContent(safeSearchQuery),
            // FIX: Lookup manager by community slug
            pool.query(`
                SELECT m.name, m.email, m.phone 
                FROM managers m 
                JOIN communities c ON c.manager_id = m.id 
                WHERE c.slug = $1
            `, [communitySlug]),
            pool.query(fileSearchQuery, fileParams)
        ]);

        const embedding = embeddingResult.embedding.values;
        const manager = managerRes.rows[0] || { name: 'The Office', email: OFFICE_EMAIL, phone: OFFICE_PHONE };
        const foundFiles = filesRes.rows;

        // --- STEP 4: VECTOR SEARCH (Knowledge Base) ---
        // FIX: Lookup docs by community slug
        const vectorQuery = pool.query(
            `SELECT cd.content, c.name as community_name
             FROM community_docs cd
                      JOIN communities c ON cd.community_id = c.id
             WHERE c.slug = $1
             ORDER BY (cd.embedding <=> $2::vector) ASC
                 LIMIT 6`,
            [communitySlug, JSON.stringify(embedding)]
        );
        const vectorRes = await vectorQuery;

        // --- STEP 5: BUILD SYSTEM PROMPT ---
        const contextDocs = vectorRes.rows.map(r => r.content).join("\n\n");
        const fileLinks = foundFiles.map(f => `- [Download ${f.title}](${f.file_url})`).join("\n");
        const hasFiles = foundFiles.length > 0;
        // Use the actual community name from the DB result if available, otherwise fallback to slug
        const displayCommName = vectorRes.rows[0]?.community_name || communitySlug;

        const chatModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const systemPrompt = `
        You are the Community Focus Assistant for ${displayCommName}.
        
        **MANAGER CONTACT:**
        - Name: ${manager.name}
        - Email: ${manager.email || OFFICE_EMAIL}
        - Phone: ${manager.phone || OFFICE_PHONE}

        **AVAILABLE FILES (Use these links!):**
        ${hasFiles ? fileLinks : "NO FILES FOUND IN DATABASE."}

        **KNOWLEDGE BASE:**
        ${contextDocs}

        **INSTRUCTIONS:**
        1. **COMPLAINTS:** If this is a neighbor/noise complaint (${analysis.is_neighbor_complaint}):
           - Be empathetic and professional.
           - Assure the user that Community Focus takes these issues seriously.
           - SUGGEST: "Please reach out to your Community Manager, ${manager.name}, directly at ${manager.email} or ${manager.phone} so we can address this privately."

        2. **DOCUMENTS:** If the user is asking for a document:
           - **IF LINKS EXIST ABOVE:** You MUST provide the direct Markdown link. Example: "You can download it here: [Title](url)."
           - **IF NO LINKS EXIST:** Be honest. Say "I don't have a digital copy of that specific document in my database yet. Please contact ${manager.email} to request a copy."
           - **DO NOT** vaguely say "it is available in the information provided" if there is no link.

        3. **MAINTENANCE:** Direct to [Work Order Portal](${MASTER_WORK_ORDER_URL}).

        4. **GENERAL:** Answer based on the Knowledge Base. Keep it simple and helpful.
        `;

        // --- STEP 6: GENERATE ---
        const result = await chatModel.generateContent([
            { text: systemPrompt },
            { text: `User Question: ${message}` }
        ]);

        return NextResponse.json({ reply: result.response.text() });

    } catch (error: any) {
        console.error('Chat API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}