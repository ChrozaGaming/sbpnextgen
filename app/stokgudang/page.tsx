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
    const router = useRouter()

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

                if (!token) {
                    router.push('/login?redirect=/stokgudang');
                    return;
                }

                const response = await fetch('/api/user', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }

                const data = await response.json();

                if (data.data.role !== 'admingudang' && data.data.role !== 'superadmin') {
                    router.push('/unauthorized');
                    return;
                }

                setUserData(data.data);
                setIsLoading(false);

            } catch (error) {
                console.error('Auth check failed:', error);
                router.push('/login?redirect=/stokgudang');
            }
        };

        checkAuth();
    }, [router]);

    const tabStyle = (isActive: boolean) => ({
        padding: "8px 16px",
        border: "none",
        background: "none",
        borderBottom: isActive ? "2px solid #0066cc" : "none",
        color: isActive ? "#0066cc" : "#666",
        cursor: "pointer",
        fontSize: "16px"
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3">Memuat...</span>
            </div>
        );
    }

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
