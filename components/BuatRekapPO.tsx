'use client';

import { useState, useEffect } from 'react';
import type { Company } from '@/app/api/companies/route';
import Swal from 'sweetalert2';

interface BuatRekapPOProps {
    onSave: () => void;
    onCancel: () => void;
}

interface FormData {
    no_po: string;
    nama_perusahaan: string;
    judulPO: string;
    tanggal: string;
    nilai_penawaran: string;
    nilai_po: string;
    biaya_pelaksanaan: string;
    keterangan: string;
}

const BuatRekapPO: React.FC<BuatRekapPOProps> = ({ onSave, onCancel }) => {
    const [existingCompanies, setExistingCompanies] = useState<string[]>([]);
    const [isNewCompany, setIsNewCompany] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<FormData>({
        no_po: '',
        nama_perusahaan: '',
        judulPO: '',
        tanggal: '',
        nilai_penawaran: '',
        nilai_po: '',
        biaya_pelaksanaan: '',
        keterangan: '',
    });

    useEffect(() => {
        const fetchCompanies = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/companies');
                if (!response.ok) throw new Error('Failed to fetch companies');
                const data: Company[] = await response.json();
                // Extract nama_perusahaan from Company objects and filter out any empty values
                const companyNames = data
                    .map(company => company.nama_perusahaan)
                    .filter((name): name is string =>
                        typeof name === 'string' && name.length > 0
                    );
                setExistingCompanies(companyNames);
            } catch (error) {
                console.error('Error fetching companies:', error);
                setExistingCompanies([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCompanies();
    }, []);

    const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === 'new') {
            setIsNewCompany(true);
            setFormData(prev => ({ ...prev, nama_perusahaan: '' }));
        } else {
            setIsNewCompany(false);
            setFormData(prev => ({ ...prev, nama_perusahaan: value }));
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;

        if (name === 'judulPO' || name === 'nama_perusahaan') {
            setFormData(prev => ({
                ...prev,
                [name]: value.toUpperCase()
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.no_po || !formData.nama_perusahaan || !formData.judulPO || !formData.tanggal) {
            await Swal.fire({
                title: 'Peringatan!',
                text: 'Mohon isi semua field yang wajib diisi',
                icon: 'warning',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'OK'
            });
            return;
        }

        const numericValues = {
            nilai_penawaran: parseRupiahToNumber(formData.nilai_penawaran),
            nilai_po: parseRupiahToNumber(formData.nilai_po),
            biaya_pelaksanaan: parseRupiahToNumber(formData.biaya_pelaksanaan)
        };

        if (isNaN(numericValues.nilai_penawaran) ||
            isNaN(numericValues.nilai_po) ||
            isNaN(numericValues.biaya_pelaksanaan)) {
            await Swal.fire({
                title: 'Peringatan!',
                text: 'Mohon masukkan nilai yang valid untuk field numerik',
                icon: 'warning',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'OK'
            });
            return;
        }

        const profit = numericValues.nilai_po - numericValues.biaya_pelaksanaan;
        const status = (profit / numericValues.biaya_pelaksanaan) * 100;

        try {
            Swal.fire({
                title: 'Menyimpan Data',
                text: 'Mohon tunggu...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const response = await fetch('/api/rekap-po', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    nilai_penawaran: numericValues.nilai_penawaran,
                    nilai_po: numericValues.nilai_po,
                    biaya_pelaksanaan: numericValues.biaya_pelaksanaan,
                    profit: profit,
                    status: status
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create PO');
            }

            // Tutup loading state
            Swal.close();

            // Tampilkan pesan sukses
            await Swal.fire({
                title: 'Berhasil!',
                text: 'Rekap PO berhasil dibuat',
                icon: 'success',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'OK'
            });

            onSave();

        } catch (error) {
            console.error('Error:', error);

            // Tutup loading state
            Swal.close();

            // Tampilkan pesan error
            await Swal.fire({
                title: 'Error!',
                text: 'Gagal membuat rekap PO',
                icon: 'error',
                confirmButtonColor: '#d33',
                confirmButtonText: 'OK'
            });
        }
    };

    const formatRupiah = (value: string) => {
        // Hapus semua karakter non-digit
        const number = value.replace(/[^\d]/g, '');

        // Pastikan number tidak kosong
        if (!number) return '';

        // Format sebagai rupiah
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(Number(number));
    };

    const parseRupiahToNumber = (rupiahString: string): number => {
        // Hapus semua karakter kecuali digit
        const number = rupiahString.replace(/[^\d]/g, '');

        // Pastikan tidak kosong
        if (!number) return 0;

        return Number(number);
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
                        <div className="space-y-2">
                            {isLoading ? (
                                <div className="w-full p-2 border rounded bg-gray-50">
                                    Loading companies...
                                </div>
                            ) : (
                                <select
                                    value={isNewCompany ? 'new' : formData.nama_perusahaan}
                                    onChange={handleCompanyChange}
                                    className="w-full p-2 border rounded"
                                    required
                                >
                                    <option value="">Pilih Perusahaan</option>
                                    {existingCompanies.map((company, index) => (
                                        <option key={index} value={company}>
                                            {company}
                                        </option>
                                    ))}
                                    <option value="new">+ Tambah Perusahaan Baru</option>
                                </select>
                            )}

                            {isNewCompany && (
                                <input
                                    type="text"
                                    value={formData.nama_perusahaan}
                                    onChange={(e) => {
                                        const value = e.target.value.toUpperCase();
                                        setFormData(prev => ({
                                            ...prev,
                                            nama_perusahaan: value
                                        }));
                                    }}
                                    placeholder="Masukkan nama perusahaan baru"
                                    className="w-full p-2 border rounded mt-2"
                                    required
                                />
                            )}
                        </div>
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
                                setFormData(prev => ({
                                    ...prev,
                                    nilai_penawaran: formattedValue
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
                                setFormData(prev => ({
                                    ...prev,
                                    nilai_po: formattedValue
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
                                setFormData(prev => ({
                                    ...prev,
                                    biaya_pelaksanaan: formattedValue
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
