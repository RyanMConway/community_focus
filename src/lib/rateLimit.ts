import pool from '@/lib/db';
import { NextResponse } from 'next/server';

const REQUESTS_PER_MINUTE = 20;

/**
 * Checks and increments the rate limit for a given IP.
 * Uses a fixed 1-minute window stored in NeonDB.
 * Returns a 429 NextResponse if the limit is exceeded, otherwise null.
 */
export async function checkRateLimit(ip: string): Promise<NextResponse | null> {
    // Truncate to the current minute to define the window
    const windowStart = new Date();
    windowStart.setSeconds(0, 0);

    const { rows } = await pool.query<{ request_count: number }>(
        `INSERT INTO chat_rate_limits (ip, window_start, request_count)
         VALUES ($1, $2, 1)
         ON CONFLICT (ip, window_start)
         DO UPDATE SET request_count = chat_rate_limits.request_count + 1
         RETURNING request_count`,
        [ip, windowStart.toISOString()]
    );

    const count = rows[0]?.request_count ?? 1;

    if (count > REQUESTS_PER_MINUTE) {
        return NextResponse.json(
            { error: 'Too many requests. Please wait a moment before asking again.' },
            { status: 429, headers: { 'Retry-After': '60' } }
        );
    }

    // Async cleanup: delete windows older than 1 hour (fire-and-forget)
    pool.query(`DELETE FROM chat_rate_limits WHERE window_start < NOW() - INTERVAL '1 hour'`)
        .catch(() => {}); // Never block the response on cleanup

    return null;
}
