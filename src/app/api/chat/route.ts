import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pool from '@/lib/db';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// OFFICE FALLBACK
const OFFICE_PHONE = "(919) 564-9134";
const OFFICE_EMAIL = "info@communityfocusnc.com";

// --- HELPER: RETRY LOGIC ---
async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
    try {
        return await fn();
    } catch (error: any) {
        if (retries > 0 && (error.status === 429 || error.message?.includes('429') || error.status === 503)) {
            console.warn(`Rate limit hit. Retrying in ${delay}ms... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return retryWithBackoff(fn, retries - 1, delay * 2);
        }
        throw error;
    }
}

export async function POST(request: Request) {
    try {
        const { message, history, communitySlug } = await request.json();

        if (!message || !communitySlug) {
            return NextResponse.json({ error: 'Message and Community Slug required' }, { status: 400 });
        }

        console.log(`\n--- NEW CHAT QUERY: "${message}" (Community Slug: ${communitySlug}) ---`);

        // --- STEP 1: ANALYZE INTENT ---
        // Using gemini-2.0-flash (Confirmed Available)
        const analyzerModel = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const analyzerPrompt = `
        You are a conversation analyzer.
        Context: User is asking about community ID: "${communitySlug}".
        Task: Extract intent and keywords.

        Output JSON:
        {
          "category": "Category",
          "is_neighbor_complaint": boolean,
          "document_keywords": "keywords if docs requested",
          "search_query": "search string",
          "topic": "short topic summary"
        }
        `;

        let analysis: any = {};
        try {
            const analysisResult = await retryWithBackoff(() => analyzerModel.generateContent([
                { text: analyzerPrompt },
                { text: `User History: ${JSON.stringify(history || [])}` },
                { text: `Current Message: ${message}` }
            ]));
            analysis = JSON.parse(analysisResult.response.text());
            if (Array.isArray(analysis)) analysis = analysis[0];
        } catch (e) {
            console.error("Analysis Failed (using defaults):", e);
            analysis = { category: "General", topic: "General Query", document_keywords: message };
        }

        const safeTopic = analysis.topic || "General Query";
        const safeSearchQuery = analysis.search_query || message;

        // --- STEP 2: EMBEDDINGS ---
        // Using "gemini-embedding-001" (Confirmed Available - 768 Dimensions)
        let embedding: number[] | null = null;
        try {
            const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
            const result = await retryWithBackoff(() => embeddingModel.embedContent(safeSearchQuery));
            embedding = result.embedding.values;

            // DIAGNOSTIC LOG
            if (embedding) {
                console.log(`✅ Embedding Generated. Dimensions: ${embedding.length}`);
                if (embedding.length !== 768) {
                    console.error(`❌ CRITICAL: Expected 768 dimensions, got ${embedding.length}. DB Insert will likely fail.`);
                }
            }
        } catch (e) {
            console.warn("Embedding Failed (Switching to Keyword Search):", e);
            embedding = null;
        }

        // --- STEP 3: SEARCH DATABASE ---
        let vectorRes;

        // Wrap DB query in try/catch to handle Vector Dimension Mismatch specifically
        try {
            if (embedding) {
                // Vector Search
                vectorRes = await pool.query(
                    `SELECT cd.content, c.name as community_name
                     FROM community_docs cd
                     JOIN communities c ON cd.community_id = c.id
                     WHERE c.slug = $1
                     ORDER BY (cd.embedding <=> $2::vector) ASC
                     LIMIT 6`,
                    [communitySlug, JSON.stringify(embedding)]
                );
            } else {
                throw new Error("No embedding generated");
            }
        } catch (dbError: any) {
            console.error("⚠️ Vector Search Failed (Falling back to Keywords):", dbError.message);
            // Fallback to Keyword Search
            const keyword = safeTopic.split(' ').find((w: string) => w.length > 4) || message;
            vectorRes = await pool.query(
                `SELECT cd.content, c.name as community_name
                 FROM community_docs cd
                 JOIN communities c ON cd.community_id = c.id
                 WHERE c.slug = $1
                 AND cd.content ILIKE $2
                 LIMIT 6`,
                [communitySlug, `%${keyword}%`]
            );
        }

        // Fetch Manager & Files
        const [managerRes, filesRes] = await Promise.all([
            pool.query(`SELECT m.name, m.email, m.phone FROM managers m JOIN communities c ON c.manager_id = m.id WHERE c.slug = $1`, [communitySlug]),
            pool.query(
                `SELECT title, file_url FROM community_downloads cd
                 JOIN communities c ON cd.community_id = c.id
                 WHERE c.slug = $1 AND (title ILIKE $2 OR category ILIKE $2)
                 LIMIT 5`,
                 [communitySlug, `%${safeTopic}%`]
            )
        ]);

        const manager = managerRes.rows[0] || { name: 'The Office', email: OFFICE_EMAIL, phone: OFFICE_PHONE };
        const foundFiles = filesRes.rows;
        // Handle case where vectorRes might be undefined if both attempts completely crash (unlikely but safe)
        const contextDocs = vectorRes?.rows ? vectorRes.rows.map(r => r.content).join("\n\n") : "";
        const fileLinks = foundFiles.map(f => `- [Download ${f.title}](${f.file_url})`).join("\n");
        const displayCommName = vectorRes?.rows[0]?.community_name || communitySlug;

        // --- STEP 4: GENERATE ANSWER ---
        const chatModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const systemPrompt = `
        You are the Community Focus Assistant for ${displayCommName}.

        **MANAGER CONTACT:**
        - Name: ${manager.name}
        - Email: ${manager.email || OFFICE_EMAIL}
        - Phone: ${manager.phone || OFFICE_PHONE}

        **AVAILABLE FILES:**
        ${foundFiles.length > 0 ? fileLinks : "No specific files found."}

        **CONTEXT INFO:**
        ${contextDocs || "No specific database info found for this query."}

        **INSTRUCTIONS:**
        1. Answer based on the Context Info above.
        2. If the answer isn't in the context, guide them to contact the manager.
        3. If asking for a document, provide the download links above if they match.
        `;

        const result = await retryWithBackoff(() => chatModel.generateContent([
            { text: systemPrompt },
            { text: `User Question: ${message}` }
        ]));

        return NextResponse.json({ reply: result.response.text() });

    } catch (error: any) {
        console.error('Chat API Fatal Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}