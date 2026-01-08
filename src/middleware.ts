import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    // 1. Check if the user is trying to access the admin area
    if (req.nextUrl.pathname.startsWith('/admin')) {

        // 2. Get the Authorization header from the browser request
        const basicAuth = req.headers.get('authorization');

        if (basicAuth) {
            // 3. Decode the base64 username:password
            const authValue = basicAuth.split(' ')[1];
            const [user, pwd] = atob(authValue).split(':');

            // 4. Check against your env variables
            if (user === process.env.ADMIN_USER && pwd === process.env.ADMIN_PASSWORD) {
                return NextResponse.next(); // Let them pass!
            }
        }

        // 5. If no auth or wrong password, Reject with a 401 popup
        return new NextResponse('Authentication Required', {
            status: 401,
            headers: {
                'WWW-Authenticate': 'Basic realm="Secure Area"',
            },
        });
    }

    // Allow all other routes (Home, Services, Contact) to proceed normally
    return NextResponse.next();
}

// Configure which paths this middleware applies to
export const config = {
    matcher: '/admin/:path*',
};