'use client';

import { useState } from 'react';

interface BuatRekapPOProps {
    onSave: () => void;
    onCancel: () => void;
}

const BuatRekapPO: React.FC<BuatRekapPOProps> = ({ onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        no_po: '',
        nama_perusahaan: '',
        judulPO: '',
        tanggal: '',
        nilai_penawaran: '',
        nilai_po: '',
        biaya_pelaksanaan: '',
        keterangan: '',
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;

        if (name === 'nama_perusahaan' || name === 'judulPO') {
            setFormData((prev) => ({
                ...prev,
                [name]: value.toUpperCase(),
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !formData.no_po ||
            !formData.nama_perusahaan ||
            !formData.judulPO ||
            !formData.tanggal
        ) {
            alert('Mohon isi semua field yang wajib diisi');
            return;
        }

        const numericValues = {
            nilai_penawaran: parseFloat(formData.nilai_penawaran.replace(/[^\d.-]/g, '')),
            nilai_po: parseFloat(formData.nilai_po.replace(/[^\d.-]/g, '')),
            biaya_pelaksanaan: parseFloat(
                formData.biaya_pelaksanaan.replace(/[^\d.-]/g, ''),
            ),
        };

        if (
            isNaN(numericValues.nilai_penawaran) ||
            isNaN(numericValues.nilai_po) ||
            isNaN(numericValues.biaya_pelaksanaan)
        ) {
            alert('Mohon masukkan nilai yang valid untuk field numerik');
            return;
        }

        const profit = numericValues.nilai_po - numericValues.biaya_pelaksanaan;
        const status = (profit / numericValues.biaya_pelaksanaan) * 100;

        try {
            const response = await fetch('/api/rekap-po', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    nilai_penawaran: numericValues.nilai_penawaran,
                    nilai_po: numericValues.nilai_po,
                    biaya_pelaksanaan: numericValues.biaya_pelaksanaan,
                    profit: profit,
                    status: status,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create PO');
            }

            alert('Rekap PO berhasil dibuat!');
            onSave();
        } catch (error) {
            console.error('Error:', error);
            alert('Gagal membuat rekap PO');
        }
    };

    const formatRupiah = (value: string) => {
        const number = value.replace(/[^\d]/g, '');
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(Number(number));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[600px] max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Buat Rekap PO Baru</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nomor PO *
                        </label>
                        <input
                            type="text"
                            name="no_po"
                            value={formData.no_po}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nama Perusahaan *
                        </label>
                        <input
                            type="text"
                            name="nama_perusahaan"
                            value={formData.nama_perusahaan}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                            style={{ textTransform: 'uppercase' }}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Judul PO *
                        </label>
                        <input
                            type="text"
                            name="judulPO"
                            value={formData.judulPO}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                            style={{ textTransform: 'uppercase' }}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tanggal *
                        </label>
                        <input
                            type="date"
                            name="tanggal"
                            value={formData.tanggal}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nilai Penawaran *
                        </label>
                        <input
                            type="text"
                            name="nilai_penawaran"
                            value={formData.nilai_penawaran}
                            onChange={(e) => {
                                const formattedValue = formatRupiah(e.target.value);
                                setFormData((prev) => ({
                                    ...prev,
                                    nilai_penawaran: formattedValue,
                                }));
                            }}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nilai PO *
                        </label>
                        <input
                            type="text"
                            name="nilai_po"
                            value={formData.nilai_po}
                            onChange={(e) => {
                                const formattedValue = formatRupiah(e.target.value);
                                setFormData((prev) => ({
                                    ...prev,
                                    nilai_po: formattedValue,
                                }));
                            }}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Biaya Pelaksanaan *
                        </label>
                        <input
                            type="text"
                            name="biaya_pelaksanaan"
                            value={formData.biaya_pelaksanaan}
                            onChange={(e) => {
                                const formattedValue = formatRupiah(e.target.value);
                                setFormData((prev) => ({
                                    ...prev,
                                    biaya_pelaksanaan: formattedValue,
                                }));
                            }}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Keterangan
                        </label>
                        <textarea
                            name="keterangan"
                            value={formData.keterangan}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Simpan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BuatRekapPO;
