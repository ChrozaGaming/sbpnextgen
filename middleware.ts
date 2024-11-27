import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Konstanta untuk routes
const PROTECTED_ROUTES = ['/dashboard', '/profile', '/settings', '/admin'];
const PUBLIC_ROUTES = ['/login', '/register'];

// Helper functions
function isProtectedRoute(path: string): boolean {
    return PROTECTED_ROUTES.some(route => path.startsWith(route));
}

function isPublicRoute(path: string): boolean {
    return PUBLIC_ROUTES.some(route => path === route);
}

function checkAuth(request: NextRequest): boolean {
    // Cek keberadaan token tanpa mengakses value secara langsung
    return request.cookies.has('token');
}

function createRedirectUrl(request: NextRequest, pathname: string): URL {
    const url = new URL(request.url);
    url.pathname = pathname;
    return url;
}

export function middleware(request: NextRequest) {
    try {
        // Auth check
        const isAuthenticated = checkAuth(request);

        // Get current path
        const currentPath = request.nextUrl.pathname;

        // Debug logging
        console.log({
            path: currentPath,
            isAuthenticated,
            timestamp: new Date().toISOString()
        });

        // Protected routes check
        if (isProtectedRoute(currentPath) && !isAuthenticated) {
            const loginUrl = createRedirectUrl(request, '/login');
            loginUrl.searchParams.set('redirect', currentPath);
            return NextResponse.redirect(loginUrl);
        }

        // Public routes check untuk user yang sudah login
        if (isPublicRoute(currentPath) && isAuthenticated) {
            const dashboardUrl = createRedirectUrl(request, '/dashboard');
            return NextResponse.redirect(dashboardUrl);
        }

        // Lanjutkan request jika tidak ada redirect
        return NextResponse.next();

    } catch (error) {
        // Error logging
        console.error('Middleware error:', error instanceof Error ? error.message : 'Unknown error');

        // Error redirect
        const errorUrl = createRedirectUrl(request, '/login');
        errorUrl.searchParams.set('error', 'middleware_error');

        if (error instanceof Error) {
            errorUrl.searchParams.set('errorMessage', error.message);
        }

        return NextResponse.redirect(errorUrl);
    }
}

// Route matcher configuration
export const config = {
    matcher: [
        // Protected routes
        '/dashboard/:path*',
        '/profile/:path*',
        '/settings/:path*',
        '/admin/:path*',
        '/user/:path*',
        // Public routes
        '/login',
        '/register'
    ]
};
