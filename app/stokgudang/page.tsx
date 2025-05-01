/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import DataStokMasuk from "@/components/stokgudang/StokMasuk/DataStokMasuk"
import DataStokKeluar from "@/components/stokgudang/StokKeluar/DataStokKeluar"
import StokGudang from "@/components/stokgudang/StokGudang/StokGudang"
import TambahProduk from "@/components/stokgudang/TambahProduk/TambahProduk"
import SubKategoriList from "@/components/stokgudang/SubKategoriMaterial/SubKategoriList"
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import { useAuth } from '@/context/AuthContext' // Gunakan AuthContext yang sudah ada

export default function StokGudangPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'masuk' | 'keluar' | 'tambah' | 'subkategori'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const router = useRouter()
  const { user, loading: authLoading } = useAuth() // Gunakan context auth yang sudah ada

  // Fungsi untuk menampilkan SweetAlert dan redirect
  const showAccessDeniedAlert = (message: string, redirectPath: string) => {
    try {
      console.log('Menampilkan SweetAlert untuk akses ditolak...');
      Swal.fire({
        title: 'Akses Dibatasi',
        text: message,
        icon: 'warning',
        confirmButtonText: 'Login Ulang',
        confirmButtonColor: '#3085d6',
      }).then((result) => {
        router.push(redirectPath);
      }).catch(error => {
        console.error('Error saat menampilkan SweetAlert:', error);
        alert(message);
        router.push(redirectPath);
      });
    } catch (error) {
      console.error('Gagal menampilkan SweetAlert:', error);
      alert(message);
      router.push(redirectPath);
    }
  };

  // Perbaikan: Fungsi untuk memeriksa apakah role diizinkan
  const isAllowedRole = (role: string): boolean => {
    if (!role) return false;
    
    // Normalisasi role - lowercase dan trim
    const normalizedRole = role.toLowerCase().trim();
    console.log(`Memeriksa role: '${normalizedRole}'`);
    
    // Tambahkan log untuk debugging
    console.log('Apakah role adalah admingudang?', normalizedRole === 'admingudang');
    console.log('Apakah role adalah superadmin?', normalizedRole === 'superadmin');
    
    // Izinkan variasi penulisan role
    return ['admingudang', 'admin gudang', 'admin_gudang', 'superadmin', 'super admin', 'super_admin'].includes(normalizedRole);
  }

  useEffect(() => {
    // Jika auth context masih loading, tunggu
    if (authLoading) {
      return;
    }

    // Jika sudah selesai loading, tapi user tidak ada, berarti belum login
    if (!user) {
      console.log('User tidak ditemukan di context auth');
      showAccessDeniedAlert('Untuk mengakses halaman Stok Gudang, Anda perlu login terlebih dahulu.', '/login?redirect=/stokgudang');
      return;
    }

    // Jika user ada tapi role tidak sesuai
    if (!isAllowedRole(user.role)) {
      console.log(`Role tidak diizinkan: ${user.role}`);
      showAccessDeniedAlert(`Akses tidak diizinkan untuk role: ${user.role}. Hanya Admin Gudang dan Superadmin yang dapat mengakses halaman ini.`, '/unauthorized');
      return;
    }

    // Jika sudah melewati semua pengecekan, set loading false
    setIsLoading(false);

  }, [user, authLoading, router]);

  // Tampilkan indikator loading yang lebih informatif
  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="mt-4">Memuat data pengguna...</span>
      </div>
    );
  }

  // Tampilkan pesan error jika ada
  if (authError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
          <h2 className="font-bold mb-2">Error Autentikasi</h2>
          <p>{authError}</p>
          <div className="flex space-x-2 mt-4">
            <button 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => router.push('/login?redirect=/stokgudang')}
            >
              Kembali ke Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Jika data user tidak ada tapi juga tidak loading/error, redirect ke login
  if (!user) {
    router.push('/login?redirect=/stokgudang');
    return null;
  }

  const tabStyle = (isActive: boolean) => ({
    padding: "8px 16px",
    border: "none",
    background: "none",
    borderBottom: isActive ? "2px solid #0066cc" : "none",
    color: isActive ? "#0066cc" : "#666",
    cursor: "pointer",
    fontSize: "16px"
  })

  return (
    <div style={{ padding: "24px" }}>
      <div className="flex justify-between items-center mb-6">
        <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>
          Stok Gudang
        </h1>
        {user && (
          <div className="text-sm text-gray-600">
            Login sebagai: {user.username} ({user.role})
          </div>
        )}
      </div>

      <div style={{
        borderBottom: "1px solid #ccc",
        marginBottom: "24px",
        display: "flex",
        gap: "8px",
        flexWrap: "wrap"
      }}>
        <button
          onClick={() => setActiveTab('all')}
          style={tabStyle(activeTab === 'all')}
        >
          Semua Stok
        </button>
        <button
          onClick={() => setActiveTab('masuk')}
          style={tabStyle(activeTab === 'masuk')}
        >
          Stok Masuk
        </button>
        <button
          onClick={() => setActiveTab('keluar')}
          style={tabStyle(activeTab === 'keluar')}
        >
          Stok Keluar
        </button>
        <button
          onClick={() => setActiveTab('tambah')}
          style={tabStyle(activeTab === 'tambah')}
        >
          Tambah Produk
        </button>
        <button
          onClick={() => setActiveTab('subkategori')}
          style={tabStyle(activeTab === 'subkategori')}
        >
          Daftar Produk
        </button>
      </div>

      <div>
        {activeTab === 'all' && <StokGudang />}
        {activeTab === 'masuk' && <DataStokMasuk />}
        {activeTab === 'keluar' && <DataStokKeluar />}
        {activeTab === 'tambah' && <TambahProduk />}
        {activeTab === 'subkategori' && <SubKategoriList />}
      </div>
    </div>
  )
}
