import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { firstName, lastName, email, userType, message } = body;

        // Simple validation
        if (!firstName || !email || !message) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const client = await pool.connect();

        await client.query(
            `INSERT INTO contact_messages (first_name, last_name, email, user_type, message) 
       VALUES ($1, $2, $3, $4, $5)`,
            [firstName, lastName, email, userType, message]
        );

        client.release();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Contact API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}