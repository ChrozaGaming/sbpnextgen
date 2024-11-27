// app/layout.tsx
'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar/Sidebar';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { NO_SIDEBAR_ROUTES } from '@/config/route';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const pathname = usePathname();

    const shouldShowSidebar = !NO_SIDEBAR_ROUTES.includes(pathname);

    useEffect(() => {
        setMounted(true);

        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            setIsSidebarOpen(!mobile);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Initial render - server side
    if (!mounted) {
        return (
            <html lang="en">
            <head>
                <link
                    rel="stylesheet"
                    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
                />
            </head>
            <body className={inter.className}>
            <AuthProvider>
                <main className={shouldShowSidebar ? 'pl-[250px]' : ''}>
                    {children}
                </main>
            </AuthProvider>
            </body>
            </html>
        );
    }

    // Client side render
    const mainClassName = mounted
        ? `p-6 ${
            shouldShowSidebar
                ? isMobile
                    ? 'pl-0'
                    : isSidebarOpen
                        ? 'pl-[250px]'
                        : 'pl-0'
                : ''
        }`
        : shouldShowSidebar
            ? 'pl-[250px]'
            : '';

    return (
        <html lang="en">
        <head>
            <link
                rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
            />
        </head>
        <body className={inter.className}>
        <AuthProvider>
            {shouldShowSidebar && (
                <Sidebar
                    isOpen={isSidebarOpen}
                    setIsOpen={setIsSidebarOpen}
                />
            )}
            <main className={mainClassName}>{children}</main>
        </AuthProvider>
        </body>
        </html>
    );
}
