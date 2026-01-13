import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { checkAdminAuth } from '@/lib/checkAuth';

export async function GET() {
    const auth = await checkAdminAuth();
    if (!auth.authorized) return auth.response;

    const client = await pool.connect();
    try {
        // Fetch managers and their assigned communities
        const query = `
            SELECT m.*, 
                   COALESCE(json_agg(json_build_object('id', c.id, 'name', c.name)) FILTER (WHERE c.id IS NOT NULL), '[]') as communities
            FROM managers m
            LEFT JOIN communities c ON c.manager_id = m.id
            GROUP BY m.id
            ORDER BY m.name ASC
        `;
        const { rows } = await client.query(query);
        return NextResponse.json(rows);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
        client.release();
    }
}

export async function POST(request: Request) {
    const auth = await checkAdminAuth();
    if (!auth.authorized) return auth.response;

    try {
        const { name, email, phone, community_ids } = await request.json();
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // 1. Create/Update Manager
            const res = await client.query(
                `INSERT INTO managers (name, email, phone) 
                 VALUES ($1, $2, $3) 
                 RETURNING id`,
                [name, email, phone]
            );
            const managerId = res.rows[0].id;

            // 2. Assign Communities (if provided)
            if (community_ids && community_ids.length > 0) {
                // Reset old assignments for these communities
                await client.query(`UPDATE communities SET manager_id = NULL WHERE manager_id = $1`, [managerId]);
                // Set new assignments
                await client.query(
                    `UPDATE communities SET manager_id = $1 WHERE id = ANY($2::int[])`,
                    [managerId, community_ids]
                );
            }

            await client.query('COMMIT');
            return NextResponse.json({ success: true, managerId });
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const auth = await checkAdminAuth();
    if (!auth.authorized) return auth.response;

    try {
        const { id, name, email, phone, community_ids } = await request.json();
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // 1. Update Manager Info
            await client.query(
                `UPDATE managers SET name = $1, email = $2, phone = $3 WHERE id = $4`,
                [name, email, phone, id]
            );

            // 2. Update Community Mappings
            if (community_ids) {
                // Clear existing for this manager
                await client.query(`UPDATE communities SET manager_id = NULL WHERE manager_id = $1`, [id]);

                // Set new ones
                if (community_ids.length > 0) {
                    await client.query(
                        `UPDATE communities SET manager_id = $1 WHERE id = ANY($2::int[])`,
                        [id, community_ids]
                    );
                }
            }

            await client.query('COMMIT');
            return NextResponse.json({ success: true });
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}