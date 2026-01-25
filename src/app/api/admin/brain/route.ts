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
        const { query, community_id } = await request.json(); // Accepted community_id
        if (!query) return NextResponse.json({ error: "Query required" }, { status: 400 });

        // 2. Generate Embedding for the User's Question
        const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const result = await embeddingModel.embedContent(query);
        const embedding = result.embedding.values;

        // 3. Search Database (With Filter Logic)
        const client = await pool.connect();
        let searchRes;

        try {
            // IF community_id is provided, filter by it. ELSE, search everything.
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

        // 4. "RAG" - Generate a Natural Language Answer
        // We feed the top 5 relevant snippets to the AI and ask it to synthesize an answer.
        const generativeModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const contextText = sources.map(s => `SOURCE (${s.filename}): ${s.content}`).join("\n\n");

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

        const answerResult = await generativeModel.generateContent(prompt);
        const finalAnswer = answerResult.response.text();

        // Return both the natural answer AND the raw sources (for reference)
        return NextResponse.json({
            answer: finalAnswer,
            sources: sources
        });

    } catch (error: any) {
        console.error("Brain Search Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}