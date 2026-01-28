import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pool from '@/lib/db';
import { checkAdminAuth } from '@/lib/checkAuth';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
    try {
        return await fn();
    } catch (error: any) {
        if (retries > 0 && (error.status === 429 || error.message?.includes('429') || error.status === 503)) {
            console.warn(`Rate limit hit. Retrying in ${delay}ms...`);
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

        // 1. Try Embedding
        let embedding: number[] | null = null;
        try {
            // FIX: Using "gemini-embedding-001"
            const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
            const result = await retryWithBackoff(() => embeddingModel.embedContent(query));
            embedding = result.embedding.values;
        } catch (e) {
            console.warn("Brain Embedding Failed - Switching to Keyword Search Mode");
            embedding = null;
        }

        // 2. Search Database (Vector OR Keyword)
        const client = await pool.connect();
        let sources: any[] = [];

        try {
            if (embedding) {
                // Vector Search
                const sql = `
                    SELECT cd.content, cd.filename, c.name as community_name
                    FROM community_docs cd
                    JOIN communities c ON cd.community_id = c.id
                    ${community_id ? `WHERE cd.community_id = $2` : ''}
                    ORDER BY (cd.embedding <=> $1::vector) ASC
                    LIMIT 5
                `;
                const params = community_id ? [JSON.stringify(embedding), community_id] : [JSON.stringify(embedding)];
                const res = await client.query(sql, params);
                sources = res.rows;
            } else {
                // Keyword Search Fallback
                console.log("Using Keyword Search Fallback for Brain...");
                const sql = `
                    SELECT cd.content, cd.filename, c.name as community_name
                    FROM community_docs cd
                    JOIN communities c ON cd.community_id = c.id
                    WHERE (cd.content ILIKE $1 OR cd.filename ILIKE $1)
                    ${community_id ? `AND cd.community_id = $2` : ''}
                    LIMIT 5
                `;
                const params = community_id ? [`%${query}%`, community_id] : [`%${query}%`];
                const res = await client.query(sql, params);
                sources = res.rows;
            }
        } finally {
            client.release();
        }

        // 3. Generate Answer
        // FIX: Using "gemini-2.0-flash"
        const generativeModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const contextText = sources.map((s: any) => `SOURCE (${s.filename}): ${s.content}`).join("\n\n");

        const prompt = `
            You are an expert Community Association Manager assistant.
            Answer the user's question based strictly on the context provided below.

            Question: ${query}

            Context:
            ${contextText || "No relevant documents found."}
        `;

        const answerResult = await retryWithBackoff(() => generativeModel.generateContent(prompt));

        return NextResponse.json({
            answer: answerResult.response.text(),
            sources: sources
        });

    } catch (error: any) {
        console.error("Brain Search Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}