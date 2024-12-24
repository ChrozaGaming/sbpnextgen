'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Combobox } from '@headlessui/react';

interface FormState {
    kategori_id: string;
    kode_item: string;
    nama: string;
    brand: string;
    satuan: string;
    status: string;
    keterangan: string;
}

interface KategoriOption {
    value: number;
    label: string;
    name: string;
}

interface StatusOption {
    value: string;
    label: string;
}

interface SatuanOption {
    value: string;
    label: string;
}

interface BrandOption {
    value: string;
    label: string;
}

interface MessageState {
    type: string;
    content: string;
}

const TambahProduk = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [message, setMessage] = useState<MessageState>({ type: '', content: '' });
    const [brands, setBrands] = useState<BrandOption[]>([]);
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const [formState, setFormState] = useState<FormState>({
        kategori_id: '',
        kode_item: '',
        nama: '',
        brand: '',
        satuan: '',
        status: 'aman',
        keterangan: ''
    });

    const kategoriOptions: KategoriOption[] = [
        { value: 1, label: 'Material', name: 'Material' },
        { value: 2, label: 'Alat', name: 'Alat' },
        { value: 3, label: 'Consumable', name: 'Consumable' }
    ];

    const statusOptions: StatusOption[] = [
        { value: 'aman', label: 'AMAN' },
        { value: 'rusak', label: 'RUSAK' },
        { value: 'cacat', label: 'CACAT' },
        { value: 'sisa', label: 'SISA' }
    ];

    const satuanOptions: SatuanOption[] = [
        { value: 'kg', label: 'KILOGRAM (KG)' },
        { value: 'kgset', label: 'KILOGRAM SET (KG SET)' },
        { value: 'pail', label: 'PAIL' },
        { value: 'galon5liter', label: 'GALON 5 LITER' },
        { value: 'galon10liter', label: 'GALON 10 LITER' },
        { value: 'pcs', label: 'PIECES (PCS)' },
        { value: 'lonjor', label: 'LONJOR' },
        { value: 'liter', label: 'LITER' },
        { value: 'literset', label: 'LITER SET' },
        { value: 'sak', label: 'SAK' },
        { value: 'unit', label: 'UNIT' }
    ];

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const response = await fetch('/api/brands');
                const data = await response.json();
                if (data.success) {
                    const formattedBrands = data.brands.map((brand: string) => ({
                        value: brand,
                        label: brand.toUpperCase()
                    }));
                    setBrands(formattedBrands);
                }
            } catch (error) {
                console.error('Error fetching brands:', error);
            }
        };
        fetchBrands();
    }, []);

    const filteredBrands = React.useMemo(() => {
        if (!Array.isArray(brands)) return [];
        return query === ''
            ? brands
            : brands.filter((brand) =>
                brand.label
                    .toLowerCase()
                    .replace(/\s+/g, '')
                    .includes(query.toLowerCase().replace(/\s+/g, ''))
            );
    }, [brands, query]);

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
                formattedValue = capitalizeWords(value);
                break;
            case 'brand':
                formattedValue = value.toUpperCase();
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
        setShowModal(true);
    };

    const handleConfirmSubmit = async () => {
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
            setShowModal(false);
            setTimeout(() => setMessage({ type: '', content: '' }), 3000);
        }
    };

    return (
        <>
            <div className="max-w-2xl mx-auto p-6">
                <h1 className="text-2xl font-bold mb-6">Tambah Produk</h1>

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
                            Kode Item (HURUF KAPITAL)
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
                            Nama Brand (HURUF KAPITAL)
                        </label>
                        <Combobox
                            value={formState.brand}
                            onChange={value => setFormState(prev => ({
                                ...prev,
                                brand: value ? value.toUpperCase() : ''
                            }))}
                            as="div"
                        >
                            <div className="relative mt-1">
                                <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left border border-gray-300 focus-within:border-blue-500">
                                    <Combobox.Input
                                        className="w-full border-none p-2 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                                        onChange={(event) => {
                                            const value = event.target.value;
                                            setQuery(value);
                                            setIsOpen(true);
                                            setFormState(prev => ({
                                                ...prev,
                                                brand: value ? value.toUpperCase() : ''
                                            }));
                                        }}
                                        displayValue={(brand: string) => brand || ''}
                                        onClick={() => setIsOpen(true)}
                                        onFocus={() => setIsOpen(true)}
                                        placeholder="PILIH ATAU KETIK NAMA BRAND"
                                        style={{ textTransform: 'uppercase' }}
                                    />
                                    {formState.brand && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormState(prev => ({ ...prev, brand: '' }));
                                                setQuery('');
                                                setIsOpen(false);
                                            }}
                                            className="absolute inset-y-0 right-8 flex items-center pr-2 cursor-pointer"
                                        >
                                            <svg
                                                className="h-5 w-5 text-gray-400 hover:text-gray-600"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    )}
                                    <Combobox.Button
                                        className="absolute inset-y-0 right-0 flex items-center pr-2"
                                        onClick={() => setIsOpen(!isOpen)}
                                    >
                                        <svg
                                            className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </Combobox.Button>
                                </div>
                                {isOpen && (
                                    <Combobox.Options
                                        static
                                        className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                                    >
                                        {filteredBrands.length === 0 && query !== '' ? (
                                            <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                                                Brand baru akan ditambahkan
                                            </div>
                                        ) : (
                                            filteredBrands.map((brand) => (
                                                <Combobox.Option
                                                    key={brand.value}
                                                    value={brand.value}
                                                    className={({ active }) =>
                                                        `relative cursor-default select-none py-2 pl-4 pr-4 ${
                                                            active ? 'bg-blue-600 text-white' : 'text-gray-900'
                                                        }`
                                                    }
                                                    onClick={() => {
                                                        setIsOpen(false);
                                                        setQuery('');
                                                    }}
                                                >
                                                    {({ selected, active }) => (
                                                        <>
                                                            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                                                {brand.label}
                                                            </span>
                                                        </>
                                                    )}
                                                </Combobox.Option>
                                            ))
                                        )}
                                    </Combobox.Options>
                                )}
                            </div>
                        </Combobox>
                        <p className="mt-1 text-sm text-gray-500">
                            Pilih brand yang sudah ada atau  <b>Ketik Manual</b> nama brand baru jika belum terdaftar
                        </p>
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
                        className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                            loading
                                ? 'bg-blue-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                        }`}
                    >
                        {loading ? 'Menyimpan...' : 'Simpan Produk'}
                    </button>
                </form>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                                    <div className="flex items-center mb-4">
                                        <svg className="h-6 w-6 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <span className="font-bold text-lg">PERHATIAN!</span>
                                    </div>

                                    <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500">
                                        <div className="font-bold text-red-700 text-center space-y-1">
                                            <p>"SAYA BERSUNGGUH-SUNGGUH MENGISI DATA</p>
                                            <p>DENGAN VALID DAN BENAR,</p>
                                            <p>DAN DAPAT DIPERTANGGUNGJAWABKAN SELURUHNYA!"</p>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <p className="font-semibold mb-2">Detail Data yang akan disimpan:</p>
                                        <ul className="list-disc ml-5 space-y-1 text-gray-700">
                                            <li>Kategori: {kategoriOptions.find(opt => opt.value === Number(formState.kategori_id))?.label}</li>
                                            <li>Kode Item: {formState.kode_item}</li>
                                            <li>Nama: {formState.nama}</li>
                                            <li>Brand: {formState.brand || '-'}</li>
                                            <li>Satuan: {satuanOptions.find(opt => opt.value === formState.satuan)?.label}</li>
                                            <li>Status: {statusOptions.find(opt => opt.value === formState.status)?.label}</li>
                                        </ul>
                                    </div>

                                    <div className="border-t border-yellow-300 pt-3">
                                        <p className="font-semibold mb-2">Dengan menekan tombol SETUJU & SIMPAN, Saya menyatakan bahwa:</p>
                                        <ul className="list-disc ml-5 space-y-1 text-red-600 font-medium">
                                            <li>Data yang dimasukkan sudah VALID dan BENAR</li>
                                            <li>Data TIDAK DAPAT DIEDIT atau DIHAPUS tanpa persetujuan Sistem Administrasi</li>
                                            <li>Saya BERTANGGUNG JAWAB PENUH atas kebenaran data</li>
                                            <li>Saya SIAP MENERIMA SANKSI sesuai kebijakan PT SINAR BUANA PRIMA</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-4">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 font-medium"
                                    style={{ width: '100px' }}
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleConfirmSubmit}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                                    style={{ width: '150px' }}
                                    disabled={loading}
                                >
                                    {loading ? 'Menyimpan...' : 'SETUJU & SIMPAN'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TambahProduk;
