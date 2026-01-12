import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- CONFIG ---
// Allow up to 60 seconds for Embedding/Uploads
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// --- HELPER: Smart Chunking (For AI) ---
function smartChunking(text: string, chunkSize = 1000, overlap = 200): string[] {
    const chunks: string[] = [];
    let start = 0;
    while (start < text.length) {
        let end = start + chunkSize;
        if (end < text.length) {
            // Try to break at a period or newline
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

// --- HELPER: Humanize Filenames ---
function humanizeTitle(filename: string): string {
    let clean = filename.replace(/\.(pdf|txt)$/i, ''); // Handle .pdf OR .txt
    clean = clean.replace(/[-_]/g, ' ');
    const noiseWords = [/HOA/gi, /Scan/gi, /Final/gi, /Version/gi, / v\d+/gi];
    noiseWords.forEach(regex => {
        clean = clean.replace(regex, '');
    });
    return clean.replace(/\s+/g, ' ').trim();
}

// --- HELPER: Smart Categorization & Naming ---
function getSmartDetails(filename: string) {
    const lower = filename.toLowerCase();
    const extension = filename.toLowerCase().endsWith('.txt') ? '.txt' : '.pdf';

    // 1. Governing Docs
    if (lower.includes('article') && lower.includes('incorp'))
        return { slug: `articles${extension}`, title: 'Articles of Incorporation', category: 'Governing' };
    if (lower.includes('bylaw'))
        return { slug: `bylaws${extension}`, title: 'Bylaws', category: 'Governing' };
    if (lower.includes('ccr') || lower.includes('declaration') || lower.includes('covenant'))
        return { slug: `ccrs${extension}`, title: 'Declaration of Covenants (CCRs)', category: 'Governing' };
    if (lower.includes('rule') || lower.includes('reg'))
        return { slug: `rules-and-regs${extension}`, title: 'Rules & Regulations', category: 'Governing' };

    // 2. ARC
    if (lower.includes('arc') || lower.includes('architect') || lower.includes('acc')) {
        const humanTitle = humanizeTitle(filename);
        if (lower.includes('guide') || lower.includes('standard'))
            return { slug: `arc-guidelines${extension}`, title: 'Architectural Guidelines', category: 'Governing' };
        return { slug: `arc-form${extension}`, title: humanTitle, category: 'Forms' };
    }

    // 3. Fallback
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

        if (!file || !communitySlug) {
            return NextResponse.json({ error: 'Missing file or community' }, { status: 400 });
        }

        const client = await pool.connect();
        try {
            const commResult = await client.query('SELECT id, name FROM communities WHERE slug = $1', [communitySlug]);
            if (commResult.rows.length === 0) throw new Error('Community not found');

            const communityId = commResult.rows[0].id;
            const communityName = commResult.rows[0].name;

            // --- NAMING LOGIC ---
            let finalSlug = '';
            let finalTitle = '';
            let category = 'General';
            const extension = file.name.toLowerCase().endsWith('.txt') ? '.txt' : '.pdf';

            if (customTitle && customTitle.trim()) {
                finalTitle = customTitle.trim();
                finalSlug = finalTitle.toLowerCase()
                        .replace(/[^a-z0-9]/g, '-')
                        .replace(/-+/g, '-')
                        .replace(/^-|-$/g, '')
                    + extension;

                const lowerTitle = finalTitle.toLowerCase();
                if (lowerTitle.includes('bylaw') || lowerTitle.includes('rule') || lowerTitle.includes('ccr') || lowerTitle.includes('declaration')) {
                    category = 'Governing';
                } else if (lowerTitle.includes('form') || lowerTitle.includes('application')) {
                    category = 'Forms';
                }
            } else {
                const smartDetails = getSmartDetails(file.name);
                finalSlug = smartDetails.slug;
                finalTitle = smartDetails.title;
                category = smartDetails.category;
            }

            // --- COLLISION DETECTION ---
            let counter = 1;
            let isUnique = false;
            const baseSlug = finalSlug;
            const baseTitle = finalTitle;

            while (!isUnique) {
                const checkRes = await client.query(
                    `SELECT id FROM community_downloads
                     WHERE community_id = $1
                       AND (title = $2 OR file_url LIKE $3)`,
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

            const storagePath = `${communitySlug}/${finalSlug}`;

            // --- 1. UPLOAD TO STORAGE ---
            const fileBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(fileBuffer);

            // Determine content type
            const mimeType = extension === '.txt' ? 'text/plain' : 'application/pdf';

            const { error: uploadError } = await supabase.storage
                .from('community-files')
                .upload(storagePath, buffer, { upsert: true, contentType: mimeType });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('community-files').getPublicUrl(storagePath);

            // --- 2. DB INSERT (Downloads / Public Link) ---
            await client.query(
                `INSERT INTO community_downloads (community_id, title, category, file_url)
                 VALUES ($1, $2, $3, $4)`,
                [communityId, finalTitle, category, publicUrl]
            );

            // --- 3. AI CHUNKING & EMBEDDING ---
            const textToProcess = `[DOCUMENT: ${finalTitle} for ${communityName}]\n${extractedText || "(No text content)"}`;

            // Chunk the text
            const chunks = smartChunking(textToProcess);
            console.log(`[AI] Processing ${chunks.length} chunks for ${finalSlug}`);

            const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
            let insertedCount = 0;

            // Loop through chunks and insert with embedding
            for (const chunk of chunks) {
                try {
                    // Generate Vector
                    const result = await embedModel.embedContent(chunk);
                    const embedding = result.embedding.values;

                    await client.query(
                        `INSERT INTO community_docs (community_id, filename, content, embedding, created_at)
                         VALUES ($1, $2, $3, $4, NOW())`,
                        [communityId, finalSlug, chunk, JSON.stringify(embedding)]
                    );
                    insertedCount++;
                } catch (embedError) {
                    console.error(`[AI Error] Failed to embed chunk for ${finalSlug}`, embedError);
                    // Continue to next chunk even if one fails
                }
            }

            return NextResponse.json({
                success: true,
                url: publicUrl,
                title: finalTitle,
                chunks: insertedCount
            });

        } finally {
            client.release();
        }

    } catch (error: any) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}