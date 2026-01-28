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
        const { message, history, communityName } = await request.json();

        if (!message || !communityName) {
            return NextResponse.json({ error: 'Message and Community required' }, { status: 400 });
        }

        // --- STEP 1: ANALYZE INTENT ---
        const analyzerModel = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const analyzerPrompt = `
        You are a conversation analyzer.
        Context: User is asking about "${communityName}".
        Task: Extract intent and keywords.
        Output JSON: { "category": "Category", "is_neighbor_complaint": boolean, "document_keywords": "keywords", "topic": "summary" }
        `;

        let analysis: any = {};
        try {
            const analysisResult = await analyzerModel.generateContent([
                { text: analyzerPrompt },
                { text: `User History: ${JSON.stringify(history || [])}` },
                { text: `Current Message: ${message}` }
            ]);
            analysis = JSON.parse(analysisResult.response.text());
            if (Array.isArray(analysis)) analysis = analysis[0];
        } catch (e) {
            console.error("Analysis Failed (using defaults)");
            analysis = { category: "General", topic: "General Query", document_keywords: message };
        }

        const safeTopic = analysis.topic || "General Query";
        const keywords = (analysis.document_keywords || safeTopic).replace(/[^\w\s]/g, '').trim();
        const searchTerms = keywords.split(" ").filter((w: string) => w.length > 2);

        // --- STEP 2: EMBEDDING (3072 Dims) ---
        const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

        // --- STEP 3: FETCH DATA ---
        let embedding = null;
        let manager = { name: 'The Office', email: OFFICE_EMAIL, phone: OFFICE_PHONE };
        let foundFiles = [];
        let contextRows = [];

        try {
            // Parallel Fetch: Embedding + Manager + Files
            const [embeddingResult, managerRes, filesRes] = await Promise.all([
                embeddingModel.embedContent(keywords),
                pool.query(`SELECT m.name, m.email, m.phone FROM managers m JOIN communities c ON c.manager_id = m.id WHERE c.name = $1`, [communityName]),
                pool.query(`
                    SELECT title, file_url, category
                    FROM community_downloads cd
                    JOIN communities c ON cd.community_id = c.id
                    WHERE c.name = $1
                    AND (title ILIKE $2 OR category ILIKE $2)
                    LIMIT 5
                `, [communityName, `%${keywords}%`])
            ]);

            embedding = embeddingResult.embedding.values;
            if (managerRes.rows.length > 0) manager = managerRes.rows[0];
            foundFiles = filesRes.rows;

            // --- STEP 4: HYBRID CONTEXT SEARCH (Vector + Keyword) ---

            // A. Vector Search
            let vectorDocs = [];
            try {
                const vectorQuery = await pool.query(
                    `SELECT cd.content, c.name as community_name, 1 as score
                     FROM community_docs cd
                     JOIN communities c ON cd.community_id = c.id
                     WHERE c.name = $1
                     ORDER BY (cd.embedding <=> $2::vector) ASC
                     LIMIT 4`,
                    [communityName, JSON.stringify(embedding)]
                );
                vectorDocs = vectorQuery.rows;
            } catch (err) {
                console.warn("Vector Search failed (likely empty embeddings):", err);
            }

            // B. Keyword Search Fallback (Crucial if embeddings are broken/empty)
            let keywordDocs = [];
            if (searchTerms.length > 0) {
                 const keywordQuery = await pool.query(
                    `SELECT cd.content, c.name as community_name, 2 as score
                     FROM community_docs cd
                     JOIN communities c ON cd.community_id = c.id
                     WHERE c.name = $1
                     AND (cd.content ILIKE $2 OR cd.filename ILIKE $2)
                     LIMIT 4`,
                    [communityName, `%${searchTerms[0]}%`] // Searching for primary keyword
                );
                keywordDocs = keywordQuery.rows;
            }

            // Combine and Deduplicate
            const allDocs = [...vectorDocs, ...keywordDocs];
            const uniqueDocs = Array.from(new Set(allDocs.map(a => a.content))).map(content => {
                return allDocs.find(a => a.content === content);
            });

            contextRows = uniqueDocs.slice(0, 6); // Keep top 6 chunks

        } catch (err: any) {
            console.error("Data Fetch Error:", err.message);
            return NextResponse.json({ reply: "I'm having trouble accessing the database right now. Please try again." });
        }

        // --- STEP 5: GENERATE REPLY ---
        const contextDocs = contextRows.map((r: any) => r.content).join("\n\n");
        const fileLinks = foundFiles.map((f: any) => `- [Download ${f.title}](${f.file_url})`).join("\n");

        const chatModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

 const systemPrompt = `
         You are **Waldo**, the friendly and helpful AI Assistant for Community Focus of NC.
         You are assisting a resident of **${communityName}**.

         **--- KEY CONTACTS ---**
         * **Community Manager:** ${manager.name}
         * **Email:** ${manager.email || OFFICE_EMAIL}
         * **Phone:** ${manager.phone || OFFICE_PHONE}

         **--- RELEVANT FILES ---**
         ${foundFiles.length > 0 ? fileLinks : "No specific files found for this topic."}

         **--- KNOWLEDGE BASE FRAGMENTS ---**
         ${contextDocs || "No specific text passages found."}

         **--- USER QUESTION ---**
         "${message}"

         **--- INSTRUCTIONS ---**
         1.  **Be Direct & Plain-Spoken:** - Answer the question directly using the Knowledge Base.
             - **Translate Legalese:** If the text says "erected," say "built." If it says "vehicular ingress," say "driving in." Speak like a helpful neighbor, not a lawyer.

         2.  **Document Handling:** - If the user asks for a form (e.g., ARC, Parking) and you see it in "RELEVANT FILES," explicitly say: "You can download the form here: [Link]."
             - If the file is NOT there, say: "I don't have a digital copy handy, but you can request one from ${manager.name}."

         3.  **Submission Logic (CRITICAL):** - If the user asks how to submit a form (especially Architectural/ARC), instruct them: **"Please complete the form and submit it through the [Cinc Systems Portal](https://cfnc.cincwebaxis.com/)."**
             - Do not suggest emailing the manager unless the Knowledge Base explicitly overrides this.

         4.  **The "I Don't Know" Fallback:** - If the answer is not in the Knowledge Base, **DO NOT** say "I cannot answer."
             - **Instead, say:** "I don't have that specific rule in my database, but ${manager.name} can clarify that for you. You can reach them at ${manager.email}."

         5.  **Formatting:**
             - Use **bold** for key terms or deadlines.
             - Use bullet points if listing multiple steps or rules.
         `;

        const result = await chatModel.generateContent(systemPrompt);

        return NextResponse.json({ reply: result.response.text() });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}