// components/stok/EditStokModal.tsx

import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';

interface EditStokModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    initialData: any;
}

export default function EditStokModal({ isOpen, onClose, onSubmit, initialData }: EditStokModalProps) {
    const [formData, setFormData] = useState({
        kode_barang: '',
        nama_barang: '',
        kategori: '',
        tipe_material: '',
        merek: '',
        warna: '',
        satuan: '',
        kemasan: '',
        jumlah: 0,
        stok_minimum: 0,
        stok_maksimum: 0,
        harga_beli: 0,
        harga_jual: 0,
        mixing_ratio: '',
        coverage_area: 0,
        ketebalan: '',
        pot_life: '',
        curing_time: '',
        supplier: '',
        lokasi_gudang: '',
        nomor_rak: '',
        nomor_batch: '',
        tanggal_expired: '',
        tanggal_produksi: '',
        status: 'aktif',
        keterangan: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
        onClose();
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="mx-auto max-w-3xl w-full bg-white rounded-xl shadow-lg p-6">
                    <Dialog.Title className="text-xl font-bold mb-4">Edit Stok Barang</Dialog.Title>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Informasi Dasar */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Kode Barang</label>
                                    <input
                                        type="text"
                                        name="kode_barang"
                                        value={formData.kode_barang}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        readOnly
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nama Barang</label>
                                    <input
                                        type="text"
                                        name="nama_barang"
                                        value={formData.nama_barang}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Kategori</label>
                                    <select
                                        name="kategori"
                                        value={formData.kategori}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">Pilih Kategori</option>
                                        <option value="Epoxy">Epoxy</option>
                                        <option value="Hardener">Hardener</option>
                                        <option value="Tools">Tools</option>
                                        <option value="Material Pendukung">Material Pendukung</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tipe Material</label>
                                    <select
                                        name="tipe_material"
                                        value={formData.tipe_material}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">Pilih Tipe Material</option>
                                        <option value="Floor Coating">Floor Coating</option>
                                        <option value="Self Leveling">Self Leveling</option>
                                        <option value="Mortar">Mortar</option>
                                        <option value="Primer">Primer</option>
                                        <option value="Finishing">Finishing</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Merek</label>
                                    <input
                                        type="text"
                                        name="merek"
                                        value={formData.merek}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Informasi Teknis */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Jumlah Stok</label>
                                    <input
                                        type="number"
                                        name="jumlah"
                                        value={formData.jumlah}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Satuan</label>
                                    <input
                                        type="text"
                                        name="satuan"
                                        value={formData.satuan}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Kemasan</label>
                                    <input
                                        type="text"
                                        name="kemasan"
                                        value={formData.kemasan}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="aktif">Aktif</option>
                                        <option value="nonaktif">Non Aktif</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Keterangan</label>
                                    <textarea
                                        name="keterangan"
                                        value={formData.keterangan}
                                        onChange={handleChange}
                                        rows={3}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Tombol Aksi */}
                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                            >
                                Simpan Perubahan
                            </button>
                        </div>
                    </form>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
}
