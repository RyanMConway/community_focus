import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { checkAdminAuth } from '@/lib/checkAuth';

// --- GET ALL COMMUNITIES ---
export async function GET() {
    const client = await pool.connect();
    try {
        // Updated to select new columns
        const { rows } = await client.query('SELECT * FROM communities ORDER BY name ASC');
        return NextResponse.json(rows);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
        client.release();
    }
}

// --- CREATE COMMUNITY ---
export async function POST(request: Request) {
    const auth = await checkAdminAuth();
    if (!auth.authorized) return auth.response;

    try {
        const { name, city, portal_url, alert_message, alert_type } = await request.json();

        // Auto-generate slug
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        const client = await pool.connect();
        try {
            const res = await client.query(
                `INSERT INTO communities (name, city, portal_url, slug, alert_message, alert_type) 
                 VALUES ($1, $2, $3, $4, $5, $6) 
                 RETURNING *`,
                [name, city, portal_url, slug, alert_message, alert_type]
            );
            return NextResponse.json(res.rows[0]);
        } finally {
            client.release();
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// --- UPDATE COMMUNITY (NEW) ---
export async function PUT(request: Request) {
    const auth = await checkAdminAuth();
    if (!auth.authorized) return auth.response;

    try {
        const { id, name, city, portal_url, alert_message, alert_type } = await request.json();

        // Update slug if name changes? Usually safer NOT to change slug to break SEO/Links.
        // We will keep slug static for stability.

        const client = await pool.connect();
        try {
            const res = await client.query(
                `UPDATE communities 
                 SET name = $1, city = $2, portal_url = $3, alert_message = $4, alert_type = $5
                 WHERE id = $6
                 RETURNING *`,
                [name, city, portal_url, alert_message, alert_type, id]
            );
            return NextResponse.json(res.rows[0]);
        } finally {
            client.release();
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// --- DELETE COMMUNITY ---
export async function DELETE(request: Request) {
    const auth = await checkAdminAuth();
    if (!auth.authorized) return auth.response;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const client = await pool.connect();
    try {
        await client.query('DELETE FROM communities WHERE id = $1', [id]);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
        client.release();
    }
}