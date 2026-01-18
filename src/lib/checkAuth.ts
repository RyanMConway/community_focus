import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { isUserAdmin } from './auth-service';

export async function checkAdminAuth() {
    const user = await currentUser();

    // 1. Check if user is logged in via Clerk
    if (!user) {
        return {
            authorized: false,
            response: NextResponse.json({ error: "Unauthorized: Please log in" }, { status: 401 })
        };
    }

    // 2. Get the email
    const rawEmail = user.emailAddresses[0]?.emailAddress || "";

    // 3. Check Database
    const authorized = await isUserAdmin(rawEmail);

    if (!authorized) {
        console.log(`[Auth Blocked] User: ${rawEmail} is not in admin table.`);
        return {
            authorized: false,
            response: NextResponse.json({ error: "Forbidden: Access Denied" }, { status: 403 })
        };
    }

    // 4. Success
    return { authorized: true, user };
}