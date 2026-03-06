import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pool from '@/lib/db';
import { createClient } from '@supabase/supabase-js';
import { checkAdminAuth } from '@/lib/checkAuth';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// --- HELPERS ---
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function generateWithRetry(operation: () => Promise<any>, retries = 5) {
    for (let i = 0; i < retries; i++) {
        try {
            return await operation();
        } catch (error: any) {
            if ((error.status === 429 || error.status === 503 || error.message?.includes('429')) && i < retries - 1) {
                const baseWait = 10000 * Math.pow(2, i);
                const jitter = Math.random() * 2000;
                const waitTime = baseWait + jitter;

                console.log(`[Rate Limit] Hit 429/503. Pausing for ${Math.round(waitTime / 1000)}s before retry ${i + 1}/${retries}...`);
                await delay(waitTime);
                continue;
            }
            throw error;
        }
    }
    throw new Error("Max retries exceeded. API is too busy.");
}

function smartChunking(text: string, chunkSize = 2000, overlap = 200): string[] {
    const chunks: string[] = [];
    let start = 0;
    while (start < text.length) {
        let end = start + chunkSize;
        if (end < text.length) {
            const lastPeriod = text.lastIndexOf('.', end);
            const lastNewline = text.lastIndexOf('\n', end);
            const breakPoint = Math.max(lastPeriod, lastNewline);
            if (breakPoint > start + (chunkSize * 0.8)) end = breakPoint + 1;
        }
        const chunk = text.slice(start, end).trim();
        if (chunk.length > 50) chunks.push(chunk);
        start += (chunkSize - overlap);
        if (start >= text.length && chunks.length > 0) break;
    }
    return chunks;
}

// GET: List documents
export async function GET() {
    const auth = await checkAdminAuth();
    if (!auth.authorized) return auth.response;

    try {
        const result = await pool.query(`
            SELECT DISTINCT cd.filename, cd.community_id, c.name as real_community_name, MIN(cd.created_at) as created_at, COUNT(*) as chunk_count
            FROM community_docs cd
                     JOIN communities c ON cd.community_id = c.id
            GROUP BY cd.filename, cd.community_id, c.name
            ORDER BY created_at DESC
        `);

        const docs = result.rows.map(row => ({
            id: row.filename,
            filename: row.filename,
            community_id: row.community_id,
            community_name: row.real_community_name,
            chunk_count: row.chunk_count,
            created_at: row.created_at
        }));
        return NextResponse.json(docs);
    } catch (err) {
        return NextResponse.json([]);
    }
}

export async function POST(req: Request) {
    const auth = await checkAdminAuth();
    if (!auth.authorized) return auth.response;

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const communityId = formData.get('communityId') as string;

        if (!file || !communityId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

        console.log(`[Upload] Starting: ${file.name}`);

        // Clean up old version if exists
        await pool.query('DELETE FROM community_docs WHERE community_id = $1 AND filename = $2', [communityId, file.name]);

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        let text = '';

        if (file.name.match(/\.(txt|md)$/) || file.type.startsWith('text/')) {
            text = new TextDecoder("utf-8").decode(buffer);
        } else if (file.type === 'application/pdf') {
            console.log(`[OCR] Sending ${file.name} to Gemini...`);
            const visionModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const base64Data = buffer.toString('base64');
            try {
                const result = await generateWithRetry(() => visionModel.generateContent([
                    { inlineData: { data: base64Data, mimeType: "application/pdf" } },
                    `Transcribe the full text of this document verbatim. Return ONLY the text.`
                ]));
                text = result.response.text();
                console.log(`[OCR] Success. Extracted ${text.length} chars.`);
            } catch (err) {
                console.error("[OCR Failed]", err);
                return NextResponse.json({ error: "Google AI quota exceeded. Please wait 2 minutes and try again." }, { status: 500 });
            }
        } else {
            return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
        }

        if (!text?.trim()) return NextResponse.json({ error: "No text found." }, { status: 400 });

        const cleanFullText = text.replace(/\s+/g, " ").trim();
        const chunks = smartChunking(cleanFullText, 1000, 200);
        console.log(`[Embed] Created ${chunks.length} chunks. Saving to DB...`);

        const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
        let insertedCount = 0;

        for (const [index, chunk] of chunks.entries()) {
            try {
                const result = await generateWithRetry(() => embedModel.embedContent(chunk));
                const embedding = result.embedding.values;

                await pool.query(
                    `INSERT INTO community_docs (community_id, filename, content, embedding) VALUES ($1, $2, $3, $4)`,
                    [communityId, file.name, chunk, JSON.stringify(embedding)]
                );
                insertedCount++;
                await delay(1000);

                if (insertedCount % 5 === 0) console.log(`   Saved ${insertedCount}/${chunks.length} chunks...`);

            } catch (embedError) {
                console.error(`[Embed Error] Chunk ${index} skipped`, embedError);
            }
        }

        console.log(`[Success] Saved ${insertedCount} chunks for ${file.name}`);
        return NextResponse.json({ success: true, chunks: insertedCount });

    } catch (error: any) {
        console.error("Upload Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const auth = await checkAdminAuth();
    if (!auth.authorized) return auth.response;

    try {
        const { searchParams } = new URL(req.url);
        const filename = searchParams.get('id');
        const communityId = searchParams.get('communityId');

        if (!filename || !communityId) {
            return NextResponse.json({ error: "Filename and Community ID required" }, { status: 400 });
        }

        // 1. Get Community Slug (Needed for Supabase Storage Path)
        const commResult = await pool.query('SELECT slug FROM communities WHERE id = $1', [communityId]);
        if (commResult.rows.length === 0) {
            return NextResponse.json({ error: "Community not found" }, { status: 404 });
        }
        const slug = commResult.rows[0].slug;

        // 2. Initialize Supabase (Service Role for Admin Access)
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 3. Delete from Supabase Storage
        // Path format: "community-slug/filename.pdf"
        const storagePath = `${slug}/${filename}`;
        const { error: storageError } = await supabase.storage
            .from('community-files')
            .remove([storagePath]);

        if (storageError) {
            console.error("Storage Delete Error:", storageError);
            // We continue anyway to clean up the DB records
        }

        // 4. Delete Public Download Link (community_downloads)
        // We match by checking if the file_url ends with the filename OR if title matches
        await pool.query(`
            DELETE FROM community_downloads 
            WHERE community_id = $1 
            AND (file_url LIKE $2 OR title = $3)
        `, [communityId, `%/${filename}`, filename]);

        // 5. Delete AI Knowledge (community_docs)
        await pool.query(`
            DELETE FROM community_docs 
            WHERE community_id = $1 
            AND filename = $2
        `, [communityId, filename]);

        console.log(`[Delete] Successfully removed ${filename} for community ${communityId}`);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Delete Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}