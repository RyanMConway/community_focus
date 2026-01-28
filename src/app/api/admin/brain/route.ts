import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pool from '@/lib/db';
import { checkAdminAuth } from '@/lib/checkAuth';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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
    const auth = await checkAdminAuth();
    if (!auth.authorized) return auth.response;

    try {
        const { query, community_id } = await request.json();
        if (!query) return NextResponse.json({ error: "Query required" }, { status: 400 });

        // 2. Generate Embedding (With Retry)
        const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const result = await retryWithBackoff(() => embeddingModel.embedContent(query));
        const embedding = result.embedding.values;

        // 3. Search Database
        const client = await pool.connect();
        let searchRes;

        try {
            if (community_id && community_id !== "") {
                searchRes = await client.query(
                    `SELECT cd.content, cd.filename, c.name as community_name, (cd.embedding <=> $1::vector) as distance
                     FROM community_docs cd
                     JOIN communities c ON cd.community_id = c.id
                     WHERE cd.community_id = $2
                     ORDER BY distance ASC
                     LIMIT 5`,
                    [JSON.stringify(embedding), community_id]
                );
            } else {
                searchRes = await client.query(
                    `SELECT cd.content, cd.filename, c.name as community_name, (cd.embedding <=> $1::vector) as distance
                     FROM community_docs cd
                     JOIN communities c ON cd.community_id = c.id
                     ORDER BY distance ASC
                     LIMIT 5`,
                    [JSON.stringify(embedding)]
                );
            }
        } finally {
            client.release();
        }

        const sources = searchRes.rows;

        // 4. "RAG" - Generate Answer (With Retry)
        const generativeModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const contextText = sources.map((s: any) => `SOURCE (${s.filename}): ${s.content}`).join("\n\n");

        const prompt = `
            You are an expert Community Association Manager assistant.
            Answer the user's question based strictly on the context provided below.

            Rules:
            1. If the answer is not in the context, state "I could not find that information in the documents."
            2. Do not make up information.
            3. Cite the filename in parentheses if you use information from a specific source.

            Question: ${query}

            Context:
            ${contextText}
        `;

        const answerResult = await retryWithBackoff(() => generativeModel.generateContent(prompt));
        const finalAnswer = answerResult.response.text();

        return NextResponse.json({
            answer: finalAnswer,
            sources: sources
        });

    } catch (error: any) {
        console.error("Brain Search Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}