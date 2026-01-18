import { NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/checkAuth';

export async function GET() {
    // This reuses the same DB logic as your other APIs
    const auth = await checkAdminAuth();

    if (!auth.authorized) {
        return NextResponse.json({ authorized: false });
    }

    return NextResponse.json({
        authorized: true,
        email: auth.user?.emailAddresses[0]?.emailAddress
    });
}