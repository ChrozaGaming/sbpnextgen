// components/stokgudang/StokGudang/TambahBarang.tsx

import React, { useState, useEffect } from 'react';

interface SubKategoriMaterial {
    id: number;
    kategori_id: number;
    kode_item: string;
    nama: string;
    brand: string | null;
    status: string;
    keterangan: string;
}

interface KategoriOption {
    id: number;
    nama: string;
    kode: string;
}

interface TambahBarangProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

const TambahBarang: React.FC<TambahBarangProps> = ({ onSuccess, onCancel }) => {
    const [formData, setFormData] = useState<Partial<SubKategoriMaterial>>({
        kategori_id: 1,
        kode_item: '',
        nama: '',
        brand: '',
        status: 'aman',
        keterangan: ''
    });

    const [kategoriOptions, setKategoriOptions] = useState<KategoriOption[]>([]);
    const [message, setMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        fetchKategori();
    }, []);

    const fetchKategori = async () => {
        try {
            const response = await fetch('/api/stokgudang/kategori');
            const data = await response.json();

            if (data.success) {
                setKategoriOptions(data.data);
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            setError('Gagal memuat kategori');
            console.error('Error fetching categories:', err);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = (): boolean => {
        if (!formData.kategori_id || !formData.kode_item || !formData.nama) {
            setError('Mohon lengkapi semua field yang wajib diisi');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch('/api/stokgudang/tambahbarang', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                setMessage('Barang berhasil ditambahkan!');
                resetForm();
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal menambahkan barang');
            console.error('Error adding item:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            kategori_id: 1,
            kode_item: '',
            nama: '',
            brand: '',
            status: 'aman',
            keterangan: ''
        });
        setError('');
        setMessage('');
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Tambah Barang Baru</h2>
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="text-gray-600 hover:text-gray-800"
                        type="button"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                )}
            </div>

            {error && (
                <div className="mb-4 p-3 rounded bg-red-100 text-red-700">
                    {error}
                </div>
            )}

            {message && (
                <div className="mb-4 p-3 rounded bg-green-100 text-green-700">
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Kategori <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="kategori_id"
                            value={formData.kategori_id}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        >
                            {kategoriOptions.map(kategori => (
                                <option key={kategori.id} value={kategori.id}>
                                    {kategori.nama}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Kode Item <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="kode_item"
                            value={formData.kode_item}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nama Barang <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="nama"
                            value={formData.nama}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Brand
                        </label>
                        <input
                            type="text"
                            name="brand"
                            value={formData.brand || ''}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                    >
                        <option value="aman">Aman</option>
                        <option value="rusak">Rusak</option>
                        <option value="cacat">Cacat</option>
                        <option value="sisa">Sisa</option>
                    </select>

                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Keterangan
                    </label>
                    <textarea
                        name="keterangan"
                        value={formData.keterangan}
                        onChange={handleChange}
                        rows={3}
                        className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Batal
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                            isLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {isLoading ? 'Menyimpan...' : 'Simpan'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TambahBarang;
