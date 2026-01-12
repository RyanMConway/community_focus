import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db'; // Your Postgres connection
import { createClient } from '@supabase/supabase-js';
// We use 'require' because pdf-parse is an older library that doesn't support 'import' well
const pdf = require('pdf-parse');

// Initialize Supabase Client (for Storage only)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- HELPER: The "Smart Renaming" Logic (Ported from Python) ---
function getSmartDetails(filename: string) {
    const lower = filename.toLowerCase();

    if (lower.includes('article') && lower.includes('incorp'))
        return { slug: 'articles.pdf', title: 'Articles of Incorporation', category: 'Governing' };

    if (lower.includes('bylaw'))
        return { slug: 'bylaws.pdf', title: 'Bylaws', category: 'Governing' };

    if (lower.includes('ccr') || lower.includes('declaration'))
        return { slug: 'ccrs.pdf', title: 'Declaration of Covenants (CCRs)', category: 'Governing' };

    if (lower.includes('arc') || lower.includes('architect')) {
        if (lower.includes('guide') || lower.includes('standard'))
            return { slug: 'arc-guidelines.pdf', title: 'Architectural Guidelines', category: 'Governing' };
        return { slug: 'arc-form.pdf', title: 'ARC Request Form', category: 'Forms' };
    }

    // Fallback
    const cleanName = filename.replace(/\.pdf$/i, '').replace(/[^a-z0-9]/gi, '-').toLowerCase();
    return { slug: `${cleanName}.pdf`, title: filename.replace('.pdf', ''), category: 'General' };
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const communitySlug = formData.get('communitySlug') as string;

        if (!file || !communitySlug) {
            return NextResponse.json({ error: 'Missing file or community' }, { status: 400 });
        }

        // 1. GET DB ID for Community
        const client = await pool.connect();
        const commResult = await client.query('SELECT id, name FROM communities WHERE slug = $1', [communitySlug]);
        if (commResult.rows.length === 0) throw new Error('Community not found');
        const communityId = commResult.rows[0].id;
        const communityName = commResult.rows[0].name;

        // 2. SMART RENAME
        const { slug: newFilename, title, category } = getSmartDetails(file.name);
        const storagePath = `${communitySlug}/${newFilename}`;

        // 3. UPLOAD TO SUPABASE STORAGE
        const fileBuffer = await file.arrayBuffer();
        const { error: uploadError } = await supabase.storage
            .from('community-files')
            .upload(storagePath, fileBuffer, { upsert: true, contentType: 'application/pdf' });

        if (uploadError) throw uploadError;

        // Get Public URL
        const { data: { publicUrl } } = supabase.storage.from('community-files').getPublicUrl(storagePath);

        // 4. DATABASE INSERT (Downloads)
        // Check if exists first to avoid duplicate rows
        await client.query(
            `INSERT INTO community_downloads (community_id, title, category, file_url)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (community_id, title) DO UPDATE SET file_url = EXCLUDED.file_url`,
            [communityId, title, category, publicUrl]
        );

        // 5. EXTRACT TEXT FOR AI
        // We use the buffer we already have
        const data = await pdf(Buffer.from(fileBuffer));
        let textContent = `[DOCUMENT: ${title} for ${communityName}]\n${data.text}`;

        // Truncate to safe limit (100k chars)
        if (textContent.length > 100000) textContent = textContent.substring(0, 100000);

        // 6. DATABASE INSERT (AI Docs)
        await client.query(
            `INSERT INTO community_docs (community_id, content, created_at)
             VALUES ($1, $2, NOW())`,
            [communityId, textContent]
        );

        client.release();

        return NextResponse.json({ success: true, url: publicUrl, title });

    } catch (error: any) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}