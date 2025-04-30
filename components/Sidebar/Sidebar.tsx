/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-expressions */
'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { FaBars, FaTimes, FaWarehouse, FaClipboardList, FaFileAlt } from 'react-icons/fa';
import styles from './Sidebar.module.css';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { NO_SIDEBAR_ROUTES } from '@/config/route';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

function clearAllCookies() {
  if (typeof document === 'undefined') return;
  const cookies = document.cookie ? document.cookie.split(';') : [];
  for (const cookie of cookies) {
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
  }
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const pathname = usePathname();
  const auth = useAuth();
  const user = auth?.user;
  const isAuthenticated = !!user;
  const logout = auth?.logout || (() => {});

  // Debugging output
  console.debug('[Sidebar] pathname:', pathname);
  console.debug('[Sidebar] user:', user);
  console.debug('[Sidebar] isAuthenticated:', isAuthenticated);
  console.debug('[Sidebar] NO_SIDEBAR_ROUTES:', NO_SIDEBAR_ROUTES);

  const handleLogout = () => {
    try {
      console.debug('[Sidebar] Logging out...');
      clearAllCookies();
      logout && logout();
      setIsOpen(false);
    } catch (error) {
      console.error('[Sidebar] Logout error:', error);
    }
  };

  const shouldHideSidebar = useCallback(() => {
    const shouldHide =
      !isAuthenticated ||
      (pathname && NO_SIDEBAR_ROUTES.includes(pathname as any));
    console.debug('[Sidebar] shouldHideSidebar:', shouldHide, {
      isAuthenticated,
      pathname,
      NO_SIDEBAR_ROUTES,
    });
    return shouldHide;
  }, [isAuthenticated, pathname]);

  if (shouldHideSidebar()) {
    console.debug('[Sidebar] Sidebar hidden');
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
              onClick={() => setIsOpen(false)}
              className={`${styles.menuItem} ${pathname === '/dashboard' ? styles.active : ''}`}
            >
              <i className="fas fa-th-large"></i>
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              href="/suratjalan"
              onClick={() => setIsOpen(false)}
              className={`${styles.menuItem} ${pathname === '/suratjalan' ? styles.active : ''}`}
            >
              <i className="fas fa-envelope"></i>
              <span>Surat Jalan</span>
            </Link>
          </li>
          <li>
            <Link
              href="/stokgudang"
              onClick={() => setIsOpen(false)}
              className={`${styles.menuItem} ${pathname === '/stokgudang' ? styles.active : ''}`}
            >
              <FaWarehouse className="text-xl" />
              <span>Stok Gudang</span>
            </Link>
          </li>
          <li>
            <Link
              href="/suratpo"
              onClick={() => setIsOpen(false)}
              className={`${styles.menuItem} ${pathname === '/suratpo' ? styles.active : ''}`}
            >
              <FaFileAlt className="text-xl" />
              <span>Surat PO</span>
            </Link>
          </li>
          <li>
            <Link
              href="/rekappo"
              onClick={() => setIsOpen(false)}
              className={`${styles.menuItem} ${pathname === '/rekappo' ? styles.active : ''}`}
            >
              <FaClipboardList className="text-xl" />
              <span className="flex items-center">
                Rekap PO
                {user?.role === 'superadmin' && (
                  <span className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded-full">
                    Superadmin
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
        onClick={() => {
          console.debug('[Sidebar] Toggle sidebar:', !isOpen);
          setIsOpen(!isOpen);
        }}
        type="button"
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>
    </div>
  );
};

export default Sidebar;