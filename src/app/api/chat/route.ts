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
        const searchTerms = (analysis.document_keywords || safeTopic).split(" ").filter((w: string) => w.length > 2);

        // --- STEP 2: EMBEDDING (3072 Dims) ---
        // We use gemini-embedding-001 because text-embedding-004 is 404ing for you.
        const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

        // --- STEP 3: FETCH DATA ---
        let embedding, manager, foundFiles;

        try {
            const [embeddingResult, managerRes, filesRes] = await Promise.all([
                embeddingModel.embedContent(analysis.document_keywords || message),
                pool.query(`SELECT m.name, m.email, m.phone FROM managers m JOIN communities c ON c.manager_id = m.id WHERE c.name = $1`, [communityName]),
                pool.query(`
                    SELECT title, file_url
                    FROM community_downloads cd
                    JOIN communities c ON cd.community_id = c.id
                    WHERE c.name = $1
                    AND (title ILIKE $2 OR category ILIKE $2)
                    LIMIT 5
                `, [communityName, `%${analysis.document_keywords || safeTopic}%`])
            ]);

            embedding = embeddingResult.embedding.values;
            manager = managerRes.rows[0] || { name: 'The Office', email: OFFICE_EMAIL, phone: OFFICE_PHONE };
            foundFiles = filesRes.rows;

        } catch (err: any) {
            console.error("Data Fetch Error:", err.message);
            // Fail gracefully if embedding fails
            return NextResponse.json({ reply: "I'm having trouble accessing the database right now. Please try again." });
        }

        // --- STEP 4: SEARCH (No Index Required) ---
        let vectorRes;
        try {
            vectorRes = await pool.query(
                `SELECT cd.content, c.name as community_name
                 FROM community_docs cd
                 JOIN communities c ON cd.community_id = c.id
                 WHERE c.name = $1
                 ORDER BY (cd.embedding <=> $2::vector) ASC
                 LIMIT 6`,
                [communityName, JSON.stringify(embedding)]
            );
        } catch (dbError: any) {
            console.error("Vector DB Error:", dbError.message);
            vectorRes = { rows: [] };
        }

        // --- STEP 5: GENERATE REPLY ---
        const contextDocs = vectorRes.rows.map((r: any) => r.content).join("\n\n");
        const fileLinks = foundFiles.map((f: any) => `- [Download ${f.title}](${f.file_url})`).join("\n");

        const chatModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const systemPrompt = `
        You are the Community Focus Assistant.
        **MANAGER:** ${manager.name} (${manager.email})
        **FILES:** ${foundFiles.length > 0 ? fileLinks : "None."}
        **CONTEXT:** ${contextDocs}

        **INSTRUCTIONS:**
        Answer the user's question using the Context. Be friendly and clear.
        `;

        const result = await chatModel.generateContent([
            { text: systemPrompt },
            { text: `User Question: ${message}` }
        ]);

        return NextResponse.json({ reply: result.response.text() });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}