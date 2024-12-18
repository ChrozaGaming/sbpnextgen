'use client';

import React, { useState, useEffect } from 'react';
import { RekapPO } from '@/utils/pdfGenerator';
import { formatRupiah, parseRupiah } from '@/utils/formatRupiah';

interface EditModalProps {
    po: RekapPO;
    onClose: () => void;
    onSave: (updatedPO: RekapPO) => void;
}

const EditModal: React.FC<EditModalProps> = ({ po, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        nilai_po: '',
        biaya_material: '',
        biaya_jasa: '',
        biaya_overhead: '',
        profit: '',
        status: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setFormData({
            nilai_po: formatRupiah(po.nilai_po),
            biaya_material: formatRupiah(po.biaya_material),
            biaya_jasa: formatRupiah(po.biaya_jasa),
            biaya_overhead: formatRupiah(po.biaya_overhead),
            profit: formatRupiah(po.profit),
            status: po.status.toString()
        });
    }, [po]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (['nilai_po', 'biaya_material', 'biaya_jasa', 'biaya_overhead'].includes(name)) {
            // Remove non-numeric characters for processing
            const numericValue = value.replace(/\D/g, '');

            // Format as Rupiah
            const formattedValue = formatRupiah(Number(numericValue));

            setFormData(prev => ({
                ...prev,
                [name]: formattedValue
            }));

            // Calculate profit and status after state update
            setTimeout(() => {
                calculateProfitAndStatus({
                    ...formData,
                    [name]: formattedValue
                });
            }, 0);
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const calculateProfitAndStatus = (data: typeof formData) => {
        const nilaiPO = parseRupiah(data.nilai_po);
        const biayaMaterial = parseRupiah(data.biaya_material);
        const biayaJasa = parseRupiah(data.biaya_jasa);
        const biayaOverhead = parseRupiah(data.biaya_overhead);

        const totalBiaya = biayaMaterial + biayaJasa + biayaOverhead;
        const profit = nilaiPO - totalBiaya;
        const status = nilaiPO > 0 ? (profit / nilaiPO) * 100 : 0;

        setFormData(prev => ({
            ...prev,
            profit: formatRupiah(profit),
            status: status.toFixed(2)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            // Validate inputs
            const nilaiPO = parseRupiah(formData.nilai_po);
            const biayaMaterial = parseRupiah(formData.biaya_material);
            const biayaJasa = parseRupiah(formData.biaya_jasa);
            const biayaOverhead = parseRupiah(formData.biaya_overhead);
            const profit = parseRupiah(formData.profit);
            const status = parseFloat(formData.status);

            if (nilaiPO <= 0) {
                throw new Error('Nilai PO harus lebih dari 0');
            }

            const updatedPO: RekapPO = {
                ...po,
                nilai_po: nilaiPO,
                biaya_material: biayaMaterial,
                biaya_jasa: biayaJasa,
                biaya_overhead: biayaOverhead,
                profit: profit,
                status: status
            };

            await onSave(updatedPO);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Edit Biaya PO</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="mb-4">
                    <p className="font-medium">{po.no_po}</p>
                    <p className="text-gray-600">{po.judulPO}</p>
                    <p className="text-sm text-gray-500">{po.nama_perusahaan}</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nilai PO
                        </label>
                        <input
                            type="text"
                            name="nilai_po"
                            value={formData.nilai_po}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Biaya Material
                        </label>
                        <input
                            type="text"
                            name="biaya_material"
                            value={formData.biaya_material}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Biaya Jasa
                        </label>
                        <input
                            type="text"
                            name="biaya_jasa"
                            value={formData.biaya_jasa}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Biaya Overhead
                        </label>
                        <input
                            type="text"
                            name="biaya_overhead"
                            value={formData.biaya_overhead}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Profit
                        </label>
                        <input
                            type="text"
                            value={formData.profit}
                            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50"
                            readOnly
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status (%)
                        </label>
                        <input
                            type="text"
                            value={formData.status}
                            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50"
                            readOnly
                        />
                    </div>

                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                            disabled={isLoading}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 
                                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditModal;
