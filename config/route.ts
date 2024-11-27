// config/routes.ts
export const AUTH_ROUTES = {
    login: '/login',
    register: '/register'
};

export const PUBLIC_ROUTES = [
    AUTH_ROUTES.login,
    AUTH_ROUTES.register
];

export const PROTECTED_ROUTES = {
    dashboard: '/dashboard',
    user: '/user',
    suratJalan: '/suratjalan',
    analytics: '/analytics',
    fileManager: '/file-manager',
    orders: '/orders',
    saved: '/saved',
    settings: '/settings'
};

// Routes yang tidak memerlukan sidebar
export const NO_SIDEBAR_ROUTES = [
    ...Object.values(AUTH_ROUTES)
];

// Routes yang memerlukan autentikasi
export const AUTHENTICATED_ROUTES = [
    ...Object.values(PROTECTED_ROUTES)
];
