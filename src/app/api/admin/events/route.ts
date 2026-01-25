import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { checkAdminAuth } from '@/lib/checkAuth';

export async function GET() {
    const { authorized, response } = await checkAdminAuth();
    if (!authorized) return response;

    const client = await pool.connect();
    try {
        const res = await client.query('SELECT * FROM community_events ORDER BY event_date ASC');
        return NextResponse.json(res.rows);
    } finally { client.release(); }
}

export async function POST(req: Request) {
    const { authorized, response } = await checkAdminAuth();
    if (!authorized) return response;

    const { community_id, title, event_date, event_time, location } = await req.json();
    const client = await pool.connect();
    try {
        await client.query(
            'INSERT INTO community_events (community_id, title, event_date, event_time, location) VALUES ($1, $2, $3, $4, $5)',
            [community_id, title, event_date, event_time, location]
        );
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
        await client.query('DELETE FROM community_events WHERE id=$1', [id]);
        return NextResponse.json({ success: true });
    } finally { client.release(); }
}