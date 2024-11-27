'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaBars, FaTimes } from 'react-icons/fa';
import styles from './Sidebar.module.css';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();
    const { user, isAuthenticated, logout } = useAuth(); // Menggunakan useAuth hook

    if (!isAuthenticated) {
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
                            href="/user"
                            className={`${styles.menuItem} ${pathname === '/user' ? styles.active : ''}`}
                        >
                            <i className="fas fa-user"></i>
                            <span>User</span>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/suratjalan"
                            className={`${styles.menuItem} ${pathname === '/suratjalan' ? styles.active : ''}`}
                        >
                            <i className="fas fa-envelope"></i>
                            <span>Surat</span>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/analytics"
                            className={`${styles.menuItem} ${pathname === '/analytics' ? styles.active : ''}`}
                        >
                            <i className="fas fa-chart-bar"></i>
                            <span>Analytics</span>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/file-manager"
                            className={`${styles.menuItem} ${pathname === '/file-manager' ? styles.active : ''}`}
                        >
                            <i className="fas fa-folder"></i>
                            <span>File Manager</span>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/orders"
                            className={`${styles.menuItem} ${pathname === '/orders' ? styles.active : ''}`}
                        >
                            <i className="fas fa-shopping-cart"></i>
                            <span>Order</span>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/saved"
                            className={`${styles.menuItem} ${pathname === '/saved' ? styles.active : ''}`}
                        >
                            <i className="fas fa-heart"></i>
                            <span>Saved</span>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/settings"
                            className={`${styles.menuItem} ${pathname === '/settings' ? styles.active : ''}`}
                        >
                            <i className="fas fa-cog"></i>
                            <span>Setting</span>
                        </Link>
                    </li>
                </ul>

                <div className={styles.profile}>
                    <div className={styles.profileInfo}>
                        <div className={styles.avatarContainer}>
                            <Image
                                src="/images/default-avatar.png"
                                alt="Profile"
                                width={40}
                                height={40}
                                className={styles.avatar}
                            />
                        </div>
                        <div>
                            <p className="font-semibold">{user?.username}</p>
                            <span className="text-sm text-gray-300">{user?.email}</span>
                        </div>
                    </div>
                    <button
                        onClick={logout} // Menggunakan fungsi logout dari AuthContext
                        className={styles.logout}
                    >
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
            <button
                className={styles.toggleButton}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <FaTimes /> : <FaBars />}
            </button>
        </div>
    );
};

export default Sidebar;
