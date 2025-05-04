/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TabelRekapPO from "@/components/RekapPO/TabelRekapPO";
import { RekapPO } from "@/types/RekapPO";
import BuatRekapPO from "@/components/RekapPO/BuatRekapPO";
import CetakRekap from "@/components/RekapPO/CetakRekap";
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { useAuth } from '@/context/AuthContext'; // Gunakan AuthContext yang sudah ada

export default function RekapPOPage() {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [rekapData, setRekapData] = useState<RekapPO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(); // Gunakan context auth

  // Fungsi untuk menampilkan SweetAlert dan redirect
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

  // Periksa otorisasi pengguna
  useEffect(() => {
    // Tunggu autentikasi selesai
    if (authLoading) return;

    // Jika tidak ada user (tidak login)
    if (!user) {
      showAccessDeniedAlert(
        'Untuk mengakses halaman Rekap PO, Anda perlu login terlebih dahulu.',
        '/login?redirect=/rekappo'
      );
      return;
    }

    // Validasi role - hanya superadmin yang diperbolehkan
    if (user.role.toLowerCase() !== 'superadmin') {
      console.log(`Role tidak diizinkan: ${user.role}`);
      showAccessDeniedAlert(
        'Anda tidak memiliki hak akses yang cukup untuk melihat halaman Rekap PO. Halaman ini hanya dapat diakses oleh Superadmin.',
        '/unauthorized'
      );
      return;
    }

    // Jika lolos validasi, ambil data rekap PO
    fetchRekapData();
  }, [authLoading, user, router]);

  // Fetch data function
  const fetchRekapData = async () => {
    setDataLoading(true);
    try {
      const response = await fetch("/api/rekap-po");
      if (!response.ok) throw new Error("Failed to fetch data");
      const data = await response.json();
      setRekapData(data);
    } catch (error) {
      console.error("Error fetching rekap data:", error);
      try {
        await Swal.fire({
          title: 'Gagal Memuat Data',
          text: 'Terjadi kesalahan saat mengambil data Rekap PO. Silakan coba lagi nanti.',
          icon: 'error',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'Coba Lagi',
        });
      } catch (swalError) {
        console.error("SweetAlert error:", swalError);
        if (confirm('Gagal memuat data. Coba lagi?')) {
          fetchRekapData();
        }
      }
    } finally {
      setDataLoading(false);
      setIsLoading(false);
    }
  };

  // Handle refresh when counter changes
  useEffect(() => {
    if (user && user.role.toLowerCase() === 'superadmin') {
      fetchRekapData();
    }
  }, [refreshCounter, user]);

  const handleOpenFormModal = () => setIsFormModalOpen(true);
  const handleCloseFormModal = () => setIsFormModalOpen(false);
  const handleOpenExportModal = () => setIsExportModalOpen(true);
  const handleCloseExportModal = () => setIsExportModalOpen(false);

  const handleSaveSuccess = () => {
    setIsFormModalOpen(false);
    setRefreshCounter((prev) => prev + 1);
    try {
      Swal.fire({
        title: 'Berhasil!',
        text: 'Data Purchase Order baru berhasil disimpan',
        icon: 'success',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      });
    } catch (error) {
      console.error("SweetAlert error:", error);
      alert('Data Purchase Order baru berhasil disimpan');
    }
  };

  // Tampilkan indikator loading
  if (authLoading || (isLoading && !user)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="mt-4 text-gray-700 dark:text-gray-300">Memuat data pengguna...</span>
      </div>
    );
  }

  // Jika tidak ada user atau bukan superadmin, halaman sudah dialihkan oleh useEffect,
  // tapi tambahkan pengecekan tambahan untuk keamanan
  if (!user || user.role.toLowerCase() !== 'superadmin') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Rekapitulasi Purchase Order
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Informasi lengkap mengenai status dan progress purchase order
          </p>
        </div>
        {user && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Login sebagai: {user.username} ({user.role})
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Daftar Purchase Order
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Menampilkan seluruh data PO beserta status terkini
            </p>
          </div>
          <div className="flex gap-3">
            <button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleOpenExportModal}
              disabled={dataLoading || rekapData.length === 0}
            >
              Export Data
            </button>
            <button
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors"
              onClick={handleOpenFormModal}
            >
              Tambah PO Baru
            </button>
          </div>
        </div>
        <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
          {dataLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <TabelRekapPO
              key={refreshCounter}
              data={rekapData}
              onDataLoaded={(data: RekapPO[]) => setRekapData(data)}
            />
          )}
        </div>
      </div>

      {isFormModalOpen && (
        <BuatRekapPO
          onSave={handleSaveSuccess}
          onCancel={handleCloseFormModal}
        />
      )}

      {isExportModalOpen && (
        <CetakRekap onClose={handleCloseExportModal} data={rekapData} />
      )}
    </div>
  );
}
