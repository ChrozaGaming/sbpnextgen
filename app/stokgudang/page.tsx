'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import DataStokMasuk from "@/components/stokgudang/StokMasuk/DataStokMasuk"
import DataStokKeluar from "@/components/stokgudang/StokKeluar/DataStokKeluar"
import StokGudang from "@/components/stokgudang/StokGudang/StokGudang"
import TambahProduk from "@/components/stokgudang/TambahProduk/TambahProduk"
import SubKategoriList from "@/components/stokgudang/SubKategoriMaterial/SubKategoriList"

export default function StokGudangPage() {
    const [activeTab, setActiveTab] = useState<'all' | 'masuk' | 'keluar' | 'tambah' | 'subkategori'>('all')
    const [isLoading, setIsLoading] = useState(true)
    const [userData, setUserData] = useState<{ role: string; username: string } | null>(null)
    const [authError, setAuthError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Periksa token di localStorage terlebih dahulu (alternatif)
                let token = localStorage.getItem('token');
                
                // Jika tidak ada di localStorage, coba cek di cookies
                if (!token) {
                    const tokenCookie = document.cookie
                        .split('; ')
                        .find(row => row.startsWith('token='));
                    token = tokenCookie ? tokenCookie.split('=')[1] : null;
                }

                // Periksa token di sessionStorage jika belum ditemukan
                if (!token) {
                    token = sessionStorage.getItem('token');
                }

                // Jika token masih tidak ditemukan
                if (!token) {
                    console.log('Token tidak ditemukan di cookie, localStorage, atau sessionStorage');
                    router.push('/login?redirect=/stokgudang');
                    return;
                }

                // Tambahkan console.log untuk debugging
                console.log('Token ditemukan, mencoba mengakses API');
                const response = await fetch('/api/user', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    // Dapatkan pesan error dari response
                    const errorData = await response.json();
                    console.error('Error response:', errorData);
                    
                    // Jika 401 atau 403, token mungkin tidak valid
                    if (response.status === 401 || response.status === 403) {
                        throw new Error('Token tidak valid atau kedaluwarsa');
                    }
                    
                    throw new Error(`Gagal mengambil data pengguna: ${errorData.message || response.statusText}`);
                }

                const data = await response.json();
                // Log untuk debugging
                console.log('Data pengguna diterima:', data);
                
                // Periksa struktur data
                if (!data.data || typeof data.data.role !== 'string') {
                    console.error('Format data tidak valid:', data);
                    setAuthError('Data pengguna tidak valid');
                    setIsLoading(false);
                    return;
                }

                // Normalisasi role untuk mencegah masalah case sensitivity
                const userRole = data.data.role.toLowerCase();
                console.log('Role pengguna (ternormalisasi):', userRole);

                // Validasi role
                if (userRole !== 'admingudang' && userRole !== 'superadmin') {
                    console.error(`Role tidak diizinkan: ${userRole}`);
                    router.push('/unauthorized');
                    return;
                }

                setUserData(data.data);
                setIsLoading(false);

            } catch (error) {
                console.error('Pemeriksaan autentikasi gagal:', error);
                setAuthError(error instanceof Error ? error.message : 'Error tidak diketahui');
                setIsLoading(false);
                // Tampilkan opsi untuk login ulang
            }
        };

        checkAuth();
    }, [router]);

    // Tampilkan indikator loading yang lebih informatif
    if (isLoading) {
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
                    <button 
                        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={() => router.push('/login?redirect=/stokgudang')}
                    >
                        Kembali ke Login
                    </button>
                </div>
            </div>
        );
    }

    // Jika data user tidak ada tapi juga tidak loading/error, redirect ke login
    if (!userData) {
        router.push('/login?redirect=/stokgudang');
        return null;
    }

    // Validasi role lagi untuk memastikan (sudah dalam normalisasi lowercase)
    const normalizedRole = userData.role.toLowerCase();
    if (normalizedRole !== 'admingudang' && normalizedRole !== 'superadmin') {
        router.push('/unauthorized');
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
                {userData && (
                    <div className="text-sm text-gray-600">
                        Login sebagai: {userData.username} ({userData.role})
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
