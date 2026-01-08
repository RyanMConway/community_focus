import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const client = await pool.connect();
        // Fetch communities alphabetically
        const { rows } = await client.query('SELECT * FROM communities WHERE is_active = true ORDER BY name ASC');
        client.release();

        return NextResponse.json(rows);
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}