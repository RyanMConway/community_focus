import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { checkAdminAuth } from '@/lib/checkAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
    const auth = await checkAdminAuth();
    if (!auth.authorized) return auth.response;

    const client = await pool.connect();
    try {
        const { rows } = await client.query(
            `SELECT * FROM bid_requests ORDER BY created_at DESC`
        );
        return NextResponse.json(rows);
    } finally {
        client.release();
    }
}

export async function PATCH(request: Request) {
    const auth = await checkAdminAuth();
    if (!auth.authorized) return auth.response;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const { status } = await request.json();

    const validStatuses = ['new', 'contacted', 'won', 'lost'];
    if (!id || !validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
        await client.query(
            `UPDATE bid_requests SET status = $1 WHERE id = $2`,
            [status, id]
        );
        return NextResponse.json({ success: true });
    } finally {
        client.release();
    }
}
