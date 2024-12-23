'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: number;
    username: string;
    email: string;
    role: string;  // Tambahkan role
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (token: string, userData: { userId: number; username: string; email: string; role: string }) => Promise<void>;
    logout: () => void;
    checkRole: (allowedRoles: string[]) => boolean;  // Tambahkan fungsi checkRole
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    const login = async (token: string, userData: { userId: number; username: string; email: string; role: string }) => {
        try {
            const userObj: User = {
                id: userData.userId,
                username: userData.username,
                email: userData.email,
                role: userData.role  // Tambahkan role
            };

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userObj));
            document.cookie = `token=${token}; path=/; max-age=86400; secure; samesite=strict`;

            setUser(userObj);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const logout = () => {
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; secure; samesite=strict';

            setUser(null);
            setIsAuthenticated(false);

            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Tambahkan fungsi checkRole
    const checkRole = (allowedRoles: string[]): boolean => {
        if (!user) return false;
        return allowedRoles.includes(user.role) || user.role === 'superadmin';
    };

    useEffect(() => {
        try {
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('user');

            if (token && userData) {
                const user = JSON.parse(userData);
                setUser(user);
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error('Auth check error:', error);
            logout();
        }
    }, []);

    const contextValue = {
        isAuthenticated,
        user,
        login,
        logout,
        checkRole  // Tambahkan ke context value
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthProvider;
