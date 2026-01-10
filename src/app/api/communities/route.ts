import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// 1. FORCE DYNAMIC: This prevents Next.js from caching the list.
// If you add a new community, it will show up instantly.
export const dynamic = 'force-dynamic';

export async function GET() {
    const client = await pool.connect();
    try {
        // 2. Fetch the clean list from the database
        const result = await client.query(
            'SELECT id, name, slug, portal_url FROM communities ORDER BY name ASC'
        );

        // 3. Return as JSON
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch communities' },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}