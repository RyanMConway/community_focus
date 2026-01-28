import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// --- HELPER: Smart Chunking ---
function smartChunking(text: string, chunkSize = 1000, overlap = 200): string[] {
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

function humanizeTitle(filename: string): string {
    let clean = filename.replace(/\.(pdf|txt)$/i, '');
    clean = clean.replace(/[-_]/g, ' ');
    const noiseWords = [/HOA/gi, /Scan/gi, /Final/gi, /Version/gi, / v\d+/gi];
    noiseWords.forEach(regex => {
        clean = clean.replace(regex, '');
    });
    return clean.replace(/\s+/g, ' ').trim();
}

function getSmartDetails(filename: string) {
    const lower = filename.toLowerCase();
    const extension = filename.toLowerCase().endsWith('.txt') ? '.txt' : '.pdf';

    // Categorization
    if (lower.includes('article') && lower.includes('incorp'))
        return { slug: `articles${extension}`, title: 'Articles of Incorporation', category: 'Governing' };
    if (lower.includes('bylaw'))
        return { slug: `bylaws${extension}`, title: 'Bylaws', category: 'Governing' };
    if (lower.includes('ccr') || lower.includes('declaration') || lower.includes('covenant'))
        return { slug: `ccrs${extension}`, title: 'Declaration of Covenants (CCRs)', category: 'Governing' };

    const humanTitle = humanizeTitle(filename);
    const safeSlug = filename.replace(/\.(pdf|txt)$/i, '').replace(/[^a-z0-9]/gi, '-').toLowerCase() + extension;
    return { slug: safeSlug, title: humanTitle, category: 'General' };
}

export async function POST(req: NextRequest) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const formData = await req.formData();
        const file = formData.get('file') as File;
        const communitySlug = formData.get('communitySlug') as string;
        const customTitle = formData.get('customTitle') as string;
        const extractedText = formData.get('extractedText') as string;
        const manualCategory = formData.get('category') as string;
        const isHidden = formData.get('isHidden') === 'true'; // New: Visibility

        if (!file || !communitySlug) {
            return NextResponse.json({ error: 'Missing file or community' }, { status: 400 });
        }

        const client = await pool.connect();
        try {
            // Find Community ID (Works for 'global' too)
            const commResult = await client.query('SELECT id, name FROM communities WHERE slug = $1', [communitySlug]);
            if (commResult.rows.length === 0) throw new Error('Community not found');

            const communityId = commResult.rows[0].id;
            const communityName = commResult.rows[0].name;

            // Naming & Category Logic
            const smartDetails = getSmartDetails(file.name);
            const extension = file.name.toLowerCase().endsWith('.txt') ? '.txt' : '.pdf';

            let finalTitle = customTitle?.trim() || smartDetails.title;
            let finalSlug = (customTitle ? customTitle.toLowerCase().replace(/[^a-z0-9]/g, '-') : smartDetails.slug);
            if (!finalSlug.endsWith(extension)) finalSlug += extension;

            let category = (manualCategory && manualCategory !== 'Auto') ? manualCategory : smartDetails.category;

            // Collision Detection
            let counter = 1;
            let isUnique = false;
            const baseSlug = finalSlug;
            const baseTitle = finalTitle;
            while (!isUnique) {
                const checkRes = await client.query(
                    `SELECT id FROM community_downloads WHERE community_id = $1 AND (title = $2 OR file_url LIKE $3)`,
                    [communityId, finalTitle, `%/${finalSlug}`]
                );
                if (checkRes.rows.length > 0) {
                    counter++;
                    finalSlug = baseSlug.replace(extension, `-${counter}${extension}`);
                    finalTitle = `${baseTitle} (v${counter})`;
                } else {
                    isUnique = true;
                }
            }

            // 1. Upload to Supabase (Fault Tolerant)
            const storagePath = `${communitySlug}/${finalSlug}`;
            const fileBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(fileBuffer);
            const mimeType = extension === '.txt' ? 'text/plain' : 'application/pdf';

            let publicUrl = '';
            let uploadSuccess = false;

            try {
                const { error: uploadError } = await supabase.storage
                    .from('community-files')
                    .upload(storagePath, buffer, { upsert: true, contentType: mimeType });

                if (!uploadError) {
                    const { data } = supabase.storage.from('community-files').getPublicUrl(storagePath);
                    publicUrl = data.publicUrl;
                    uploadSuccess = true;
                }
            } catch (e) {
                console.error("Supabase Upload Error (Continuing...)", e);
            }

            // 2. Insert into Downloads
            if (uploadSuccess && publicUrl) {
                await client.query(
                    `INSERT INTO community_downloads (community_id, title, category, file_url, is_hidden)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [communityId, finalTitle, category, publicUrl, isHidden]
                );
            }

            // 3. AI Embedding (Brain)
            const textToProcess = `[DOCUMENT: ${finalTitle} for ${communityName}]\n${extractedText || "(No text content)"}`;
            const chunks = smartChunking(textToProcess);

            // Using gemini-embedding-001 (Works with your API Key)
            const embedModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

            for (const chunk of chunks) {
                try {
                    const result = await embedModel.embedContent(chunk);
                    const embedding = result.embedding.values;

                    await client.query(
                        `INSERT INTO community_docs (community_id, filename, content, embedding, created_at)
                         VALUES ($1, $2, $3, $4, NOW())`,
                        [communityId, finalSlug, chunk, JSON.stringify(embedding)]
                    );
                } catch (e) {
                    console.error("Embedding chunk failed", e);
                }
            }

            return NextResponse.json({
                success: true,
                message: uploadSuccess
                    ? "File uploaded and processed successfully."
                    : "File storage failed, but AI Brain was updated."
            });

        } finally {
            client.release();
        }

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}