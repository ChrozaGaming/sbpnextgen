/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RekapAbsensi from '@/components/AbsensiPegawai/RekapAbsensi';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { useAuth } from '@/context/AuthContext';

export default function RekapAbsensiPage() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Function to display SweetAlert and redirect
  const showAccessDeniedAlert = (message: string, redirectPath: string) => {
    try {
      console.log('Menampilkan SweetAlert untuk akses ditolak...');
      Swal.fire({
        title: 'Akses Dibatasi',
        text: message,
        icon: 'warning',
        confirmButtonText: 'Kembali',
        confirmButtonColor: '#3085d6',
        allowOutsideClick: false,
        heightAuto: false
      }).then((result) => {
        router.push(redirectPath);
      }).catch(error => {
        console.error('Error saat menampilkan SweetAlert:', error);
        alert(message);
        router.push(redirectPath);
      });
    } catch (error) {
      console.error('Error showing SweetAlert:', error);
      alert(message);
      router.push(redirectPath);
    }
  };

  // Check user authorization
  useEffect(() => {
    // Wait for authentication to complete
    if (authLoading) return;

    // If no user (not logged in)
    if (!user) {
      showAccessDeniedAlert(
        'Untuk mengakses halaman Rekap Absensi, Anda perlu login terlebih dahulu.',
        '/login?redirect=/rekapabsensi'
      );
      return;
    }

    // Validate role - only superadmin is allowed
    if (user.role.toLowerCase() !== 'superadmin') {
      console.log(`Role tidak diizinkan: ${user.role}`);
      showAccessDeniedAlert(
        'Anda tidak memiliki hak akses yang cukup untuk melihat halaman Rekap Absensi. Halaman ini hanya dapat diakses oleh Superadmin.',
        '/unauthorized'
      );
      return;
    }

    // If authorization passes, set loading to false
    setIsLoading(false);
  }, [authLoading, user, router]);

  // Show loading indicator
  if (authLoading || (isLoading && !user)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="mt-4 text-gray-700 dark:text-gray-300">Memuat data pengguna...</span>
      </div>
    );
  }

  // Additional security check - return null if not superadmin
  if (!user || user.role.toLowerCase() !== 'superadmin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Rekapitulasi Absensi Pegawai
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Informasi lengkap mengenai rekap absensi seluruh pegawai
            </p>
          </div>
          {user && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Login sebagai: {user.username} ({user.role})
            </div>
          )}
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <RekapAbsensi />
        </div>
      </div>
    </div>
  );
}
