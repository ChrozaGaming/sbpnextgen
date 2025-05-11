/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-expressions */
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  FaBars,
  FaTimes,
  FaWarehouse,
  FaClipboardList,
  FaFileAlt,
  FaUserClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaInfoCircle,
  FaBell,
  FaArrowRight,
  FaCalendarAlt,
} from "react-icons/fa";
import styles from "./Sidebar.module.css";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { NO_SIDEBAR_ROUTES } from "@/config/route";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface AbsensiStatus {
  sudahAbsen: boolean;
  tanggal?: string;
  waktu?: string;
  status?: string;
  keterangan?: string;
}

function clearAllCookies() {
  if (typeof document === "undefined") return;
  const cookies = document.cookie ? document.cookie.split(";") : [];
  for (const cookie of cookies) {
    const eqPos = cookie.indexOf("=");
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
  const [absensiStatus, setAbsensiStatus] = useState<AbsensiStatus | null>(
    null
  );
  const [loadingStatus, setLoadingStatus] = useState(false);

  // Fetch absensi status
  useEffect(() => {
    const checkAbsensiStatus = async () => {
      if (!user || user.role === "superadmin") return;
      try {
        setLoadingStatus(true);
        const response = await fetch("/api/absensipegawai/status");
        if (response.ok) {
          const data = await response.json();
          setAbsensiStatus(data);
        }
      } catch (error) {
        console.error("Error fetching absensi status:", error);
      } finally {
        setLoadingStatus(false);
      }
    };

    checkAbsensiStatus();
    // Check status every 5 minutes
    const interval = setInterval(checkAbsensiStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  // Debugging output
  console.debug("[Sidebar] pathname:", pathname);
  console.debug("[Sidebar] user:", user);
  console.debug("[Sidebar] isAuthenticated:", isAuthenticated);
  console.debug("[Sidebar] NO_SIDEBAR_ROUTES:", NO_SIDEBAR_ROUTES);

  const handleLogout = () => {
    try {
      console.debug("[Sidebar] Logging out...");
      clearAllCookies();
      logout && logout();
      setIsOpen(false);
    } catch (error) {
      console.error("[Sidebar] Logout error:", error);
    }
  };

  const shouldHideSidebar = useCallback(() => {
    const shouldHide =
      !isAuthenticated ||
      (pathname && NO_SIDEBAR_ROUTES.includes(pathname as any));
    console.debug("[Sidebar] shouldHideSidebar:", shouldHide, {
      isAuthenticated,
      pathname,
      NO_SIDEBAR_ROUTES,
    });
    return shouldHide;
  }, [isAuthenticated, pathname]);

  if (shouldHideSidebar()) {
    console.debug("[Sidebar] Sidebar hidden");
    return null;
  }

  // Don't show absensi menu for superadmin
  const showAbsensiMenu = user && user.role !== "superadmin";
  // Only show rekap absensi menu for superadmin
  const isSuperAdmin = user && user.role === "superadmin";

  // Helper function to get status icon and color
  const getStatusInfo = (status?: string) => {
    if (!status) return { icon: <FaInfoCircle />, color: "text-gray-400" };
    switch (status.toLowerCase()) {
      case "hadir":
        return { icon: <FaCheckCircle />, color: "text-green-500" };
      case "terlambat":
        return { icon: <FaClock />, color: "text-yellow-500" };
      case "alpha":
        return { icon: <FaExclamationTriangle />, color: "text-red-500" };
      default:
        return { icon: <FaInfoCircle />, color: "text-blue-500" };
    }
  };

  return (
    <div className={styles.sidebarContainer}>
      <div
        className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}
      >
        <div className={styles.logo}>
          <span>SBP APP</span>
        </div>

        <ul className={styles.menu}>
          <li>
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className={`${styles.menuItem} ${
                pathname === "/dashboard" ? styles.active : ""
              }`}
            >
              <i className="fas fa-th-large"></i>
              <span>Dashboard</span>
            </Link>
          </li>
          {/* Absensi Pegawai navigation item with status */}
          {showAbsensiMenu && (
            <li>
              <div className="flex flex-col">
                <Link
                  href="/absensipegawai"
                  onClick={() => setIsOpen(false)}
                  className={`${styles.menuItem} ${
                    pathname === "/absensipegawai" ? styles.active : ""
                  }`}
                >
                  <FaUserClock className="text-xl" />
                  <span>Absensi Pegawai</span>
                </Link>
                {/* Absensi status indicator */}
                {loadingStatus ? (
                  <div className="text-xs ml-8 mt-1 text-gray-400">
                    Memuat status...
                  </div>
                ) : absensiStatus ? (
                  <div className="text-xs ml-8 mt-1">
                    {absensiStatus.sudahAbsen ? (
                      <div className="space-y-0.5">
                        <div className="flex items-center">
                          {getStatusInfo(absensiStatus.status).icon}
                          <span
                            className={`ml-1 ${
                              getStatusInfo(absensiStatus.status).color
                            } font-medium`}
                          >
                            Status: {absensiStatus.status || "Tercatat"}
                          </span>
                        </div>
                        {absensiStatus.waktu && (
                          <div className="ml-5 text-gray-400">
                            Pukul: {absensiStatus.waktu}
                          </div>
                        )}
                        {absensiStatus.status?.toLowerCase() === "terlambat" &&
                          absensiStatus.keterangan && (
                            <div className="ml-5 text-gray-400 italic">
                              &rdquo;{absensiStatus.keterangan}&rdquo;
                            </div>
                          )}
                      </div>
                    ) : (
                      <div className="rounded-md bg-yellow-100 p-2 mt-1">
                        <div className="flex items-center">
                          <FaBell className="text-yellow-600" />
                          <span className="ml-1 text-yellow-800 font-semibold">
                            Silahkan absensi hari ini!
                          </span>
                        </div>
                        <div className="mt-1 ml-5 text-xs text-yellow-700">
                          Anda belum melakukan absensi pada hari ini
                        </div>
                        <Link
                          href="/absensipegawai"
                          className="flex items-center justify-center mt-2 text-xs bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-2 rounded-md transition-colors duration-200"
                          onClick={() => setIsOpen(false)}
                        >
                          <span>Absensi Sekarang</span>
                          <FaArrowRight className="ml-1" size={10} />
                        </Link>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </li>
          )}
          {/* Rekap Absensi for Superadmin only */}
          {isSuperAdmin && (
            <li>
              <Link
                href="/rekapabsensi"
                onClick={() => setIsOpen(false)}
                className={`${styles.menuItem} ${
                  pathname === "/rekapabsensi" ? styles.active : ""
                }`}
              >
                <FaCalendarAlt className="text-xl" />
                <span className="flex items-center">
                  Rekap Absensi
                  <span className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded-full">
                    Superadmin
                  </span>
                </span>
              </Link>
            </li>
          )}
          <li>
            <Link
              href="/suratjalan"
              onClick={() => setIsOpen(false)}
              className={`${styles.menuItem} ${
                pathname === "/suratjalan" ? styles.active : ""
              }`}
            >
              <i className="fas fa-envelope"></i>
              <span>Surat Jalan</span>
            </Link>
          </li>
          <li>
            <Link
              href="/stokgudang"
              onClick={() => setIsOpen(false)}
              className={`${styles.menuItem} ${
                pathname === "/stokgudang" ? styles.active : ""
              }`}
            >
              <FaWarehouse className="text-xl" />
              <span>Stok Gudang</span>
            </Link>
          </li>
          <li>
            <Link
              href="/suratpo"
              onClick={() => setIsOpen(false)}
              className={`${styles.menuItem} ${
                pathname === "/suratpo" ? styles.active : ""
              }`}
            >
              <FaFileAlt className="text-xl" />
              <span>Surat PO</span>
            </Link>
          </li>
          <li>
            <Link
              href="/rekappo"
              onClick={() => setIsOpen(false)}
              className={`${styles.menuItem} ${
                pathname === "/rekappo" ? styles.active : ""
              }`}
            >
              <FaClipboardList className="text-xl" />
              <span className="flex items-center">
                Rekap PO
                {user?.role === "superadmin" && (
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
          console.debug("[Sidebar] Toggle sidebar:", !isOpen);
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
