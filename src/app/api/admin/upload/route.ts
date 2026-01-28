import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- CONFIG ---
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
    let clean = filename.replace(/\.(pdf|txt)$/i, '');
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

    if (lower.includes('article') && lower.includes('incorp'))
        return { slug: `articles${extension}`, title: 'Articles of Incorporation', category: 'Governing' };
    if (lower.includes('bylaw'))
        return { slug: `bylaws${extension}`, title: 'Bylaws', category: 'Governing' };
    if (lower.includes('ccr') || lower.includes('declaration') || lower.includes('covenant'))
        return { slug: `ccrs${extension}`, title: 'Declaration of Covenants (CCRs)', category: 'Governing' };
    if (lower.includes('rule') || lower.includes('reg'))
        return { slug: `rules-and-regs${extension}`, title: 'Rules & Regulations', category: 'Governing' };

    if (lower.includes('arc') || lower.includes('architect') || lower.includes('acc')) {
        const humanTitle = humanizeTitle(filename);
        if (lower.includes('guide') || lower.includes('standard'))
            return { slug: `arc-guidelines${extension}`, title: 'Architectural Guidelines', category: 'Governing' };
        return { slug: `arc-form${extension}`, title: humanTitle, category: 'Forms' };
    }

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
            const smartDetails = getSmartDetails(file.name);

            if (customTitle && customTitle.trim()) {
                finalTitle = customTitle.trim();
                finalSlug = finalTitle.toLowerCase()
                        .replace(/[^a-z0-9]/g, '-')
                        .replace(/-+/g, '-')
                        .replace(/^-|-$/g, '')
                    + extension;
            } else {
                finalTitle = smartDetails.title;
                finalSlug = smartDetails.slug;
            }

            if (manualCategory && manualCategory !== 'Auto') {
                category = manualCategory;
            } else if (customTitle) {
                const lowerTitle = finalTitle.toLowerCase();
                if (lowerTitle.includes('bylaw') || lowerTitle.includes('rule') || lowerTitle.includes('ccr')) {
                    category = 'Governing';
                } else if (lowerTitle.includes('form') || lowerTitle.includes('application')) {
                    category = 'Forms';
                } else {
                    category = smartDetails.category;
                }
            } else {
                category = smartDetails.category;
            }

            // --- COLLISION DETECTION ---
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

            // --- 1. UPLOAD TO STORAGE (FAULT TOLERANT) ---
            const storagePath = `${communitySlug}/${finalSlug}`;
            const fileBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(fileBuffer);
            const mimeType = extension === '.txt' ? 'text/plain' : 'application/pdf';

            let publicUrl = '';
            let uploadSuccess = false;

            try {
                console.log(`[Upload] Attempting Supabase upload to: ${storagePath}`);
                const { error: uploadError } = await supabase.storage
                    .from('community-files')
                    .upload(storagePath, buffer, { upsert: true, contentType: mimeType });

                if (uploadError) {
                    console.error("❌ SUPABASE UPLOAD FAILED:", uploadError);
                    // Do not throw; continue so we can still embed the text!
                } else {
                    const { data } = supabase.storage.from('community-files').getPublicUrl(storagePath);
                    publicUrl = data.publicUrl;
                    uploadSuccess = true;
                    console.log(`✅ Supabase upload success: ${publicUrl}`);
                }
            } catch (supaCrash) {
                console.error("❌ SUPABASE CRASHED:", supaCrash);
            }

            // --- 2. DB INSERT (Downloads / Public Link) ---
            // Only insert into downloads if we actually have a file link, OR use a placeholder if you prefer
            if (uploadSuccess && publicUrl) {
                await client.query(
                    `INSERT INTO community_downloads (community_id, title, category, file_url)
                     VALUES ($1, $2, $3, $4)`,
                    [communityId, finalTitle, category, publicUrl]
                );
            } else {
                console.warn("⚠️ Skipping 'community_downloads' insert because file upload failed.");
            }

            // --- 3. AI CHUNKING & EMBEDDING (BRAIN) ---
            // This runs regardless of Supabase status
            const textToProcess = `[DOCUMENT: ${finalTitle} for ${communityName}]\n${extractedText || "(No text content)"}`;
            const chunks = smartChunking(textToProcess);
            console.log(`[AI] Processing ${chunks.length} chunks for Brain...`);

            // Using text-embedding-004 (Native 768 Dimensions)
            const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
            let insertedCount = 0;

            for (const chunk of chunks) {
                try {
                    const result = await embedModel.embedContent(chunk);
                    const embedding = result.embedding.values;

                    // Validate Dimensions before Insert
                    if (embedding.length !== 768) {
                        console.warn(`⚠️ Warning: Model returned ${embedding.length} dimensions. DB expects 768.`);
                    }

                    await client.query(
                        `INSERT INTO community_docs (community_id, filename, content, embedding, created_at)
                         VALUES ($1, $2, $3, $4, NOW())`,
                        [communityId, finalSlug, chunk, JSON.stringify(embedding)]
                    );
                    insertedCount++;
                } catch (embedError: any) {
                    console.error(`[AI Error] Failed to embed chunk:`, embedError.message);
                }
            }

            return NextResponse.json({
                success: true,
                storageSuccess: uploadSuccess, // Tell UI if storage worked
                url: publicUrl,
                title: finalTitle,
                chunks: insertedCount,
                message: uploadSuccess
                    ? "File uploaded and processed successfully."
                    : "File storage failed, but document was added to AI Brain."
            });

        } finally {
            client.release();
        }

    } catch (error: any) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}