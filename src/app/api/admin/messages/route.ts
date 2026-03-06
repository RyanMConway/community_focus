import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { checkAdminAuth } from '@/lib/checkAuth';

export async function GET() {
    const auth = await checkAdminAuth();
    if (!auth.authorized) return auth.response;

    try {
        const client = await pool.connect();
        try {
            const { rows } = await client.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
            return NextResponse.json(rows);
        } finally {
            client.release();
        }
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}