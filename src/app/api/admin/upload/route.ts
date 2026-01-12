import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { createClient } from '@supabase/supabase-js';

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

    if (lower.includes('article') && lower.includes('incorp'))
        return { slug: 'articles.pdf', title: 'Articles of Incorporation', category: 'Governing' };
    if (lower.includes('bylaw'))
        return { slug: 'bylaws.pdf', title: 'Bylaws', category: 'Governing' };
    if (lower.includes('ccr') || lower.includes('declaration') || lower.includes('covenant'))
        return { slug: 'ccrs.pdf', title: 'Declaration of Covenants (CCRs)', category: 'Governing' };
    if (lower.includes('rule') || lower.includes('reg'))
        return { slug: 'rules-and-regs.pdf', title: 'Rules & Regulations', category: 'Governing' };

    if (lower.includes('arc') || lower.includes('architect') || lower.includes('acc')) {
        const humanTitle = humanizeTitle(filename);
        if (lower.includes('guide') || lower.includes('standard'))
            return { slug: 'arc-guidelines.pdf', title: 'Architectural Guidelines', category: 'Governing' };
        return { slug: 'arc-form.pdf', title: humanTitle, category: 'Forms' };
    }

    const humanTitle = humanizeTitle(filename);
    const safeSlug = filename.replace(/\.pdf$/i, '').replace(/[^a-z0-9]/gi, '-').toLowerCase() + '.pdf';
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
        // RECEIVE EXTRACTED TEXT
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

            if (customTitle && customTitle.trim()) {
                finalTitle = customTitle.trim();
                finalSlug = finalTitle.toLowerCase()
                        .replace(/[^a-z0-9]/g, '-')
                        .replace(/-+/g, '-')
                        .replace(/^-|-$/g, '')
                    + '.pdf';

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
                    finalSlug = baseSlug.replace('.pdf', `-${counter}.pdf`);
                    finalTitle = `${baseTitle} (v${counter})`;
                } else {
                    isUnique = true;
                }
            }

            const storagePath = `${communitySlug}/${finalSlug}`;

            // --- UPLOAD TO STORAGE ---
            const fileBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(fileBuffer);

            const { error: uploadError } = await supabase.storage
                .from('community-files')
                .upload(storagePath, buffer, { upsert: true, contentType: 'application/pdf' });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('community-files').getPublicUrl(storagePath);

            // --- DB INSERT (Downloads) ---
            await client.query(
                `INSERT INTO community_downloads (community_id, title, category, file_url)
                 VALUES ($1, $2, $3, $4)`,
                [communityId, finalTitle, category, publicUrl]
            );

            // --- DB INSERT (AI Docs) ---
            // Use the text we got from the Frontend!
            let textContent = `[DOCUMENT: ${finalTitle} for ${communityName}]\n${extractedText || "(No text could be extracted - Scanned Document?)"}`;
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