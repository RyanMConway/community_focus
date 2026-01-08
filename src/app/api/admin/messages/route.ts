import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const client = await pool.connect();
        // Fetch latest messages first
        const { rows } = await client.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
        client.release();
        return NextResponse.json(rows);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}