import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes configuration
const PROTECTED_ROUTES = ['/dashboard', '/profile', '/settings', '/admin'];
const PUBLIC_ROUTES = ['/login', '/register'];
const PUBLIC_API_ROUTES = ['/api/login', '/api/register'];

// Helper functions
function isProtectedRoute(path: string): boolean {
    return PROTECTED_ROUTES.some(route => path.startsWith(route));
}

function isPublicRoute(path: string): boolean {
    return PUBLIC_ROUTES.some(route => path === route);
}

function isPublicApiRoute(path: string): boolean {
    return PUBLIC_API_ROUTES.some(route => path.startsWith(route));
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
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
}

function verifyApiToken(request: NextRequest): { isValid: boolean; userId?: string; email?: string } {
    try {
        // First check for cookie-based authentication
        if (checkAuth(request)) {
            const token = request.cookies.get('token')?.value;
            if (token) {
                const decodedToken = Buffer.from(token, 'base64').toString();
                const [userId, email] = decodedToken.split(':');
                if (userId && email) {
                    return { isValid: true, userId, email };
                }
            }
        }

        // Then check for Bearer token in Authorization header
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return { isValid: false };
        }

        const token = authHeader.split(' ')[1];
        const decodedToken = Buffer.from(token, 'base64').toString();
        const [userId, email] = decodedToken.split(':');

        if (!userId || !email) {
            return { isValid: false };
        }

        return { isValid: true, userId, email };
    } catch {
        return { isValid: false };
    }
}

export async function middleware(request: NextRequest) {
    try {
        // Handle OPTIONS request for CORS
        if (request.method === 'OPTIONS') {
            return addCorsHeaders(NextResponse.next());
        }

        const currentPath = request.nextUrl.pathname;

        // API route handling
        if (currentPath.startsWith('/api')) {
            // Allow public API routes without authentication
            if (isPublicApiRoute(currentPath)) {
                return addCorsHeaders(NextResponse.next());
            }

            // All other API routes require authentication
            const tokenVerification = verifyApiToken(request);

            if (!tokenVerification.isValid) {
                return NextResponse.json(
                    { message: 'Unauthorized - Invalid or missing token' },
                    { status: 401 }
                );
            }

            // Add user info to request headers
            const requestHeaders = new Headers(request.headers);
            requestHeaders.set('X-User-Id', tokenVerification.userId!);
            requestHeaders.set('X-User-Email', tokenVerification.email!);

            // Continue with modified headers
            return NextResponse.next({
                request: {
                    headers: requestHeaders,
                }
            });
        }

        // Page route handling
        const isAuthenticated = checkAuth(request);

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
            return addCorsHeaders(NextResponse.redirect(loginUrl));
        }

        // Public routes check for logged-in users
        if (isPublicRoute(currentPath) && isAuthenticated) {
            const dashboardUrl = createRedirectUrl(request, '/dashboard');
            return addCorsHeaders(NextResponse.redirect(dashboardUrl));
        }

        // Continue with the request if no redirects needed
        return addCorsHeaders(NextResponse.next());

    } catch (error) {
        // Error logging
        console.error('Middleware error:', error instanceof Error ? error.message : 'Unknown error');

        // For API routes, return JSON error response
        if (request.nextUrl.pathname.startsWith('/api')) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Internal server error',
                    error: error instanceof Error ? error.message : 'Unknown error'
                },
                { status: 500 }
            );
        }

        // For page routes, redirect to login with error
        const errorUrl = createRedirectUrl(request, '/login');
        errorUrl.searchParams.set('error', 'middleware_error');
        if (error instanceof Error) {
            errorUrl.searchParams.set('errorMessage', error.message);
        }

        return addCorsHeaders(NextResponse.redirect(errorUrl));
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