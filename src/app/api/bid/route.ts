import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { checkRateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim()
            ?? request.headers.get('x-real-ip')
            ?? 'anonymous';
        const rateLimited = await checkRateLimit(ip, 3);
        if (rateLimited) return rateLimited;

        const body = await request.json();
        const {
            communityName, associationType, unitCount, city, currentSituation,
            servicesNeeded, biggestChallenge, timeline,
            contactName, contactRole, contactEmail, contactPhone, bestTime,
        } = body;

        if (!communityName || !associationType || !unitCount || !city || !currentSituation ||
            !servicesNeeded?.length || !timeline || !contactName || !contactRole ||
            !contactEmail || !contactPhone || !bestTime) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const client = await pool.connect();
        try {
            await client.query(
                `INSERT INTO bid_requests
                 (community_name, association_type, unit_count, city, current_situation,
                  services_needed, biggest_challenge, timeline,
                  contact_name, contact_role, contact_email, contact_phone, best_time)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
                [communityName, associationType, parseInt(unitCount), city, currentSituation,
                 servicesNeeded, biggestChallenge || null, timeline,
                 contactName, contactRole, contactEmail, contactPhone, bestTime]
            );
        } finally {
            client.release();
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Bid API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
