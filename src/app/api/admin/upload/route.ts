import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { createClient } from '@supabase/supabase-js';
import PDFParser from 'pdf2json';

// --- HELPER: Humanize Messy Filenames ---
function humanizeTitle(filename: string): string {
    let clean = filename.replace(/\.pdf$/i, '');
    clean = clean.replace(/[-_]/g, ' ');
    const noiseWords = [/HOA/gi, /Scan/gi, /Final/gi, /Version/gi, / v\d+/gi];
    noiseWords.forEach(regex => {
        clean = clean.replace(regex, '');
    });
    return clean.replace(/\s+/g, ' ').trim();
}

// --- HELPER: Smart Categorization ---
function getSmartDetails(filename: string) {
    const lower = filename.toLowerCase();

    // 1. Governing Docs
    if (lower.includes('article') && lower.includes('incorp'))
        return { slug: 'articles.pdf', title: 'Articles of Incorporation', category: 'Governing' };
    if (lower.includes('bylaw'))
        return { slug: 'bylaws.pdf', title: 'Bylaws', category: 'Governing' };
    if (lower.includes('ccr') || lower.includes('declaration') || lower.includes('covenant'))
        return { slug: 'ccrs.pdf', title: 'Declaration of Covenants (CCRs)', category: 'Governing' };
    if (lower.includes('rule') || lower.includes('reg'))
        return { slug: 'rules-and-regs.pdf', title: 'Rules & Regulations', category: 'Governing' };

    // 2. ARC
    if (lower.includes('arc') || lower.includes('architect') || lower.includes('acc')) {
        const humanTitle = humanizeTitle(filename);
        if (lower.includes('guide') || lower.includes('standard'))
            return { slug: 'arc-guidelines.pdf', title: 'Architectural Guidelines', category: 'Governing' };
        return { slug: 'arc-form.pdf', title: humanTitle, category: 'Forms' };
    }

    // 3. Fallback
    const humanTitle = humanizeTitle(filename);
    const safeSlug = filename.replace(/\.pdf$/i, '').replace(/[^a-z0-9]/gi, '-').toLowerCase() + '.pdf';
    return { slug: safeSlug, title: humanTitle, category: 'General' };
}

// --- HELPER: Extract Text with Page Numbers ---
async function parsePDF(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(null, true);
        pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
        pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
            let parsedText = "";
            pdfData.formImage.Pages.forEach((page: any, pageIndex: number) => {
                const pageNum = pageIndex + 1;
                parsedText += `\n--- [PAGE ${pageNum}] ---\n`;
                page.Texts.forEach((textItem: any) => {
                    const textSnippet = decodeURIComponent(textItem.R[0].T);
                    parsedText += textSnippet + " ";
                });
            });
            resolve(parsedText);
        });
        pdfParser.parseBuffer(buffer);
    });
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
        const customTitle = formData.get('customTitle') as string; // <--- NEW

        if (!file || !communitySlug) {
            return NextResponse.json({ error: 'Missing file or community' }, { status: 400 });
        }

        const client = await pool.connect();
        try {
            const commResult = await client.query('SELECT id, name FROM communities WHERE slug = $1', [communitySlug]);
            if (commResult.rows.length === 0) throw new Error('Community not found');

            const communityId = commResult.rows[0].id;
            const communityName = commResult.rows[0].name;

            let finalSlug = '';
            let finalTitle = '';
            let category = 'General';

            // --- LOGIC SPLIT: Manual vs Auto ---
            if (customTitle && customTitle.trim()) {
                // A. MANUAL OVERRIDE
                finalTitle = customTitle.trim();

                // Create a clean slug from the MANUAL title
                finalSlug = finalTitle.toLowerCase()
                        .replace(/[^a-z0-9]/g, '-') // replace non-alphanumeric with dash
                        .replace(/-+/g, '-')        // remove repeated dashes
                        .replace(/^-|-$/g, '')      // trim dashes
                    + '.pdf';

                // Still try to guess category from the manual title (e.g. "2025 Bylaws" -> Governing)
                const lowerTitle = finalTitle.toLowerCase();
                if (lowerTitle.includes('bylaw') || lowerTitle.includes('rule') || lowerTitle.includes('ccr') || lowerTitle.includes('declaration')) {
                    category = 'Governing';
                } else if (lowerTitle.includes('form') || lowerTitle.includes('application')) {
                    category = 'Forms';
                }
            } else {
                // B. AUTO NAMING (Existing Logic)
                const smartDetails = getSmartDetails(file.name);
                finalSlug = smartDetails.slug;
                finalTitle = smartDetails.title;
                category = smartDetails.category;
            }

            // --- COLLISION DETECTION (Shared by both) ---
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
                    // "bylaws.pdf" -> "bylaws-2.pdf"
                    finalSlug = baseSlug.replace('.pdf', `-${counter}.pdf`);
                    // "Bylaws" -> "Bylaws (v2)"
                    finalTitle = `${baseTitle} (v${counter})`;
                } else {
                    isUnique = true;
                }
            }

            const storagePath = `${communitySlug}/${finalSlug}`;

            // Upload
            const fileBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(fileBuffer);

            const { error: uploadError } = await supabase.storage
                .from('community-files')
                .upload(storagePath, buffer, { upsert: true, contentType: 'application/pdf' });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('community-files').getPublicUrl(storagePath);

            // DB Insert
            await client.query(
                `INSERT INTO community_downloads (community_id, title, category, file_url)
                 VALUES ($1, $2, $3, $4)`,
                [communityId, finalTitle, category, publicUrl]
            );

            // AI Extract
            let rawText = await parsePDF(buffer);
            let textContent = `[DOCUMENT: ${finalTitle} for ${communityName}]\n${rawText}`;
            if (textContent.length > 100000) textContent = textContent.substring(0, 100000);

            await client.query(
                `INSERT INTO community_docs (community_id, content, filename, created_at)
                 VALUES ($1, $2, $3, NOW())`,
                [communityId, textContent, finalSlug]
            );

            return NextResponse.json({ success: true, url: publicUrl, title: finalTitle });

        } finally {
            client.release();
        }

    } catch (error: any) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}