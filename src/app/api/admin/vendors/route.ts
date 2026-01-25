import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { checkAdminAuth } from '@/lib/checkAuth';

export async function GET() {
    const { authorized, response } = await checkAdminAuth();
    if (!authorized) return response;

    const client = await pool.connect();
    try {
        const res = await client.query('SELECT * FROM vendors ORDER BY name ASC');
        return NextResponse.json(res.rows);
    } finally { client.release(); }
}

export async function POST(req: Request) {
    const { authorized, response } = await checkAdminAuth();
    if (!authorized) return response;

    const { name, specialty, website_url } = await req.json();
    const client = await pool.connect();
    try {
        await client.query('INSERT INTO vendors (name, specialty, website_url) VALUES ($1, $2, $3)', [name, specialty, website_url]);
        return NextResponse.json({ success: true });
    } finally { client.release(); }
}

export async function PUT(req: Request) {
    const { authorized, response } = await checkAdminAuth();
    if (!authorized) return response;

    const { id, name, specialty, website_url, active } = await req.json();
    const client = await pool.connect();
    try {
        await client.query('UPDATE vendors SET name=$1, specialty=$2, website_url=$3, active=$4 WHERE id=$5', [name, specialty, website_url, active, id]);
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
        await client.query('DELETE FROM vendors WHERE id=$1', [id]);
        return NextResponse.json({ success: true });
    } finally { client.release(); }
}