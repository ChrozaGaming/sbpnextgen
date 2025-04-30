import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes configuration
const PROTECTED_ROUTES = ['/dashboard', '/profile', '/settings', '/admin', '/registerfacerecognition', '/stokgudang', '/rekappo'];
const PUBLIC_ROUTES = ['/login', '/register'];
const PUBLIC_API_ROUTES = [
  '/api/login',
  '/api/register',
  '/api/check-face',
  '/api/register-face'
];

// Helper functions
function isProtectedRoute(path: string): boolean {
  return PROTECTED_ROUTES.some(route => path === route || path.startsWith(`${route}/`));
}

function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some(route => path === route);
}

function isPublicApiRoute(path: string): boolean {
  return PUBLIC_API_ROUTES.some(route => path === route || path.startsWith(`${route}/`));
}

function checkAuth(request: NextRequest): boolean {
  return request.cookies.has('token');
}

function createRedirectUrl(request: NextRequest, pathname: string): URL {
  const url = new URL(request.url);
  url.pathname = pathname;
  return url;
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  // CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  // Security headers for camera access
  response.headers.set(
    'Permissions-Policy',
    'camera=self, microphone=self, geolocation=self'
  );
  response.headers.set(
    'Feature-Policy',
    'camera *; microphone *; geolocation *'
  );

  // Additional security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  return response;
}

function verifyApiToken(request: NextRequest): { isValid: boolean; userId?: string; email?: string } {
  try {
    // Check cookie-based authentication
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

    // Check Bearer token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { isValid: false };
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return { isValid: false };
    }
    
    const decodedToken = Buffer.from(token, 'base64').toString();
    const [userId, email] = decodedToken.split(':');

    if (!userId || !email) {
      return { isValid: false };
    }

    return { isValid: true, userId, email };
  } catch (error) {
    console.error('Token verification error:', error);
    return { isValid: false };
  }
}

export async function middleware(request: NextRequest) {
  try {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Request path:', request.nextUrl.pathname);
      console.log('Request method:', request.method);
      console.log('Request headers:', Object.fromEntries(request.headers));
    }

    const currentPath = request.nextUrl.pathname;
    const isAuthenticated = checkAuth(request);

    // Handle OPTIONS request
    if (request.method === 'OPTIONS') {
      return addSecurityHeaders(NextResponse.next());
    }

    // API route handling
    if (currentPath.startsWith('/api')) {
      return handleApiRoutes(request, currentPath);
    }

    // Handle face recognition page specifically
    if (currentPath === '/registerfacerecognition') {
      return handleFaceRecognitionRoute(request, isAuthenticated);
    }

    // Protected routes check
    if (isProtectedRoute(currentPath) && !isAuthenticated) {
      const loginUrl = createRedirectUrl(request, '/login');
      loginUrl.searchParams.set('redirect', currentPath);
      return addSecurityHeaders(NextResponse.redirect(loginUrl));
    }

    // Public routes check for logged-in users
    if (isPublicRoute(currentPath) && isAuthenticated) {
      const dashboardUrl = createRedirectUrl(request, '/dashboard');
      return addSecurityHeaders(NextResponse.redirect(dashboardUrl));
    }

    // Default response
    return addSecurityHeaders(NextResponse.next());
  } catch (error) {
    return handleMiddlewareError(request, error);
  }
}

// Helper functions to improve readability
function handleApiRoutes(request: NextRequest, currentPath: string) {
  // Handle register-face endpoint specifically
  if (currentPath === '/api/register-face' && request.method === 'POST') {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const response = NextResponse.next();
      response.headers.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Requested-With'
      );
      response.headers.set(
        'Access-Control-Allow-Methods',
        'POST, OPTIONS'
      );
      return addSecurityHeaders(response);
    }
  }

  // Allow public API routes without authentication
  if (isPublicApiRoute(currentPath)) {
    return addSecurityHeaders(NextResponse.next());
  }

  // Verify token for protected API routes
  const tokenVerification = verifyApiToken(request);
  if (!tokenVerification.isValid) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized - Invalid or missing token' },
      { status: 401, headers: addSecurityHeaders(new NextResponse()).headers }
    );
  }

  // Add user info to headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('X-User-Id', tokenVerification.userId!);
  requestHeaders.set('X-User-Email', tokenVerification.email!);

  return addSecurityHeaders(NextResponse.next({
    request: { headers: requestHeaders }
  }));
}

function handleFaceRecognitionRoute(request: NextRequest, isAuthenticated: boolean) {
  const response = NextResponse.next();

  // Add specific headers for camera access
  response.headers.set(
    'Permissions-Policy',
    'camera=self'
  );
  response.headers.set(
    'Feature-Policy',
    'camera *'
  );

  if (!isAuthenticated) {
    const loginUrl = createRedirectUrl(request, '/login');
    loginUrl.searchParams.set('redirect', '/registerfacerecognition');
    return addSecurityHeaders(NextResponse.redirect(loginUrl));
  }

  return addSecurityHeaders(response);
}

function handleMiddlewareError(request: NextRequest, error: unknown) {
  console.error('Middleware error:', error instanceof Error ? error.message : 'Unknown error');

  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      {
        status: 500,
        headers: addSecurityHeaders(new NextResponse()).headers
      }
    );
  }

  const errorUrl = createRedirectUrl(request, '/login');
  errorUrl.searchParams.set('error', 'middleware_error');
  if (error instanceof Error) {
    errorUrl.searchParams.set('errorMessage', error.message);
  }

  return addSecurityHeaders(NextResponse.redirect(errorUrl));
}

export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/admin/:path*',
    '/user/:path*',
    '/registerfacerecognition',
    '/login',
    '/register',
    '/stokgudang',
    '/rekappo'
  ]
};
