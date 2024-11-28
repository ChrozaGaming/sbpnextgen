// config/route.ts

// Export types
export type AuthRoute = '/login' | '/register';
export type ProtectedRoute = '/dashboard' | '/user' | '/suratjalan' | '/analytics' | '/file-manager' | '/orders' | '/saved' | '/settings';
export type AppRoute = AuthRoute | ProtectedRoute;

// Auth routes
export const AUTH_ROUTES: Record<string, AuthRoute> = {
    login: '/login',
    register: '/register'
} as const;

// Protected routes
export const PROTECTED_ROUTES: Record<string, ProtectedRoute> = {
    dashboard: '/dashboard',
    user: '/user',
    suratJalan: '/suratjalan',
    analytics: '/analytics',
    fileManager: '/file-manager',
    orders: '/orders',
    saved: '/saved',
    settings: '/settings'
} as const;

// Routes yang tidak memerlukan sidebar
export const NO_SIDEBAR_ROUTES: AuthRoute[] = [
    AUTH_ROUTES.login,
    AUTH_ROUTES.register
];

// Routes yang memerlukan autentikasi
export const AUTHENTICATED_ROUTES = Object.values(PROTECTED_ROUTES);

// Type untuk menu item
export type MenuItem = {
    path: ProtectedRoute;
    icon: string;
    label: string;
};

// Menu items untuk sidebar
export const MENU_ITEMS: MenuItem[] = [
    {
        path: PROTECTED_ROUTES.dashboard,
        icon: 'fas fa-th-large',
        label: 'Dashboard'
    },
    {
        path: PROTECTED_ROUTES.user,
        icon: 'fas fa-user',
        label: 'User'
    },
    {
        path: PROTECTED_ROUTES.suratJalan,
        icon: 'fas fa-envelope',
        label: 'Surat'
    },
    {
        path: PROTECTED_ROUTES.analytics,
        icon: 'fas fa-chart-bar',
        label: 'Analytics'
    },
    {
        path: PROTECTED_ROUTES.fileManager,
        icon: 'fas fa-folder',
        label: 'File Manager'
    },
    {
        path: PROTECTED_ROUTES.orders,
        icon: 'fas fa-shopping-cart',
        label: 'Order'
    },
    {
        path: PROTECTED_ROUTES.saved,
        icon: 'fas fa-heart',
        label: 'Saved'
    },
    {
        path: PROTECTED_ROUTES.settings,
        icon: 'fas fa-cog',
        label: 'Setting'
    }
];

// Optional: Type guard untuk AuthRoute
export function isAuthRoute(path: string | null): path is AuthRoute {
    return path === '/login' || path === '/register';
}
