import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pool from '@/lib/db';
import { checkAdminAuth } from '@/lib/checkAuth';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
    // 1. Security Check
    const auth = await checkAdminAuth();
    if (!auth.authorized) return auth.response;

    try {
        const { query } = await request.json();
        if (!query) return NextResponse.json({ error: "Query required" }, { status: 400 });

        // 2. Generate Embedding for the Admin's Query
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const result = await model.embedContent(query);
        const embedding = result.embedding.values;

        // 3. Search the Entire Database (No Community Filter)
        const client = await pool.connect();
        try {
            const searchRes = await client.query(
                `SELECT cd.content, cd.filename, c.name as community_name, (cd.embedding <=> $1::vector) as distance
                 FROM community_docs cd
                 JOIN communities c ON cd.community_id = c.id
                 ORDER BY distance ASC
                 LIMIT 8`,
                [JSON.stringify(embedding)]
            );

            return NextResponse.json({ results: searchRes.rows });
        } finally {
            client.release();
        }

    } catch (error: any) {
        console.error("Brain Search Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}