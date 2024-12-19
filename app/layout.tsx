// app/layout.tsx
'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import 'antd/dist/reset.css'; // Import Ant Design CSS
import Sidebar from '@/components/Sidebar/Sidebar';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { isAuthRoute } from '@/config/route';
import { AuthProvider } from '@/context/AuthContext';
import { ConfigProvider } from 'antd'; // Import ConfigProvider dari antd

const inter = Inter({ subsets: ['latin'] });

function RootLayoutContent({
                               children,
                               shouldShowSidebar,
                               isSidebarOpen,
                               setIsSidebarOpen,
                               isMobile,
                               mounted,
                           }: {
    children: React.ReactNode;
    shouldShowSidebar: boolean;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
    isMobile: boolean;
    mounted: boolean;
}) {
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
        <ConfigProvider>
            {shouldShowSidebar && (
                <Sidebar
                    isOpen={isSidebarOpen}
                    setIsOpen={setIsSidebarOpen}
                />
            )}
            <main className={mainClassName}>{children}</main>
        </ConfigProvider>
    );
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const pathname = usePathname();

    const shouldShowSidebar = pathname ? !isAuthRoute(pathname) : true;

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
                <ConfigProvider>
                    <main className={shouldShowSidebar ? 'pl-[250px]' : ''}>
                        {children}
                    </main>
                </ConfigProvider>
            </AuthProvider>
            </body>
            </html>
        );
    }

    // Client side render
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
            <RootLayoutContent
                shouldShowSidebar={shouldShowSidebar}
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                isMobile={isMobile}
                mounted={mounted}
            >
                {children}
            </RootLayoutContent>
        </AuthProvider>
        </body>
        </html>
    );
}
