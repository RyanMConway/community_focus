import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define the emails allowed to access Admin APIs
const AUTHORIZED_EMAILS = [
    "amy@communityfocusnc.com",
    "rconwayak@gmail.com",
    "info@communityfocusnc.com",
    "rconway0825@gmail.com"
];

export async function checkAdminAuth() {
    const user = await currentUser();

    // 1. Check if user is logged in via Clerk
    if (!user) {
        return {
            authorized: false,
            response: NextResponse.json({ error: "Unauthorized: Please log in" }, { status: 401 })
        };
    }

    // 2. Check if the user's email is in our allowlist
    const email = user.emailAddresses[0]?.emailAddress;

    if (!email || !AUTHORIZED_EMAILS.includes(email)) {
        return {
            authorized: false,
            response: NextResponse.json({ error: "Forbidden: Access Denied" }, { status: 403 })
        };
    }

    // 3. Success
    return { authorized: true, user };
}