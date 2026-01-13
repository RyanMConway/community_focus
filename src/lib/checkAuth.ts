import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define the emails allowed to access Admin APIs
// We normalize these to lowercase and trimmed to prevent mismatches
const AUTHORIZED_EMAILS = [
    "amy@communityfocusnc.com",
    "rconwayak@gmail.com",
    "info@communityfocusnc.com",
    "rconway0825@gmail.com"
].map(email => email.toLowerCase().trim());

export async function checkAdminAuth() {
    const user = await currentUser();

    // 1. Check if user is logged in via Clerk
    if (!user) {
        return {
            authorized: false,
            response: NextResponse.json({ error: "Unauthorized: Please log in" }, { status: 401 })
        };
    }

    // 2. Get the email and normalize it (Lower case + Remove spaces)
    const rawEmail = user.emailAddresses[0]?.emailAddress || "";
    const email = rawEmail.toLowerCase().trim();

    if (!email || !AUTHORIZED_EMAILS.includes(email)) {
        console.log(`[Auth Blocked] User: ${email} is not in allowlist.`); // Server log for debugging
        return {
            authorized: false,
            response: NextResponse.json({ error: "Forbidden: Access Denied" }, { status: 403 })
        };
    }

    // 3. Success
    return { authorized: true, user };
}