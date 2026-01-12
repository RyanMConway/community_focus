import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { createClient } from '@supabase/supabase-js';
import PDFParser from 'pdf2json'; // <--- New Import

// Initialize Supabase Client (Service Role Key for Admin Access)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// --- HELPER: Smart Renaming Logic ---
function getSmartDetails(filename: string) {
    const lower = filename.toLowerCase();

    if (lower.includes('article') && lower.includes('incorp'))
        return { slug: 'articles.pdf', title: 'Articles of Incorporation', category: 'Governing' };

    if (lower.includes('bylaw'))
        return { slug: 'bylaws.pdf', title: 'Bylaws', category: 'Governing' };

    if (lower.includes('ccr') || lower.includes('declaration') || lower.includes('covenant'))
        return { slug: 'ccrs.pdf', title: 'Declaration of Covenants (CCRs)', category: 'Governing' };

    if (lower.includes('arc') || lower.includes('architect')) {
        if (lower.includes('guide') || lower.includes('standard'))
            return { slug: 'arc-guidelines.pdf', title: 'Architectural Guidelines', category: 'Governing' };
        return { slug: 'arc-form.pdf', title: 'ARC Request Form', category: 'Forms' };
    }

    if (lower.includes('rule') || lower.includes('reg'))
        return { slug: 'rules-and-regs.pdf', title: 'Rules & Regulations', category: 'Governing' };

    // Fallback
    const cleanName = filename.replace(/\.pdf$/i, '').replace(/[^a-z0-9]/gi, '-').toLowerCase();
    return { slug: `${cleanName}.pdf`, title: filename.replace('.pdf', ''), category: 'General' };
}

// --- HELPER: Extract Text using pdf2json ---
async function parsePDF(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(null, true); // 1 = Text content only

        pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));

        pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
            // Extract raw text from the JSON structure
            const text = pdfParser.getRawTextContent();
            resolve(text);
        });

        pdfParser.parseBuffer(buffer);
    });
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const communitySlug = formData.get('communitySlug') as string;

        if (!file || !communitySlug) {
            return NextResponse.json({ error: 'Missing file or community' }, { status: 400 });
        }

        // 1. GET DB ID
        const client = await pool.connect();
        const commResult = await client.query('SELECT id, name FROM communities WHERE slug = $1', [communitySlug]);

        if (commResult.rows.length === 0) {
            client.release();
            throw new Error('Community not found');
        }

        const communityId = commResult.rows[0].id;
        const communityName = commResult.rows[0].name;

        // 2. SMART RENAME
        const { slug: newFilename, title, category } = getSmartDetails(file.name);
        const storagePath = `${communitySlug}/${newFilename}`;

        // 3. UPLOAD TO SUPABASE STORAGE
        const fileBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(fileBuffer); // Convert for Node.js usage

        const { error: uploadError } = await supabase.storage
            .from('community-files')
            .upload(storagePath, buffer, { upsert: true, contentType: 'application/pdf' });

        if (uploadError) throw uploadError;

        // Get Public URL
        const { data: { publicUrl } } = supabase.storage.from('community-files').getPublicUrl(storagePath);

        // 4. DATABASE INSERT (Downloads)
        await client.query(
            `INSERT INTO community_downloads (community_id, title, category, file_url)
             VALUES ($1, $2, $3, $4)
                 ON CONFLICT (community_id, title) DO UPDATE SET file_url = EXCLUDED.file_url`,
            [communityId, title, category, publicUrl]
        );

        // 5. EXTRACT TEXT FOR AI
        // Use the new parser helper
        let rawText = await parsePDF(buffer);
        let textContent = `[DOCUMENT: ${title} for ${communityName}]\n${rawText}`;

        // Truncate to safe limit
        if (textContent.length > 100000) textContent = textContent.substring(0, 100000);

        // 6. DATABASE INSERT (AI Docs)
        await client.query(
            `INSERT INTO community_docs (community_id, content, filename, created_at)
             VALUES ($1, $2, $3, NOW())`,
            [communityId, textContent, newFilename] // <--- We added newFilename here
        );

        client.release();

        return NextResponse.json({ success: true, url: publicUrl, title });

    } catch (error: any) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}