import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { checkRateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim()
            ?? request.headers.get('x-real-ip')
            ?? 'anonymous';
        const rateLimited = await checkRateLimit(ip, 5);
        if (rateLimited) return rateLimited;

        const body = await request.json();
        const { firstName, lastName, email, userType, message } = body;

        if (!firstName || !email || !message) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const client = await pool.connect();
        try {
            await client.query(
                `INSERT INTO contact_messages (first_name, last_name, email, user_type, message)
                 VALUES ($1, $2, $3, $4, $5)`,
                [firstName, lastName, email, userType, message]
            );
        } finally {
            client.release();
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Contact API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}