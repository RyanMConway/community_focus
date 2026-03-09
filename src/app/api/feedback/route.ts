import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { communitySlug, question, waldoAnswer, rating, feedbackType } = await request.json();

        if (!communitySlug || !feedbackType || rating === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (![1, -1].includes(rating)) {
            return NextResponse.json({ error: 'Invalid rating value' }, { status: 400 });
        }

        if (!['escalation', 'session'].includes(feedbackType)) {
            return NextResponse.json({ error: 'Invalid feedback type' }, { status: 400 });
        }

        const communityRes = await pool.query(
            'SELECT id FROM communities WHERE slug = $1',
            [communitySlug]
        );
        const communityId = communityRes.rows[0]?.id ?? null;

        await pool.query(
            `INSERT INTO waldo_feedback (community_id, question, waldo_answer, rating, feedback_type)
             VALUES ($1, $2, $3, $4, $5)`,
            [communityId, question ?? null, waldoAnswer ?? null, rating, feedbackType]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Feedback submission error:', error);
        return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
    }
}
