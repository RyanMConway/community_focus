import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { checkAdminAuth } from '@/lib/checkAuth';

export async function GET(request: Request) {
    // --- SECURITY CHECK (NEW) ---
    const auth = await checkAdminAuth();
    if (!auth.authorized) return auth.response;
    // ----------------------------

    try {
        const { searchParams } = new URL(request.url);
        const range = searchParams.get('range') || '30d';
        const communityId = searchParams.get('communityId');

        // Build the WHERE clause dynamically
        let conditions = ["1=1"]; // Default true
        const params: any[] = [];

        // 1. Date Filter
        if (range === '7d') conditions.push(`ca.created_at > NOW() - INTERVAL '7 days'`);
        else if (range === '90d') conditions.push(`ca.created_at > NOW() - INTERVAL '90 days'`);
        else if (range !== 'all') conditions.push(`ca.created_at > NOW() - INTERVAL '30 days'`);

        // 2. Community Filter
        if (communityId && communityId !== 'all') {
            params.push(communityId);
            conditions.push(`ca.community_id = $${params.length}`);
        }

        const whereClause = "WHERE " + conditions.join(" AND ");

        const client = await pool.connect();

        try {
            // 1. Total Queries
            const totalRes = await client.query(`SELECT COUNT(*) as count FROM chat_analytics ca ${whereClause}`, params);

            // 2. Category Breakdown
            const categoryRes = await client.query(`
                SELECT category, COUNT(*) as count
                FROM chat_analytics ca
                    ${whereClause}
                GROUP BY category
                ORDER BY count DESC
            `, params);

            // 3. Top Topics (Hot Issues)
            const topicRes = await client.query(`
                SELECT topic, category, COUNT(*) as count
                FROM chat_analytics ca
                    ${whereClause}
                GROUP BY topic, category
                ORDER BY count DESC
                    LIMIT 10
            `, params);

            // 4. Community Activity
            const communityRes = await client.query(`
                SELECT c.name, COUNT(ca.id) as count
                FROM chat_analytics ca
                    JOIN communities c ON ca.community_id = c.id
                    ${whereClause}
                GROUP BY c.name
                ORDER BY count DESC
                    LIMIT 5
            `, params);

            // 5. Recent Live Feed
            const feedRes = await client.query(`
                SELECT ca.id, ca.topic, ca.category, ca.created_at, c.name as community_name
                FROM chat_analytics ca
                         JOIN communities c ON ca.community_id = c.id
                    ${whereClause}
                ORDER BY ca.created_at DESC
                    LIMIT 20
            `, params);

            return NextResponse.json({
                total: parseInt(totalRes.rows[0].count),
                categories: categoryRes.rows,
                topics: topicRes.rows,
                communities: communityRes.rows,
                feed: feedRes.rows
            });

        } finally {
            client.release();
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    // --- SECURITY CHECK (NEW) ---
    const auth = await checkAdminAuth();
    if (!auth.authorized) return auth.response;
    // ----------------------------

    try {
        const { searchParams } = new URL(request.url);
        const communityId = searchParams.get('communityId');

        const client = await pool.connect();
        try {
            if (communityId && communityId !== 'all') {
                // Clear ONLY for specific community
                await client.query('DELETE FROM chat_analytics WHERE community_id = $1', [communityId]);
                return NextResponse.json({ message: `Cleared data for community ${communityId}` });
            } else {
                // Clear ALL data
                await client.query('DELETE FROM chat_analytics');
                return NextResponse.json({ message: "Cleared all analytics data" });
            }
        } finally {
            client.release();
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}