import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { checkAdminAuth } from '@/lib/checkAuth';

export async function GET() {
    const { authorized, response } = await checkAdminAuth();
    if (!authorized) return response;

    const client = await pool.connect();
    try {
        const res = await client.query('SELECT * FROM community_news ORDER BY created_at DESC');
        return NextResponse.json(res.rows);
    } finally { client.release(); }
}

export async function POST(req: Request) {
    const { authorized, response } = await checkAdminAuth();
    if (!authorized) return response;

    const { community_id, title, content } = await req.json();
    const client = await pool.connect();
    try {
        await client.query('INSERT INTO community_news (community_id, title, content) VALUES ($1, $2, $3)', [community_id, title, content]);
        return NextResponse.json({ success: true });
    } finally { client.release(); }
}

export async function DELETE(req: Request) {
    const { authorized, response } = await checkAdminAuth();
    if (!authorized) return response;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const client = await pool.connect();
    try {
        await client.query('DELETE FROM community_news WHERE id=$1', [id]);
        return NextResponse.json({ success: true });
    } finally { client.release(); }
}