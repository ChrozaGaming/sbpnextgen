'use client';

import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import dynamic from 'next/dynamic';
import TambahStok from './TambahStok';

const CSVLink = dynamic(() => import('react-csv').then(mod => mod.CSVLink), {
    ssr: false
});

interface Stok {
    id: number;
    kode: string;
    nama: string;
    kategori: 'material' | 'alat' | 'consumable';
    status: 'aman' | 'rusak' | 'cacat' | 'sisa';
    sub_kategori_id: number;
    stok_masuk: number;
    stok_keluar: number;
    stok_sisa: number;
    satuan: string;
    lokasi: string;
    tanggal_entry: string;
    tanggal_masuk: string;
    tanggal_keluar: string | null;
    keterangan: string | null;
    sub_kategori_nama?: string;
    sub_kategori_kode?: string;
}

interface SortConfig {
    key: keyof Stok | '';
    direction: 'asc' | 'desc';
}

const getStatusBadgeColor = (status: string): string => {
    switch (status) {
        case 'aman': return 'bg-green-100 text-green-800';
        case 'rusak': return 'bg-red-100 text-red-800';
        case 'cacat': return 'bg-orange-100 text-orange-800';
        case 'sisa': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const StokGudang: React.FC = () => {
    const [stoks, setStoks] = useState<Stok[]>([]);
    const [loading, setLoading] = useState(false);
    const [showTambahStok, setShowTambahStok] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [search, setSearch] = useState('');
    const [selectedKategori, setSelectedKategori] = useState<string>('');
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: 'asc' });
    const itemsPerPage = 10;

    const getSortIcon = (key: keyof Stok) => {
        if (sortConfig.key !== key) {
            return (
                <span className="ml-1 text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
                    </svg>
                </span>
            );
        }
        return sortConfig.direction === 'asc' ? (
            <span className="ml-1 text-blue-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"/>
                </svg>
            </span>
        ) : (
            <span className="ml-1 text-blue-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                </svg>
            </span>
        );
    };

    const handleSort = (key: keyof Stok) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const sortedStoks = React.useMemo(() => {
        if (!sortConfig.key) return stoks;
        return [...stoks].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];
            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortConfig.direction === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [stoks, sortConfig]);

    const fetchStoks = async () => {
        setLoading(true);
        try {
            let url = `/api/stok?page=${currentPage}&limit=${itemsPerPage}`;
            if (search) url += `&search=${encodeURIComponent(search)}`;
            if (selectedKategori) url += `&kategori=${selectedKategori}`;
            if (selectedStatus) url += `&status=${selectedStatus}`;
            if (startDate && endDate) url += `&start_date=${startDate}&end_date=${endDate}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            if (data.success) {
                const mappedData = data.data.map((item: Stok) => ({
                    ...item,
                    status: item.status || 'aman'
                }));
                setStoks(mappedData);
                setTotalItems(data.pagination.total);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Gagal memuat data stok');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const response = await fetch(`/api/stok/${id}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (data.success) {
                alert('Data berhasil dihapus');
                fetchStoks();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error deleting data:', error);
            alert('Gagal menghapus data');
        }
        setShowDeleteModal(false);
        setDeleteId(null);
    };

    const resetFilters = () => {
        setSearch('');
        setSelectedKategori('');
        setSelectedStatus('');
        setStartDate('');
        setEndDate('');
        setCurrentPage(1);
        setSortConfig({ key: '', direction: 'asc' });
    };

    const getStatusColor = (stok_sisa: number): string => {
        if (stok_sisa <= 0) return 'bg-red-100 text-red-800';
        if (stok_sisa <= 10) return 'bg-yellow-100 text-yellow-800';
        return 'bg-green-100 text-green-800';
    };

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    const csvData = sortedStoks.map(item => ({
        Kode: item.kode,
        Nama: item.nama,
        Kategori: item.kategori?.toUpperCase() || '-',
        Status: item.status?.toUpperCase() || '-',
        'Sub Kategori': item.sub_kategori_nama || '-',
        'Stok Masuk': item.stok_masuk || 0,
        'Stok Keluar': item.stok_keluar || 0,
        'Stok Sisa': item.stok_sisa || 0,
        Satuan: item.satuan || '-',
        Lokasi: item.lokasi || '-',
        'Tanggal Entry': item.tanggal_entry ? dayjs(item.tanggal_entry).format('DD/MM/YYYY') : '-',
        'Tanggal Masuk': item.tanggal_masuk ? dayjs(item.tanggal_masuk).format('DD/MM/YYYY') : '-',
        Keterangan: item.keterangan || '-'
    }));

    useEffect(() => {
        fetchStoks();
    }, [currentPage, search, selectedKategori, selectedStatus, startDate, endDate]);

    useEffect(() => {
        setSortConfig({ key: '', direction: 'asc' });
    }, [search, selectedKategori, startDate, endDate]);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Data Stok Gudang</h1>
                <div className="space-x-2">
                    <CSVLink
                        data={csvData}
                        filename={`stok-gudang-${dayjs().format('YYYYMMDD')}.csv`}
                        className="inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Export CSV
                    </CSVLink>
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => setShowTambahStok(true)}
                    >
                        Tambah Stok
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Cari..."
                        className="px-4 py-2 border rounded"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <select
                        className="px-4 py-2 border rounded"
                        value={selectedKategori}
                        onChange={e => setSelectedKategori(e.target.value)}
                    >
                        <option value="">Pilih Kategori</option>
                        <option value="material">Material</option>
                        <option value="alat">Alat</option>
                        <option value="consumable">Consumable</option>
                    </select>
                    <div className="flex space-x-2">
                        <input
                            type="date"
                            className="px-4 py-2 border rounded w-1/2"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                        />
                        <input
                            type="date"
                            className="px-4 py-2 border rounded w-1/2"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                        />
                    </div>
                    <button
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        onClick={resetFilters}
                    >
                        Reset Filter
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('kode')}>
                                <div className="flex items-center">
                                    Kode {getSortIcon('kode')}
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('nama')}>
                                <div className="flex items-center">
                                    Nama {getSortIcon('nama')}
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('kategori')}>
                                <div className="flex items-center">
                                    Kategori {getSortIcon('kategori')}
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('sub_kategori_nama')}>
                                <div className="flex items-center">
                                    Sub Kategori {getSortIcon('sub_kategori_nama')}
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('status')}>
                                <div className="flex items-center">
                                    Status {getSortIcon('status')}
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('stok_masuk')}>
                                <div className="flex items-center">
                                    Stok Masuk {getSortIcon('stok_masuk')}
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('stok_keluar')}>
                                <div className="flex items-center">
                                    Stok Keluar {getSortIcon('stok_keluar')}
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('stok_sisa')}>
                                <div className="flex items-center">Stok Sisa {getSortIcon('stok_sisa')}
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('satuan')}>
                                <div className="flex items-center">
                                    Satuan {getSortIcon('satuan')}
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('lokasi')}>
                                <div className="flex items-center">
                                    Lokasi {getSortIcon('lokasi')}
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('keterangan')}>
                                <div className="flex items-center">
                                    Keterangan {getSortIcon('keterangan')}
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('tanggal_entry')}>
                                <div className="flex items-center">
                                    Tanggal Entry {getSortIcon('tanggal_entry')}
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('tanggal_masuk')}>
                                <div className="flex items-center">
                                    Tanggal Masuk {getSortIcon('tanggal_masuk')}
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Aksi
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={14} className="px-6 py-4 text-center">
                                    Loading...
                                </td>
                            </tr>
                        ) : sortedStoks.map((stok) => (
                            <tr key={stok.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{stok.kode}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{stok.nama}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            stok.kategori === 'material' ? 'bg-blue-100 text-blue-800' :
                                                stok.kategori === 'alat' ? 'bg-green-100 text-green-800' :
                                                    'bg-orange-100 text-orange-800'
                                        }`}>
                                            {stok.kategori.toUpperCase()}
                                        </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">{stok.sub_kategori_nama}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(stok.status || 'aman')}`}>
                                            {stok.status?.toUpperCase() || '-'}
                                        </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">{stok.stok_masuk}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">{stok.stok_keluar}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded ${getStatusColor(stok.stok_sisa)}`}>
                                            {stok.stok_sisa}
                                        </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">{stok.satuan}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{stok.lokasi}</td>
                                <td className="px-6 py-4 whitespace-normal break-words max-w-xs">
                                    {stok.keterangan || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {dayjs(stok.tanggal_entry).format('DD/MM/YYYY')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {stok.tanggal_masuk ? dayjs(stok.tanggal_masuk).format('DD/MM/YYYY') : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex space-x-2">
                                        <button
                                            className="text-blue-600 hover:text-blue-900"
                                            onClick={() => {}}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="text-red-600 hover:text-red-900"
                                            onClick={() => {
                                                setDeleteId(stok.id);
                                                setShowDeleteModal(true);
                                            }}
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-between items-center mt-4">
                    <div>
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
                    </div>
                    <div className="flex space-x-2">
                        {pageNumbers.map(number => (
                            <button
                                key={number}
                                className={`px-3 py-1 rounded ${currentPage === number ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                                onClick={() => setCurrentPage(number)}
                            >
                                {number}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg">
                        <h3 className="text-lg font-bold mb-4">Konfirmasi Hapus</h3>
                        <p>Apakah Anda yakin ingin menghapus data ini?</p>
                        <div className="flex justify-end space-x-2 mt-4">
                            <button
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Batal
                            </button>
                            <button
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                onClick={() => deleteId && handleDelete(deleteId)}
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showTambahStok && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Tambah Stok Baru</h3>
                            <button
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => setShowTambahStok(false)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <TambahStok
                            onSuccess={() => {
                                setShowTambahStok(false);
                                fetchStoks();
                                alert('Stok berhasil ditambahkan');
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default StokGudang;