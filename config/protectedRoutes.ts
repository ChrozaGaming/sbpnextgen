// config/protectedRoutes.ts
export const protectedRoutes = [
    '/dashboard',
    '/suratjalan',
    '/user',
    '/analytics',
    '/file-manager',
    '/orders',
    '/saved',
    '/settings'
] as const;

export const publicRoutes = [
    '/login',
    '/register',
    '/'
] as const;

export const authRoutes = [
    '/login',
    '/register'
] as const;

// Fungsi helper untuk mengecek route
export const isProtectedRoute = (path: string) => {
    return protectedRoutes.some(route => path.startsWith(route));
};

export const isAuthRoute = (path: string) => {
    return authRoutes.some(route => path.startsWith(route));
};

export const isPublicRoute = (path: string) => {
    return publicRoutes.some(route => path.startsWith(route));
};
