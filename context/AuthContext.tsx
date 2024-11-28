// context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: number;
    username: string;
    email: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (token: string, userData: { userId: number; username: string; email: string }) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter(); // Pastikan ini ada di dalam component

    const login = async (token: string, userData: { userId: number; username: string; email: string }) => {
        try {
            const userObj: User = {
                id: userData.userId,
                username: userData.username,
                email: userData.email
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

    // Pastikan menggunakan router yang sudah didefinisikan
    const logout = () => {
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; secure; samesite=strict';

            setUser(null);
            setIsAuthenticated(false);

            router.push('/login'); // Menggunakan router yang sudah didefinisikan
        } catch (error) {
            console.error('Logout error:', error);
        }
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
        // Tambahkan router ke dependency array jika menggunakan router di dalam useEffect
    }, []);

    const contextValue = {
        isAuthenticated,
        user,
        login,
        logout
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
