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
    return request.cookies.has('token');
}

function createRedirectUrl(request: NextRequest, pathname: string): URL {
    const url = new URL(request.url);
    url.pathname = pathname;
    return url;
}

function addCorsHeaders(response: NextResponse): NextResponse {
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
}

export function middleware(request: NextRequest) {
    try {
        // Handle OPTIONS request for CORS
        if (request.method === 'OPTIONS') {
            return addCorsHeaders(NextResponse.next());
        }

        // Check if it's an API route
        if (request.nextUrl.pathname.startsWith('/api')) {
            return addCorsHeaders(NextResponse.next());
        }

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
            const response = NextResponse.redirect(loginUrl);
            return addCorsHeaders(response);
        }

        // Public routes check untuk user yang sudah login
        if (isPublicRoute(currentPath) && isAuthenticated) {
            const dashboardUrl = createRedirectUrl(request, '/dashboard');
            const response = NextResponse.redirect(dashboardUrl);
            return addCorsHeaders(response);
        }

        // Lanjutkan request jika tidak ada redirect
        return addCorsHeaders(NextResponse.next());

    } catch (error) {
        // Error logging
        console.error('Middleware error:', error instanceof Error ? error.message : 'Unknown error');

        // Error redirect
        const errorUrl = createRedirectUrl(request, '/login');
        errorUrl.searchParams.set('error', 'middleware_error');

        if (error instanceof Error) {
            errorUrl.searchParams.set('errorMessage', error.message);
        }

        const response = NextResponse.redirect(errorUrl);
        return addCorsHeaders(response);
    }
}

// Route matcher configuration
export const config = {
    matcher: [
        // API routes
        '/api/:path*',
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
