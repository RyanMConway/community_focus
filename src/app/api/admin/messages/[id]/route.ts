import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// DELETE a message
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params; // Await params in Next.js 15+
        const client = await pool.connect();

        await client.query('DELETE FROM contact_messages WHERE id = $1', [id]);

        client.release();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete Error:', error);
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}

// PATCH (Update) status (e.g., mark as 'read')
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status } = body; // e.g., 'read', 'archived'

        const client = await pool.connect();

        await client.query(
            'UPDATE contact_messages SET status = $1 WHERE id = $2',
            [status, id]
        );

        client.release();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Update Error:', error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}