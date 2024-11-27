'use client';

import React, { createContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    isAuthenticated: boolean;
    user: any; // Bisa disesuaikan dengan struktur data user
    login: (userData: any, token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    user: null,
    login: () => {},
    logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const router = useRouter();

    // Simpan data user dan token setelah login
    const login = (userData: any, token: string) => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
    };

    // Hapus token & data user saat logout
    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        setUser(null);
        setIsAuthenticated(false);
        router.replace('/login');
    };

    useEffect(() => {
        // Cek apakah token tersimpan di localStorage
        const token = localStorage.getItem('authToken');
        const savedUserData = localStorage.getItem('userData');
        if (token && savedUserData) {
            setUser(JSON.parse(savedUserData));
            setIsAuthenticated(true);
        } else {
            router.replace('/login'); // Hanya redirect jika belum login
        }
    }, [router]);

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => React.useContext(AuthContext);
