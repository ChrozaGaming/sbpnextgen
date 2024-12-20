'use client';

import {useState, useEffect} from 'react';
import BuatRekapPO from '@/components/BuatRekapPO';
import CetakRekap from '@/components/CetakRekap';
import type {Company} from '@/app/api/companies/route';
import InstruksiPanduan from '@/components/InstruksiPanduan';

interface RekapPO {
    id: number;
    no_po: string;
    judulPO: string;
    tanggal: string;
    status: number;
    progress: 'onprogress' | 'finish';  // Add this line
    nilai_penawaran: number;
    nilai_po: number;
    biaya_pelaksanaan: number;
    profit: number;
    keterangan: string;
    nama_perusahaan: string;
}

const formatRupiah = (value: number, isProfit: boolean = false): string => {
    const absoluteValue = Math.abs(value);
    const formattedValue = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    })
        .format(absoluteValue)
        .replace('IDR', 'Rp')
        .replace(/\s/g, '');

    if (isProfit && value < 0) {
        return `Rp -${formattedValue.substring(2)}`;
    }
    return formattedValue;
};

const getStatusColor = (status: number): string => {
    if (status <= -75) return 'bg-gradient-to-r from-red-900 via-red-800 to-red-700';
    if (status <= -50) return 'bg-gradient-to-r from-red-800 via-red-700 to-red-600';
    if (status <= -25) return 'bg-gradient-to-r from-red-700 via-red-600 to-red-500';
    if (status < 0) return 'bg-gradient-to-r from-red-600 via-red-500 to-red-400';
    if (status < 25) return 'bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-300';
    if (status < 50) return 'bg-gradient-to-r from-lime-500 via-lime-400 to-lime-300';
    if (status < 75) return 'bg-gradient-to-r from-green-500 via-green-400 to-green-300';
    return 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400';
};

const getMonthName = (date: string): string => {
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const monthIndex = new Date(date).getMonth();
    return months[monthIndex];
};


