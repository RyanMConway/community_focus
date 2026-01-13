import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const range = searchParams.get('range') || '30d'; // Default to last 30 days

        let dateFilter = `WHERE ca.created_at > NOW() - INTERVAL '30 days'`;
        if (range === '7d') dateFilter = `WHERE ca.created_at > NOW() - INTERVAL '7 days'`;
        if (range === '90d') dateFilter = `WHERE ca.created_at > NOW() - INTERVAL '90 days'`;
        if (range === 'all') dateFilter = `WHERE 1=1`;

        const client = await pool.connect();

        try {
            // 1. Total Queries
            const totalRes = await client.query(`SELECT COUNT(*) as count FROM chat_analytics ca ${dateFilter}`);

            // 2. Category Breakdown
            const categoryRes = await client.query(`
                SELECT category, COUNT(*) as count 
                FROM chat_analytics ca 
                ${dateFilter}
                GROUP BY category 
                ORDER BY count DESC
            `);

            // 3. Top Topics (Hot Issues)
            const topicRes = await client.query(`
                SELECT topic, category, COUNT(*) as count 
                FROM chat_analytics ca 
                ${dateFilter}
                GROUP BY topic, category 
                ORDER BY count DESC 
                LIMIT 10
            `);

            // 4. Community Activity Volume
            const communityRes = await client.query(`
                SELECT c.name, COUNT(ca.id) as count
                FROM chat_analytics ca
                JOIN communities c ON ca.community_id = c.id
                ${dateFilter}
                GROUP BY c.name
                ORDER BY count DESC
                LIMIT 5
            `);

            // 5. Recent Live Feed
            const feedRes = await client.query(`
                SELECT ca.id, ca.topic, ca.category, ca.created_at, c.name as community_name
                FROM chat_analytics ca
                JOIN communities c ON ca.community_id = c.id
                ORDER BY ca.created_at DESC
                LIMIT 20
            `);

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