import pool from '@/lib/db';

export async function isUserAdmin(email: string): Promise<boolean> {
    if (!email) return false;

    try {
        // Query the 'admins' table we created in Neon
        const res = await pool.query(
            'SELECT role FROM admins WHERE email = $1',
            [email.toLowerCase().trim()]
        );
        return res.rows.length > 0;
    } catch (error) {
        console.error("Auth DB Check Failed:", error);
        return false; // Fail safe: if DB is down, deny access
    }
}