export default function RekapPOPage() {
    const [rekapPOList, setRekapPOList] = useState<RekapPO[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchCategory, setSearchCategory] = useState('no_po');
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [selectedMonth, setSelectedMonth] = useState<string>('all');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCetakModalOpen, setIsCetakModalOpen] = useState(false);
    const [showPanduan, setShowPanduan] = useState(false);  // Tambahkan state ini
    const [editingPO, setEditingPO] = useState<RekapPO | null>(null);
    const [newBiayaPelaksanaan, setNewBiayaPelaksanaan] = useState<number>(0);
    const [updatingProgressId, setUpdatingProgressId] = useState<number | null>(null);

    useEffect(() => {
        fetchRekapPO();
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const response = await fetch('/api/companies');
            if (!response.ok) throw new Error('Failed to fetch companies');
            const data: Company[] = await response.json();
            setCompanies(data);
        } catch (error) {
            console.error('Error fetching companies:', error);
            setCompanies([]);
        }
    };

    const fetchRekapPO = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/rekap-po');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Fetched data:', data); // Tambahkan ini untuk debugging

            if (!Array.isArray(data)) {
                throw new Error('Data is not in expected format');
            }
            setRekapPOList(data);
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Gagal mengambil data. Silakan coba lagi.');
            setRekapPOList([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (po: RekapPO) => {
        setEditingPO(po);
        setNewBiayaPelaksanaan(po.biaya_pelaksanaan);
        setIsEditModalOpen(true);
    };

    const handleUpdateProgress = async (id: number, newProgress: 'onprogress' | 'finish') => {
        if (updatingProgressId === id) return;

        setUpdatingProgressId(id);
        try {
            console.log('Updating progress for ID:', id, 'New progress:', newProgress);

            const response = await fetch(`/api/rekap-po/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ progress: newProgress }),
            });

            const result = await response.json();
            console.log('Update response:', result);

            if (!response.ok) {
                throw new Error(result.error || 'Failed to update progress');
            }

            // Fetch fresh data instead of updating state directly
            await fetchRekapPO();

        } catch (error) {
            console.error('Error updating progress:', error);
            alert('Gagal mengupdate progress. Silakan coba lagi.');

            // Revert select value to original state
            setRekapPOList(prevList =>
                prevList.map(po =>
                    po.id === id
                        ? { ...po, progress: po.progress }
                        : po
                )
            );
        } finally {
            setUpdatingProgressId(null);
        }
    };

    const handleUpdateBiayaPelaksanaan = async () => {
        if (!editingPO) return;

        if (newBiayaPelaksanaan <= 0) {
            alert('Biaya pelaksanaan harus lebih dari 0');
            return;
        }

        try {
            const profit = editingPO.nilai_po - newBiayaPelaksanaan;
            const status = ((profit / newBiayaPelaksanaan) * 100);

            const updateData = {
                id: editingPO.id,
                biaya_pelaksanaan: newBiayaPelaksanaan,
                profit: profit,
                status: status,
                progress: editingPO.progress  // Add this line
            };

            const response = await fetch(`/api/rekap-po/${editingPO.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                throw new Error('Failed to update data');
            }

            await fetchRekapPO();
            setIsEditModalOpen(false);
            setEditingPO(null);
            alert('Data berhasil diupdate!');
        } catch (error) {
            console.error('Error:', error);
            alert('Gagal mengupdate data');
        }
    };

    const getUniqueYears = () => {
        const years = rekapPOList.map(po => new Date(po.tanggal).getFullYear());
        return Array.from(new Set(years)).sort((a, b) => b - a);
    };

    const filteredRekapPOList = rekapPOList.filter(po => {
        const poDate = new Date(po.tanggal);
        const poYear = poDate.getFullYear().toString();
        const poMonth = (poDate.getMonth() + 1).toString();

        if (selectedYear && poYear !== selectedYear) return false;
        if (selectedYear && selectedMonth !== 'all' && poMonth !== selectedMonth) return false;
        if (!searchTerm) return true;

        const searchValue = searchTerm.toLowerCase();
        switch (searchCategory) {
            case 'no_po':
                return po.no_po.toLowerCase().includes(searchValue);
            case 'perusahaan':
                return po.nama_perusahaan === searchTerm;
            case 'judulPO':
                return po.judulPO.toLowerCase().includes(searchValue);
            case 'tanggal':
                return po.tanggal.includes(searchValue);
            case 'status':
                return po.status.toString().includes(searchValue);
            case 'progress':  // Add this case
                return po.progress.toLowerCase().includes(searchValue);
            default:
                return true;
        }
    });

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Rekap Purchase Order</h1>
                <div className="space-x-2">
                    <button
                        onClick={() => setShowPanduan(true)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                    >
                        Panduan Penggunaan
                    </button>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Buat Rekap PO Baru
                    </button>
                    <button
                        onClick={() => setIsCetakModalOpen(true)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                    >
                        Cetak Rekap
                    </button>
                </div>
            </div>

            {/* Modal Panduan */}
            {showPanduan && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
                    <div className="relative bg-white rounded-lg shadow-lg max-w-4xl mx-4 my-8">
                        <div className="absolute top-4 right-4">
                            <button
                                onClick={() => setShowPanduan(false)}
                                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                <svg className="h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                    <path d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[80vh]">
                            <InstruksiPanduan />
                        </div>
                        <div className="bg-gray-50 px-6 py-3 rounded-b-lg">
                            <button
                                onClick={() => setShowPanduan(false)}
                                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                            >
                                Tutup Panduan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-4 flex space-x-4 items-end">
                <div className="flex-1">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                        Cari berdasarkan
                    </label>
                    <div className="flex space-x-2">
                        <select
                            className="w-48 p-2 border rounded-md"
                            value={searchCategory}
                            onChange={(e) => {
                                setSearchCategory(e.target.value);
                                setSearchTerm('');
                            }}
                        >
                            <option value="no_po">Nomor PO</option>
                            <option value="perusahaan">Perusahaan</option>
                            <option value="judulPO">Judul PO</option>
                            <option value="tanggal">Tanggal</option>
                            <option value="status">Status</option>
                        </select>

                        {searchCategory === 'perusahaan' ? (
                            <select
                                className="flex-1 p-2 border rounded-md"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            >
                                <option value="">Pilih Perusahaan</option>
                                {companies.map((company, index) => (
                                    <option key={index} value={company.nama_perusahaan}>
                                        {company.nama_perusahaan}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type={searchCategory === 'tanggal' ? 'date' : 'text'}
                                className="flex-1 p-2 border rounded-md"
                                placeholder={`Cari berdasarkan ${searchCategory.replace('_', ' ')}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        )}
                    </div>
                </div>
            </div>


            <div className="mb-4 space-y-4">
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                        Filter Berdasarkan Tahun
                    </label>
                    <select
                        className="w-48 p-2 border rounded-md"
                        value={selectedYear}
                        onChange={(e) => {
                            setSelectedYear(e.target.value);
                            setSelectedMonth('all');
                        }}
                    >
                        <option value="">Pilih Tahun</option>
                        {getUniqueYears().map(year => (
                            <option key={year} value={year.toString()}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                        Filter Berdasarkan Bulan
                    </label>
                    <select
                        className="w-48 p-2 border rounded-md"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        disabled={!selectedYear}
                    >
                        <option value="all">Semua Bulan</option>
                        {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                            <option key={month} value={month.toString()}>
                                {getMonthName(`2024-${month}-01`)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>


            {isLoading ? (
                <div className="text-center py-4">
                    <p>Loading data...</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead>
                        <tr>
                            <th className="px-4 py-2">No PO</th>
                            <th className="px-4 py-2">Perusahaan</th>
                            <th className="px-4 py-2">Judul PO</th>
                            <th className="px-4 py-2">Tanggal</th>
                            <th className="px-4 py-2 min-w-[160px]">Progress</th>
                            <th className="px-4 py-2">Nilai Penawaran</th>
                            <th className="px-4 py-2">Nilai PO</th>
                            <th className="px-4 py-2">Biaya Pelaksanaan</th>
                            <th className="px-4 py-2">Profit</th>
                            <th className="px-4 py-2 min-w-[200px]">Status Profit</th>
                            <th className="px-4 py-2">Aksi</th>
                        </tr>
                        </thead>
                        <tbody>{filteredRekapPOList.map((po) => (
                            <tr key={po.id}>
                                <td className="border px-4 py-2">{po.no_po}</td>
                                <td className="border px-4 py-2">{po.nama_perusahaan}</td>
                                <td className="border px-4 py-2">{po.judulPO}</td>
                                <td className="border px-4 py-2">
                                    {new Date(po.tanggal).toLocaleDateString('id-ID')}
                                </td>
                                <td className="border px-4 py-2 min-w-[120px]">
                                    <select
                                        value={po.progress}
                                        onChange={(e) => handleUpdateProgress(po.id, e.target.value as 'onprogress' | 'finish')}
                                        disabled={updatingProgressId === po.id}
                                        className={`px-2 py-1 rounded text-sm w-full border-0 transition-colors duration-200 ${
                                            po.progress === 'finish'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                        } ${updatingProgressId === po.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <option value="onprogress">On Progress</option>
                                        <option value="finish">Finish</option>
                                    </select>
                                </td>
                                <td className="border px-4 py-2">{formatRupiah(po.nilai_penawaran)}</td>
                                <td className="border px-4 py-2">{formatRupiah(po.nilai_po)}</td>
                                <td className="border px-4 py-2">{formatRupiah(po.biaya_pelaksanaan)}</td>
                                <td className={`border px-4 py-2 ${po.profit < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {formatRupiah(po.profit, true)}
                                </td>
                                <td className="border px-4 py-2 min-w-[200px]">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                                            <div
                                                className={`${getStatusColor(Number(po.status))} h-4 rounded-full transition-all duration-500 shadow-inner`}
                                                style={{width: `${Math.abs(po.status)}%`}}/>
                                        </div>
                                        <span
                                            className={`text-sm font-medium min-w-[60px] ${po.status < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {Number(po.status).toFixed(2)}%
                    </span>
                                    </div>
                                </td>
                                <td className="border px-4 py-2">
                                    <button onClick={() => handleEdit(po)}
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
                                        Edit Biaya
                                    </button>
                                </td>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>
            )}

            {isEditModalOpen && editingPO && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h3 className="text-lg font-semibold mb-4">
                            Edit Biaya Pelaksanaan
                        </h3>
                        <div className="mb-4">
                            <p className="text-sm mb-2">No PO: {editingPO.no_po}</p>
                            <p className="text-sm mb-2">Perusahaan: {editingPO.nama_perusahaan}</p>
                            <p className="text-sm mb-4">Nilai PO: {formatRupiah(editingPO.nilai_po)}</p>

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Biaya Pelaksanaan
                            </label>
                            <input
                                type="text"
                                value={newBiayaPelaksanaan.toString()}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                    if (value === '') {
                                        setNewBiayaPelaksanaan(0);
                                    } else {
                                        setNewBiayaPelaksanaan(Number(value));
                                    }
                                }}
                                className="w-full p-2 border rounded"
                                pattern="[0-9]*"
                                inputMode="numeric"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                {formatRupiah(newBiayaPelaksanaan)}
                            </p>

                            <div className="mt-4 p-3 bg-gray-50 rounded">
                                <p className="text-sm font-medium">Preview Perubahan:</p>
                                <p className={`text-sm ${(editingPO.nilai_po - newBiayaPelaksanaan) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    Profit: {formatRupiah(editingPO.nilai_po - newBiayaPelaksanaan, true)}
                                </p>
                                <p className={`text-sm ${((editingPO.nilai_po - newBiayaPelaksanaan) / newBiayaPelaksanaan * 100) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    Status
                                    Profit: {((editingPO.nilai_po - newBiayaPelaksanaan) / newBiayaPelaksanaan * 100).toFixed(2)}%
                                </p>
                            </div>
                        </div>


                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleUpdateBiayaPelaksanaan}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isCreateModalOpen && (
                <BuatRekapPO
                    onSave={() => {
                        setIsCreateModalOpen(false);
                        fetchRekapPO();
                    }}
                    onCancel={() => setIsCreateModalOpen(false)}
                />
            )}

            {isCetakModalOpen && (
                <CetakRekap
                    data={filteredRekapPOList}
                    onClose={() => setIsCetakModalOpen(false)}
                    selectedYear={selectedYear}
                    selectedMonth={selectedMonth}
                />
            )}
        </div>
    );
}