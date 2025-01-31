'use client';

import React, { useState } from 'react';
import FormSuratPO from '@/components/SuratPO/FormSuratPO';
import TabelListSuratPO from '@/components/SuratPO/TabelListSuratPO';

export default function SuratPOPage() {
    const [refreshTable, setRefreshTable] = useState(false);

    // Fungsi untuk merefresh tabel setelah PO dibuat
    const handleFormSubmit = () => {
        setRefreshTable(!refreshTable); // Trigger refresh tabel
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-center mb-8">Manage Purchase Orders</h1>

            {/* Tabel untuk menampilkan daftar Purchase Order */}
            <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-4">List of Purchase Orders</h2>
                <TabelListSuratPO refresh={refreshTable} />
            </div>

            {/* Form untuk membuat Purchase Order */}
            <div>
                <h2 className="text-2xl font-semibold mb-4">Create Purchase Order</h2>
                <FormSuratPO onSubmitSuccess={handleFormSubmit} />
            </div>
        </div>
    );
}
