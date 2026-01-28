import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    const client = await pool.connect();
    try {
        // Exclude 'global' from public lists
        const res = await client.query(
            "SELECT id, name, slug, image_url, description FROM communities WHERE slug != 'global' ORDER BY name ASC"
        );
        return NextResponse.json(res.rows);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
        client.release();
    }
}