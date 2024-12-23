import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import Select from 'react-select';

interface TambahStokProps {
    onSuccess?: () => void;
}

interface SubKategori {
    id: number;
    kategori_id: number;
    kode_item: string;
    nama: string;
    brand: string | null;
    satuan: 'kg' | 'kgset' | 'pail' | 'galon5liter' | 'galon10liter' | 'pcs' | 'lonjor' | 'liter' | 'literset' | 'sak' | 'unit';
    status: 'aman' | 'rusak' | 'cacat' | 'sisa';
}

type KeteranganType = 'pembelian' | 'returbarangproyek' | 'warehouse';

const keteranganOptions = [
    { value: 'pembelian', label: 'Pembelian' },
    { value: 'returbarangproyek', label: 'Retur Barang Proyek' },
    {
        value: 'warehouse',
        label: 'Warehouse',
        disabled: true,
        description: '(Coming Soon)'
    },
] as const;

const TambahStok: React.FC<TambahStokProps> = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        kode: '',
        nama: '',
        brand: '',
        kategori: '',
        sub_kategori_id: '',
        stok_masuk: '',
        satuan: '',
        lokasi: '',
        tanggal_masuk: dayjs().format('YYYY-MM-DD'),
        keterangan: '' as KeteranganType | ''
    });

    const [subKategoriList, setSubKategoriList] = useState<SubKategori[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const customSelectStyles = {
        control: (provided: any) => ({
            ...provided,
            backgroundColor: 'white',
            borderColor: '#E5E7EB',
            borderRadius: '0.375rem',
            minHeight: '3rem',
            height: '3rem',
            boxShadow: 'none',
            padding: '0 0.5rem',
            fontSize: '1rem',
            '&:hover': {
                borderColor: '#3B82F6'
            }
        }),
        menu: (provided: any) => ({
            ...provided,
            borderRadius: '0.375rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            fontSize: '1rem'
        }),
        option: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#2563EB' : state.isFocused ? '#BFDBFE' : 'white',
            color: state.isSelected ? 'white' : '#1F2937',
            padding: '0.75rem 1rem',
            fontSize: '1rem',
            '&:active': {
                backgroundColor: '#2563EB'
            }
        }),
        input: (provided: any) => ({
            ...provided,
            height: '2rem',
            fontSize: '1rem'
        }),
        placeholder: (provided: any) => ({
            ...provided,
            fontSize: '1rem'
        }),
        singleValue: (provided: any) => ({
            ...provided,
            fontSize: '1rem'
        })
    };

    const getSatuanLabel = (satuan: string): string => {
        const satuanMap: { [key: string]: string } = {
            'kg': 'Kilogram',
            'kgset': 'Kilogram Set',
            'pail': 'Pail',
            'galon5liter': 'Galon 5 Liter',
            'galon10liter': 'Galon 10 Liter',
            'pcs': 'Pieces',
            'lonjor': 'Lonjor',
            'liter': 'Liter',
            'literset': 'Liter Set',
            'sak': 'Sak',
            'unit': 'Unit'
        };
        return satuanMap[satuan] || satuan;
    };

    const subKategoriOptions = subKategoriList.map(item => ({
        value: item.id.toString(),
        label: `${item.kode_item} - ${item.nama}${item.brand ? ` (${item.brand})` : ''}`,
        data: item
    }));

    useEffect(() => {
        if (formData.kategori) {
            fetchSubKategori();
        }
    }, [formData.kategori]);

    const fetchSubKategori = async () => {
        if (!formData.kategori) return;
        try {
            setLoading(true);
            const response = await fetch(`/api/sub-kategori-material?kategori_id=${formData.kategori}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.success) {
                setSubKategoriList(data.data);
            } else {
                throw new Error(data.message || 'Failed to fetch sub kategori');
            }
        } catch (error) {
            console.error('Error fetching sub kategori:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch sub kategori');
            setSubKategoriList([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubKategoriChange = (selectedOption: any) => {
        if (selectedOption) {
            const selectedSubKategori = selectedOption.data;
            setFormData(prev => ({
                ...prev,
                sub_kategori_id: selectedOption.value,
                kode: selectedSubKategori.kode_item,
                nama: selectedSubKategori.nama,
                brand: selectedSubKategori.brand || '',
                satuan: selectedSubKategori.satuan
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                sub_kategori_id: '',
                kode: '',
                nama: '',
                brand: '',
                satuan: ''
            }));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'kategori') {
            setFormData(prev => ({
                ...prev,
                sub_kategori_id: '',
                kode: '',
                nama: '',
                brand: '',
                satuan: ''
            }));
        }
    };

    const validateForm = () => {
        if (!formData.kategori) return "Kategori harus dipilih";
        if (!formData.sub_kategori_id) return "Sub Kategori harus dipilih";
        if (!formData.stok_masuk || parseInt(formData.stok_masuk) <= 0) return "Stok masuk harus lebih dari 0";
        if (!formData.lokasi) return "Lokasi harus diisi";
        if (!formData.tanggal_masuk) return "Tanggal masuk harus diisi";
        if (!formData.keterangan) return "Keterangan harus dipilih";
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Create the data object to send
        const dataToSend = {
            kode: formData.kode,
            nama: formData.nama,
            kategori: formData.kategori === '1' ? 'material' :
                formData.kategori === '2' ? 'alat' : 'consumable',
            sub_kategori_id: parseInt(formData.sub_kategori_id),
            stok_masuk: parseInt(formData.stok_masuk),
            satuan: formData.satuan,
            lokasi: formData.lokasi,
            tanggal_entry: new Date().toISOString(), // Add this
            tanggal_masuk: formData.tanggal_masuk,
            keterangan: formData.keterangan || null
        };

        console.log('Sending data:', dataToSend); // Debug log

        try {
            const response = await fetch('/api/stok', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                onSuccess?.();
                // Reset form
                setFormData({
                    kode: '',
                    nama: '',
                    brand: '',
                    kategori: '',
                    sub_kategori_id: '',
                    stok_masuk: '',
                    satuan: '',
                    lokasi: '',
                    tanggal_masuk: dayjs().format('YYYY-MM-DD'),
                    keterangan: ''
                });
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setError(error instanceof Error ? error.message : 'Failed to add stock');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200 max-w-7xl mx-auto my-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Tambah Stok Material</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}


                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2">
                    <div className="space-y-2">
                        <label className="block text-base font-medium text-gray-700 mb-2">Kategori</label>
                        <select
                            name="kategori"
                            value={formData.kategori}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-12 text-base px-4"
                            required
                        >
                            <option value="">Pilih Kategori</option>
                            <option value="1">Material</option>
                            <option value="2">Alat</option>
                            <option value="3">Consumable</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-base font-medium text-gray-700 mb-2">Sub Kategori</label>
                        <Select
                            value={subKategoriOptions.find(option => option.value === formData.sub_kategori_id)}
                            onChange={handleSubKategoriChange}
                            options={subKategoriOptions}
                            isDisabled={!formData.kategori || loading}
                            isLoading={loading}
                            placeholder={loading ? "Loading..." : "Pilih atau Ketik Sub Kategori"}
                            isClearable
                            styles={customSelectStyles}
                            className="react-select-container"
                            classNamePrefix="react-select"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-base font-medium text-gray-700 mb-2">Kode</label>
                        <input
                            type="text"
                            name="kode"
                            value={formData.kode}
                            readOnly
                            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-12 text-base px-4"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-base font-medium text-gray-700 mb-2">Nama</label>
                        <input
                            type="text"
                            name="nama"
                            value={formData.nama}
                            readOnly
                            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-12 text-base px-4"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-base font-medium text-gray-700 mb-2">Brand</label>
                        <input
                            type="text"
                            name="brand"
                            value={formData.brand}
                            readOnly
                            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-12 text-base px-4"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-base font-medium text-gray-700 mb-2">Stok Masuk</label>
                        <input
                            type="number"
                            name="stok_masuk"
                            value={formData.stok_masuk}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-12 text-base px-4"
                            required
                            min="1"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-base font-medium text-gray-700 mb-2">Satuan</label>
                        <input
                            type="text"
                            name="satuan"
                            value={formData.satuan ? getSatuanLabel(formData.satuan) : ''}
                            readOnly
                            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-12 text-base px-4"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-base font-medium text-gray-700 mb-2">Lokasi</label>
                        <input
                            type="text"
                            name="lokasi"
                            value={formData.lokasi}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-12 text-base px-4"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-base font-medium text-gray-700 mb-2">Tanggal Masuk</label>
                        <input
                            type="date"
                            name="tanggal_masuk"
                            value={formData.tanggal_masuk}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-12 text-base px-4"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-base font-medium text-gray-700 mb-2">Keterangan</label>
                        <select
                            name="keterangan"
                            value={formData.keterangan}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-12 text-base px-4"
                            required
                        >
                            <option value="">Pilih Keterangan</option>
                            {keteranganOptions.map((option) => (
                                <option
                                    key={option.value}
                                    value={option.value}
                                    disabled={option.disabled}
                                    title={option.disabled ? "Fitur ini akan segera hadir!" : undefined}
                                >
                                    {option.label} {option.description}
                                </option>
                            ))}
                        </select>
                        {formData.keterangan === 'warehouse' && (
                            <p className="mt-2 text-sm text-red-500 italic">
                                Maaf, fitur ini akan segera hadir!
                            </p>
                        )}
                    </div>
                </div>

                {/* Pernyataan Persetujuan */}
                <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-bold text-yellow-800 uppercase mb-2">
                                PERNYATAAN TANGGUNG JAWAB
                            </h3>
                            <div className="text-sm text-yellow-700 font-medium space-y-2">
                                <p>
                                    Dengan ini saya menyatakan:
                                </p>
                                <p className="font-bold">
                                    "SAYA BERSUNGGUH-SUNGGUH MENGISI DATA DENGAN VALID DAN BENAR! DATA TIDAK DAPAT DIEDIT ATAU DIHAPUS KECUALI DENGAN ADANYA PERSETUJUAN SISTEM ADMINISTRASI."
                                </p>
                                <p>
                                    Saya menyadari sepenuhnya bahwa:
                                </p>
                                <ul className="list-disc ml-5 space-y-1">
                                    <li>Data yang dimasukkan bersifat permanen dan tidak dapat diubah tanpa persetujuan sistem administrasi</li>
                                    <li>Saya bertanggung jawab penuh atas kebenaran data yang diinput</li>
                                    <li>Saya bersedia menerima sanksi sesuai kebijakan perusahaan jika terbukti memasukkan data yang tidak valid</li>
                                    <li>Tindakan ini tunduk pada peraturan dan kebijakan Hukum PT SINAR BUANA PRIMA</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-200 mt-8">
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex justify-center py-3 px-8 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Menyimpan...
                                </span>
                            ) : (
                                'Simpan'
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default TambahStok;