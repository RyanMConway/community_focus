import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Create a new community
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, city, portal_url, description } = body;

        // 1. Auto-generate slug (e.g., "Forest Hills" -> "forest-hills")
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        const client = await pool.connect();

        await client.query(
            `INSERT INTO communities (name, slug, city, portal_url, description, is_active) 
       VALUES ($1, $2, $3, $4, $5, true)`,
            [name, slug, city, portal_url, description]
        );

        client.release();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Create Community Error:', error);
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
    }
}

// Delete a community
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const client = await pool.connect();
        await client.query('DELETE FROM communities WHERE id = $1', [id]);
        client.release();

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}