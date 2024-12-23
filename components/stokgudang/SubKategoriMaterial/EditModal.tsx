// components/stokgudang/SubKategoriMaterial/EditModal.tsx
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface SubKategoriMaterial {
    id: number;
    kategori_id: number;
    kategori_nama: string;
    kode_item: string;
    nama: string;
    brand: string | null;
    satuan: 'kg' | 'kgset' | 'pail' | 'galon5liter' | 'galon10liter' | 'pcs' | 'lonjor' | 'liter' | 'literset' | 'sak' | 'unit';
    status: 'aman' | 'rusak' | 'cacat' | 'sisa';
    keterangan: string | null;
    created_at: string;
    updated_at: string;
}

interface Kategori {
    id: number;
    nama: string;
}

interface EditModalProps {
    item: SubKategoriMaterial | null;
    onClose: () => void;
    onSuccess: () => void;
}

export const EditModal = ({ item, onClose, onSuccess }: EditModalProps) => {
    const [loading, setLoading] = useState(false);
    const [kategoris, setKategoris] = useState<Kategori[]>([]);
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [formData, setFormData] = useState<Partial<SubKategoriMaterial>>({
        kategori_id: item?.kategori_id || 0,
        kode_item: item?.kode_item || '',
        nama: item?.nama || '',
        brand: item?.brand || '',
        satuan: item?.satuan || 'pcs',
        status: item?.status || 'aman',
        keterangan: item?.keterangan || ''
    });

    const satuanOptions = [
        'kg', 'kgset', 'pail', 'galon5liter', 'galon10liter',
        'pcs', 'lonjor', 'liter', 'literset', 'sak', 'unit'
    ] as const;

    const statusOptions = ['aman', 'rusak', 'cacat', 'sisa'] as const;

    useEffect(() => {
        fetchKategoris();
    }, []);

    const fetchKategoris = async () => {
        try {
            const response = await fetch('/api/stokgudang/kategori-material');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            if (data.success) {
                setKategoris(data.data);
            } else {
                throw new Error(data.message || 'Failed to fetch categories');
            }
        } catch (error) {
            console.error('Error fetching kategoris:', error);
            toast.error('Gagal memuat data kategori');
        }
    };

    const handleAuthentication = () => {
        if (password === 'TES123') {
            setIsAuthenticated(true);
            setLoginAttempts(0);
            toast.success('Autentikasi berhasil');
        } else {
            setLoginAttempts(prev => prev + 1);
            setPassword(''); // Reset password input

            if (loginAttempts >= 2) {
                toast.error('Terlalu banyak percobaan! Silakan hubungi admin.', {
                    duration: 4000
                });
                setTimeout(() => {
                    onClose(); // Tutup modal setelah terlalu banyak percobaan
                }, 2000);
            } else {
                toast.error(`Password salah! Sisa percobaan: ${2 - loginAttempts}`, {
                    duration: 3000
                });
            }

            // Tambahkan efek getar
            const input = document.querySelector('input[type="password"]');
            input?.classList.add('shake-animation');
            setTimeout(() => {
                input?.classList.remove('shake-animation');
            }, 500);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.kategori_id || formData.kategori_id === 0) {
            toast.error('Pilih kategori terlebih dahulu');
            return;
        }

        try {
            setLoading(true);
            const url = item
                ? `/api/stokgudang/sub-kategori-material/${item.id}`
                : '/api/stokgudang/sub-kategori-material';

            const response = await fetch(url, {
                method: item ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                toast.success(item ? 'Data berhasil diupdate' : 'Data berhasil ditambahkan');
                onSuccess();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error saving data:', error);
            toast.error(error instanceof Error ? error.message : 'Gagal menyimpan data');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'kategori_id' ? parseInt(value) : value
        }));
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {!isAuthenticated ? (
                    <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                            <div className="text-center mb-4">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                                    <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Autentikasi Diperlukan</h3>
                                <p className="text-sm text-gray-500 mt-2">
                                    Silakan masukkan password untuk mengakses form edit.
                                    <br />
                                    Hubungi Admin System: <span className="font-medium">Bpk. Prasetyo Wibowo</span>
                                </p>
                            </div>
                            <div className="mt-5">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Masukkan password"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAuthentication();
                                        }
                                    }}
                                />
                                {loginAttempts > 0 && (
                                    <p className="mt-2 text-sm text-red-600">
                                        Password Salah |  Sisa percobaan: {3 - loginAttempts}
                                    </p>
                                )}
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={handleAuthentication}
                                >
                                    Verifikasi
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={onClose}
                                >
                                    Batal
                                </button>
                            </div>

                            {/* Style untuk animasi getar */}
                            <style jsx>{`
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
    
    .shake-animation {
        animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
    }
`}</style>
                        </div>
                    </div>
                ) : (
                    <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                                <div className="w-full">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                        {item ? 'Edit Sub Kategori' : 'Tambah Sub Kategori'}
                                    </h3>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Kategori *
                                            </label>
                                            <select
                                                name="kategori_id"
                                                value={formData.kategori_id}
                                                onChange={handleChange}
                                                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                                                required
                                            >
                                                <option value="">Pilih Kategori</option>
                                                {kategoris.map((kategori) => (
                                                    <option key={kategori.id} value={kategori.id}>
                                                        {kategori.nama}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Kode Item *
                                            </label>
                                            <input
                                                type="text"
                                                name="kode_item"
                                                value={formData.kode_item}
                                                onChange={handleChange}
                                                maxLength={20}
                                                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Nama *
                                            </label>
                                            <input
                                                type="text"
                                                name="nama"
                                                value={formData.nama}
                                                onChange={handleChange}
                                                maxLength={100}
                                                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Brand
                                            </label>
                                            <input
                                                type="text"
                                                name="brand"
                                                value={formData.brand || ''}
                                                onChange={handleChange}
                                                maxLength={100}
                                                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Satuan *
                                            </label>
                                            <select
                                                name="satuan"
                                                value={formData.satuan}
                                                onChange={handleChange}
                                                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                                                required
                                            >
                                                {satuanOptions.map(option => (
                                                    <option key={option} value={option}>
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Status *
                                            </label>
                                            <select
                                                name="status"
                                                value={formData.status}
                                                onChange={handleChange}
                                                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                                                required
                                            >
                                                {statusOptions.map(option => (
                                                    <option key={option} value={option}>
                                                        {option.toUpperCase()}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Keterangan
                                            </label>
                                            <textarea
                                                name="keterangan"
                                                value={formData.keterangan || ''}
                                                onChange={handleChange}
                                                rows={3}
                                                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button
                                type="submit"
                                onClick={handleSubmit}
                                disabled={loading}
                                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm
                                ${loading
                                    ? 'bg-blue-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                }`}
                            >
                                {loading ? 'Menyimpan...' : 'Simpan'}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
