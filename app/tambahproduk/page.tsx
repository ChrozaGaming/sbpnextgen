'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const TambahProdukPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', content: '' });
    const [formState, setFormState] = useState({
        kategori_id: '',
        kode_item: '',
        nama: '',
        brand: '',
        satuan: '',
        status: 'aman',
        keterangan: ''
    });

    const kategoriOptions = [
        { value: 1, label: 'Material', name: 'Material' },
        { value: 2, label: 'Alat', name: 'Alat' },
        { value: 3, label: 'Consumable', name: 'Consumable' }
    ];

    const statusOptions = [
        { value: 'aman', label: 'Aman' },
        { value: 'rusak', label: 'Rusak' },
        { value: 'cacat', label: 'Cacat' },
        { value: 'sisa', label: 'Sisa' }
    ];

    const satuanOptions = [
        { value: 'kg', label: 'Kilogram (kg)' },
        { value: 'kgset', label: 'Kilogram Set (kg set)' },
        { value: 'pail', label: 'Pail' },
        { value: 'galon5liter', label: 'Galon 5 Liter' },
        { value: 'galon10liter', label: 'Galon 10 Liter' },
        { value: 'pcs', label: 'Pieces (pcs)' },
        { value: 'lonjor', label: 'Lonjor' },
        { value: 'liter', label: 'Liter' },
        { value: 'literset', label: 'Liter Set' },
        { value: 'sak', label: 'Sak' },
        { value: 'unit', label: 'Unit' }
    ];

    const capitalizeWords = (str: string) => {
        return str.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    const getCurrentCategoryName = () => {
        if (!formState.kategori_id) return 'Produk';
        const category = kategoriOptions.find(opt => opt.value === Number(formState.kategori_id));
        return category ? category.name : 'Produk';
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        let formattedValue = value;

        switch (name) {
            case 'kode_item':
                formattedValue = value.toUpperCase();
                break;
            case 'nama':
            case 'brand':
                formattedValue = capitalizeWords(value);
                break;
            default:
                formattedValue = value;
        }

        setFormState(prev => ({
            ...prev,
            [name]: formattedValue
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = {
                ...formState,
                kategori_id: Number(formState.kategori_id)
            };

            const response = await fetch('/api/stokgudang/sub-kategori', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (result.success) {
                setMessage({ type: 'success', content: 'Sub kategori berhasil ditambahkan' });
                setFormState({
                    kategori_id: '',
                    kode_item: '',
                    nama: '',
                    brand: '',
                    satuan: '',
                    status: 'aman',
                    keterangan: ''
                });
                setTimeout(() => router.refresh(), 2000);
            } else {
                throw new Error(result.message || 'Gagal menambahkan data');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage({
                type: 'error',
                content: error instanceof Error ? error.message : 'Gagal menambahkan sub kategori'
            });
        } finally {
            setLoading(false);
            setTimeout(() => setMessage({ type: '', content: '' }), 3000);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Tambahkan Produk </h1>

            {message.content && (
                <div className={`mb-4 p-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.content}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
                <div>
                    <label htmlFor="kategori_id" className="block text-sm font-medium text-gray-700 mb-1">
                        Kategori
                    </label>
                    <select
                        id="kategori_id"
                        name="kategori_id"
                        value={formState.kategori_id}
                        onChange={handleInputChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Pilih Kategori</option>
                        {kategoriOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="kode_item" className="block text-sm font-medium text-gray-700 mb-1">
                        Kode Item (Huruf Kapital)
                    </label>
                    <input
                        type="text"
                        id="kode_item"
                        name="kode_item"
                        value={formState.kode_item}
                        onChange={handleInputChange}
                        required
                        maxLength={20}
                        placeholder="Contoh: MAT-001"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        style={{ textTransform: 'uppercase' }}
                    />
                </div>

                <div>
                    <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-1">
                        Nama (Kapital Setiap Kata)
                    </label>
                    <input
                        type="text"
                        id="nama"
                        name="nama"
                        value={formState.nama}
                        onChange={handleInputChange}
                        required
                        maxLength={100}
                        placeholder={`Masukkan Nama ${getCurrentCategoryName()}`}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                        Brand (Kapital Setiap Kata)
                    </label>
                    <input
                        type="text"
                        id="brand"
                        name="brand"
                        value={formState.brand}
                        onChange={handleInputChange}
                        maxLength={100}
                        placeholder="Masukkan Brand"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label htmlFor="satuan" className="block text-sm font-medium text-gray-700 mb-1">
                        Satuan
                    </label>
                    <select
                        id="satuan"
                        name="satuan"
                        value={formState.satuan}
                        onChange={handleInputChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Pilih Satuan</option>
                        {satuanOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                    </label>
                    <select
                        id="status"
                        name="status"
                        value={formState.status}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                        {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="keterangan" className="block text-sm font-medium text-gray-700 mb-1">
                        Keterangan
                    </label>
                    <textarea
                        id="keterangan"
                        name="keterangan"
                        value={formState.keterangan}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Masukkan keterangan (opsional)"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 px-4 rounded-md text-white font-medium ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
                >
                    {loading ? 'Menyimpan...' : 'Simpan Sub Kategori'}
                </button>
            </form>
        </div>
    );
};

export default TambahProdukPage;