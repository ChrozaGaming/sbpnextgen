// components/Sidebar.tsx
'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaBars, FaTimes, FaWarehouse } from 'react-icons/fa';
import { BiScan } from 'react-icons/bi'; // Import icon untuk Register Face
import styles from './Sidebar.module.css';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { NO_SIDEBAR_ROUTES } from '@/config/route';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
    const pathname = usePathname();
    const { user, isAuthenticated, logout } = useAuth();

    const handleLogout = () => {
        try {
            logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const shouldHideSidebar = useCallback(() => {
        return !isAuthenticated || (pathname && NO_SIDEBAR_ROUTES.includes(pathname as any));
    }, [isAuthenticated, pathname]);

    if (shouldHideSidebar()) {
        return null;
    }

    return (
        <div className={styles.sidebarContainer}>
            <div className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
                <div className={styles.logo}>
                    <span>SBP APP</span>
                </div>

                <ul className={styles.menu}>
                    <li>
                        <Link
                            href="/dashboard"
                            className={`${styles.menuItem} ${pathname === '/dashboard' ? styles.active : ''}`}
                        >
                            <i className="fas fa-th-large"></i>
                            <span>Dashboard</span>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/suratjalan"
                            className={`${styles.menuItem} ${pathname === '/suratjalan' ? styles.active : ''}`}
                        >
                            <i className="fas fa-envelope"></i>
                            <span>Surat Jalan</span>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/stokgudang"
                            className={`${styles.menuItem} ${pathname === '/stokgudang' ? styles.active : ''}`}
                        >
                            <FaWarehouse className="text-xl"/>
                            <span> Stok Gudang</span>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/registerfacerecognition"
                            className={`${styles.menuItem} ${pathname === '/registerfacerecognition' ? styles.active : ''}`}
                        >
                            <BiScan className="text-xl"/>
                            <span className="flex items-center">
                                Register Face
                                {!user?.hasFaceRegistration && (
                                    <span className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                                        Required
                                    </span>
                                )}
                            </span>
                        </Link>
                    </li>
                </ul>

                <div className={styles.profile}>
                    <div className={styles.profileInfo}>
                        <div>
                            <p className="font-semibold">{user?.username}</p>
                            <span className="text-sm text-gray-300">{user?.email}</span>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className={styles.logout}
                        type="button"
                    >
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
            <button
                className={styles.toggleButton}
                onClick={() => setIsOpen(!isOpen)}
                type="button"
            >
                {isOpen ? <FaTimes/> : <FaBars/>}
            </button>
        </div>
    );
};

export default Sidebar;
