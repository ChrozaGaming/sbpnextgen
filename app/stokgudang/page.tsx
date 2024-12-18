'use client'

import { useState } from "react"
import DataStokMasuk from "@/components/stokgudang/StokMasuk/DataStokMasuk"
import DataStokKeluar from "@/components/stokgudang/StokKeluar/DataStokKeluar"
import StokGudang from "@/components/stokgudang/StokGudang/StokGudang"

export default function StokGudangPage() {
    const [activeTab, setActiveTab] = useState<'all' | 'masuk' | 'keluar'>('all')

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
            <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "24px" }}>
                Stok Gudang
            </h1>

            <div style={{
                borderBottom: "1px solid #ccc",
                marginBottom: "24px",
                display: "flex",
                gap: "8px"
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
            </div>

            <div>
                {activeTab === 'all' && <StokGudang />}
                {activeTab === 'masuk' && <DataStokMasuk />}
                {activeTab === 'keluar' && <DataStokKeluar />}
            </div>
        </div>
    )
}
