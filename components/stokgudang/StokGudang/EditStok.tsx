// components/stokgudang/StokGudang/EditStok.tsx
import { useState, useEffect } from 'react';

interface EditStokProps {
    id: number;
    onClose: () => void;
    onSuccess: () => void;
}

interface SubKategori {
    id: number;
    nama: string;
    kode_item: string;
}

interface ExistingData {
    kategoriList: string[];
    subKategoriList: SubKategori[];
}

interface StokData {
    id: number;
    kode: string;
    nama: string;
    kategori: string;
    sub_kategori_id: number;
}

const EditStok = ({ id, onClose, onSuccess }: EditStokProps) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<StokData>({
        id: 0,
        kode: '',
        nama: '',
        kategori: '',
        sub_kategori_id: 0
    });
    const [existingData, setExistingData] = useState<ExistingData>({
        kategoriList: [],
        subKategoriList: []
    });
    const [filteredSubKategori, setFilteredSubKategori] = useState<SubKategori[]>([]);

    // Fetch existing data and current stok data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch current stok data
                const stokRes = await fetch(`/api/stok/${id}`);
                const stokData = await stokRes.json();

                if (stokData.success && stokData.data) {
                    setFormData({
                        id: stokData.data.id,
                        kode: stokData.data.kode,
                        nama: stokData.data.nama,
                        kategori: stokData.data.kategori,
                        sub_kategori_id: stokData.data.sub_kategori_id
                    });
                }

                // Fetch distinct values for dropdowns
                const distinctRes = await fetch('/api/stok/distinct-values');
                const distinctData = await distinctRes.json();

                if (distinctData.success) {
                    setExistingData({
                        kategoriList: distinctData.kategoriList || [],
                        subKategoriList: distinctData.subKategoriList || []
                    });

                    // Set initial filtered sub kategori based on current kategori
                    if (stokData.data?.kategori) {
                        const filtered = distinctData.subKategoriList.filter(
                            (sub: SubKategori) => sub.kategori === stokData.data.kategori
                        );
                        setFilteredSubKategori(filtered);
                    }
                }

            } catch (error) {
                console.error('Error fetching data:', error);
                alert('Gagal mengambil data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    // Update filtered sub kategori when kategori changes
    useEffect(() => {
        if (formData.kategori) {
            const filtered = existingData.subKategoriList.filter(
                (sub) => sub.kategori === formData.kategori
            );
            setFilteredSubKategori(filtered);

            // Reset sub_kategori_id if current selection is not in filtered list
            if (!filtered.find(sub => sub.id === formData.sub_kategori_id)) {
                setFormData(prev => ({ ...prev, sub_kategori_id: 0 }));
            }
        }
    }, [formData.kategori, existingData.subKategoriList]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);

            // Validation
            if (!formData.kode || !formData.nama || !formData.kategori || !formData.sub_kategori_id) {
                alert('Semua field harus diisi');
                return;
            }

            const response = await fetch(`/api/stok/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Terjadi kesalahan');
            }

            if (data.success) {
                onSuccess();
                onClose();
            }
        } catch (error) {
            console.error('Error updating stok:', error);
            alert(error instanceof Error ? error.message : 'Gagal mengupdate data');
        } finally {
            setLoading(false);
        }
    };

    // Close modal when clicking outside
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center" onClick={handleBackdropClick}>
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Edit Stok</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="kode" className="block text-sm font-medium text-gray-700">
                                Kode
                            </label>
                            <input
                                type="text"
                                id="kode"
                                value={formData.kode}
                                onChange={(e) => setFormData(prev => ({ ...prev, kode: e.target.value }))}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="nama" className="block text-sm font-medium text-gray-700">
                                Nama
                            </label>
                            <input
                                type="text"
                                id="nama"
                                value={formData.nama}
                                onChange={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="kategori" className="block text-sm font-medium text-gray-700">
                                Kategori
                            </label>
                            <select
                                id="kategori"
                                value={formData.kategori}
                                onChange={(e) => setFormData(prev => ({ ...prev, kategori: e.target.value }))}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="">Pilih kategori</option>
                                {existingData.kategoriList.map((kategori) => (
                                    <option key={kategori} value={kategori}>
                                        {kategori}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="sub_kategori" className="block text-sm font-medium text-gray-700">
                                Sub Kategori
                            </label>
                            <select
                                id="sub_kategori"
                                value={formData.sub_kategori_id || ''}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    sub_kategori_id: parseInt(e.target.value)
                                }))}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="">Pilih sub kategori</option>
                                {filteredSubKategori.map((sub) => (
                                    <option key={sub.id} value={sub.id}>
                                        {`${sub.kode_item} - ${sub.nama}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-4 py-2 rounded-md text-sm font-medium text-white 
                                ${loading
                                ? 'bg-blue-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                            }`}
                        >
                            {loading ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditStok;