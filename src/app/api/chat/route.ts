import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pool from '@/lib/db';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const OFFICE_PHONE = "(919) 564-9134";
const OFFICE_EMAIL = "info@communityfocusnc.com";
const MASTER_WORK_ORDER_URL = "https://cfnc.cincwebaxis.com/workorders";

// --- RESTORED HELPER: RETRY LOGIC ---
async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
    try {
        return await fn();
    } catch (error: any) {
        if (retries > 0 && (error.status === 429 || error.message?.includes('429') || error.status === 503)) {
            console.warn(`⚠️ Rate limit hit. Retrying in ${delay}ms... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return retryWithBackoff(fn, retries - 1, delay * 2);
        }
        throw error;
    }
}

export async function POST(request: Request) {
    try {
        const { message, history, communityName } = await request.json();

        if (!message || !communityName) {
            return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
        }

        // --- 1. INTENT ANALYSIS ---
        const analyzerModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash", generationConfig: { responseMimeType: "application/json" } });
        let analysis: any = {};

        try {
            const prompt = `User asking about "${communityName}". Extract keywords. Output JSON: { "topic": "summary", "keywords": "search terms" }`;
            const res = await retryWithBackoff(() => analyzerModel.generateContent([
                { text: prompt },
                { text: `History: ${JSON.stringify(history?.slice(-2) || [])}` }, // Context aware
                { text: message }
            ]));
            analysis = JSON.parse(res.response.text());
            if(Array.isArray(analysis)) analysis = analysis[0];
        } catch (e) {
            console.error("Analysis failed, using fallback", e);
            analysis = { topic: "General", keywords: message };
        }

        const keywords = (analysis.keywords || message).replace(/[^\w\s]/g, '').trim();

        // --- 2. EMBEDDING (Standard Gemini 001) ---
        const embedModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

        // --- 3. PARALLEL DATA FETCH (Global + Local) ---
        let embedding = null;
        let manager = { name: 'The Office', email: OFFICE_EMAIL, phone: OFFICE_PHONE };
        let foundFiles = [];
        let contextRows = [];

        try {
            const [embedRes, managerRes, filesRes, globalIdRes] = await Promise.all([
                retryWithBackoff(() => embedModel.embedContent(keywords)),
                pool.query(`SELECT m.name, m.email, m.phone FROM managers m JOIN communities c ON c.manager_id = m.id WHERE c.name = $1`, [communityName]),
                pool.query(`
                    SELECT title, file_url
                    FROM community_downloads cd
                    JOIN communities c ON cd.community_id = c.id
                    WHERE c.name = $1
                    AND is_hidden = false
                    AND (title ILIKE $2 OR category ILIKE $2)
                    LIMIT 5
                `, [communityName, `%${keywords}%`]),
                pool.query(`SELECT id FROM communities WHERE slug = 'global'`)
            ]);

            embedding = embedRes.embedding.values;
            if (managerRes.rows.length > 0) manager = managerRes.rows[0];
            foundFiles = filesRes.rows;
            const globalId = globalIdRes.rows[0]?.id;

            // --- 4. HYBRID SEARCH (GLOBAL + LOCAL) ---

            // A. Vector Search
            let vectorDocs: any[] = [];
            try {
                const vectorQuery = await pool.query(
                    `SELECT cd.content, c.name as community_name
                     FROM community_docs cd
                     JOIN communities c ON cd.community_id = c.id
                     WHERE (c.name = $1 OR c.id = $3)
                     ORDER BY (cd.embedding <=> $2::vector) ASC
                     LIMIT 6`,
                    [communityName, JSON.stringify(embedding), globalId]
                );
                vectorDocs = vectorQuery.rows;
            } catch (e) { console.warn("Vector fail (likely empty embeddings)", e); }

            // B. Keyword Fallback
            let keywordDocs: any[] = [];
            try {
                const keywordQuery = await pool.query(
                    `SELECT cd.content, c.name as community_name
                     FROM community_docs cd
                     JOIN communities c ON cd.community_id = c.id
                     WHERE (c.name = $1 OR c.id = $3)
                     AND cd.content ILIKE $2
                     LIMIT 4`,
                    [communityName, `%${keywords.split(' ')[0]}%`, globalId]
                );
                keywordDocs = keywordQuery.rows;
            } catch (e) { console.warn("Keyword search fail", e); }

            // Merge & Dedupe
            const allDocs = [...vectorDocs, ...keywordDocs];
            // Deduplicate by content to avoid repeating the same paragraph
            const uniqueDocs = Array.from(new Set(allDocs.map(a => a.content))).map(c => allDocs.find(a => a.content === c));
            contextRows = uniqueDocs.slice(0, 10); // Generous context window

        } catch (e: any) {
            console.error("Critical Data Fetch Error", e);
            return NextResponse.json({ reply: "I'm having trouble connecting to the database right now. Please try again in a moment." });
        }

        // --- 5. GENERATE REPLY (WALDO PROMPT) ---
        const contextText = contextRows.map((r: any) => `[SOURCE: ${r.community_name}] ${r.content}`).join("\n\n");
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
        ${contextText || "No specific text passages found."}

        **--- USER QUESTION ---**
        "${message}"

        **--- INSTRUCTIONS ---**
        1.  **Be Direct & Plain-Spoken:**
            - Answer the question directly using the Knowledge Base.
            - **Global vs. Local:** If info comes from "[SOURCE: Global Knowledge]", treat it as a general rule. If a "[SOURCE: ${communityName}]" rule contradicts it, the Local rule wins.
            - **Translate Legalese:** If the text says "erected," say "built." If it says "vehicular ingress," say "driving in." Speak like a helpful neighbor, not a lawyer.

        2.  **Document Handling:**
            - If the user asks for a form and you see it in "RELEVANT FILES," explicitly say: "You can download the form here: [Link]."
            - If the file is NOT there, say: "I don't have a digital copy handy, but you can request one from ${manager.name}."

        3.  **Submission Logic:**
            - If the user asks how to submit a form (especially Architectural/ARC), instruct them: **"Please complete the form and submit it through the [Cinc Systems Portal](https://cfnc.cincwebaxis.com/)."**
            - Do not suggest emailing the manager for submissions unless the Knowledge Base explicitly overrides this.

        4.  **The "I Don't Know" Fallback:**
            - If the answer is not in the Knowledge Base, **DO NOT** say "I cannot answer."
            - **Instead, say:** "I don't have that specific rule in my database, but ${manager.name} can clarify that for you. You can reach them at ${manager.email}."

        5.  **Formatting:**
            - Use **bold** for key terms or deadlines.
            - Use bullet points if listing multiple steps or rules.
        `;

        const result = await retryWithBackoff(() => chatModel.generateContent([
            { text: systemPrompt },
            { text: message }
        ]));

        return NextResponse.json({ reply: result.response.text() });

    } catch (error: any) {
        console.error("Fatal Chat Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}