'use client';

import { useEffect, useState } from 'react';
import { generatePDF } from '@/utils/suratjalan/pdfGenerator/pdfGenerator';

interface BarangDetail {
    kode: string | null;
    nama: string | null;
    jumlah: number | null;
    satuan: string | null;
}

interface SuratJalan {
    id: number;
    nomor_surat: string;
    tujuan: string;
    tanggal: string;
    nomor_kendaraan: string | null;
    no_po: string | null;
    keterangan_proyek: string | null;
    barang: BarangDetail[];
    created_at: string;
}

const formatTanggal = (tanggal: string): string => {
    const date = new Date(tanggal);
    const options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    };
    return date.toLocaleDateString('id-ID', options);
};

const DataSuratJalan = () => {
    const [suratJalan, setSuratJalan] = useState<SuratJalan[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchField, setSearchField] = useState<'nomor_surat' | 'no_po' | 'tujuan' | 'keterangan_proyek'>('nomor_surat');
    const [sortField, setSortField] = useState<keyof SuratJalan>('id');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        const fetchSuratJalan = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `/api/suratjalan?search=${searchQuery}&field=${searchField}&sort=${sortField}&order=${sortOrder}&page=${currentPage}&limit=${ITEMS_PER_PAGE}`
                );
                if (!response.ok) throw new Error('Gagal mengambil data surat jalan');

                const data = await response.json();
                setSuratJalan(data.data);
                setTotalPages(data.pagination.totalPages);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSuratJalan();
    }, [searchQuery, searchField, sortField, sortOrder, currentPage]);

    const handleSort = (field: keyof SuratJalan) => {
        const newOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortOrder(newOrder);
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    if (loading) {
        return <div className="text-center">Memuat data surat jalan...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center">Error: {error}</div>;
    }

    return (
        <div className="mt-8">
            <h2 className="text-xl font-bold text-center mb-4">Daftar Surat Jalan</h2>
            <div className="mb-4 flex items-center space-x-4">
                <select
                    value={searchField}
                    onChange={(e) => setSearchField(e.target.value as any)}
                    className="border rounded-md p-2"
                >
                    <option value="nomor_surat">Nomor Surat</option>
                    <option value="no_po">No PO</option>
                    <option value="tujuan">Tujuan</option>
                    <option value="keterangan_proyek">Keterangan Proyek</option>
                </select>
                <input
                    type="text"
                    placeholder={`Cari berdasarkan ${searchField}`}
                    className="flex-1 border rounded-md p-2"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                    <tr className="bg-gray-200">
                        <th onClick={() => handleSort('id')} className="cursor-pointer">
                            No {sortField === 'id' && (sortOrder === 'asc' ? '▲' : '▼')}
                        </th>
                        <th onClick={() => handleSort('nomor_surat')} className="cursor-pointer">
                            Nomor Surat {sortField === 'nomor_surat' && (sortOrder === 'asc' ? '▲' : '▼')}
                        </th>
                        <th onClick={() => handleSort('tujuan')} className="cursor-pointer">
                            Tujuan {sortField === 'tujuan' && (sortOrder === 'asc' ? '▲' : '▼')}
                        </th>
                        <th onClick={() => handleSort('tanggal')} className="cursor-pointer">
                            Tanggal {sortField === 'tanggal' && (sortOrder === 'asc' ? '▲' : '▼')}
                        </th>
                        <th onClick={() => handleSort('keterangan_proyek')} className="cursor-pointer">
                            Keterangan Proyek {sortField === 'keterangan_proyek' && (sortOrder === 'asc' ? '▲' : '▼')}
                        </th>
                        <th>Cetak PDF</th>
                    </tr>
                    </thead>
                    <tbody>
                    {suratJalan.map((item, index) => (
                        <tr key={item.id} className="text-center">
                            <td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                            <td>{item.nomor_surat}</td>
                            <td>{item.tujuan}</td>
                            <td>{formatTanggal(item.tanggal)}</td>
                            <td>{item.keterangan_proyek || '-'}</td>
                            <td>
                                <button
                                    onClick={() => {
                                        if (!item.barang || item.barang.some(b => !b.kode || !b.nama || !b.jumlah || !b.satuan)) {
                                            alert('Data barang tidak valid. Tidak dapat mencetak PDF.');
                                            return;
                                        }
                                        generatePDF(item);
                                    }}
                                    className="text-blue-500 hover:text-blue-700"
                                >
                                    Cetak
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-center items-center space-x-4 mt-4">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 border rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-500 hover:text-blue-700'}`}
                >
                    Previous
                </button>
                <span className="font-medium">
                    Halaman {currentPage} dari {totalPages}
                </span>
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 border rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-blue-500 hover:text-blue-700'}`}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default DataSuratJalan;
