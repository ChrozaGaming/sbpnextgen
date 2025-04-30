/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import dynamic from 'next/dynamic';
import TambahStok from './TambahStok';
import DeleteStokButton from './DeleteStokButton';

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

const StokGudang: React.FC = () => {
  const [stoks, setStoks] = useState<Stok[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTambahStok, setShowTambahStok] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: 'asc' });
  const [csvData, setCsvData] = useState<{
    data: any[];
    headers: { label: string; key: string }[];
    filename: string;
  }>({
    data: [],
    headers: [],
    filename: ''
  });

  function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: Parameters<F>): void => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), waitFor);
    };
  }

  const debouncedSearch = debounce((searchTerm: string) => {
    setSearch(searchTerm);
    setCurrentPage(1);
  }, 300);

  const handleSort = (key: keyof Stok) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === 'asc'
          ? 'desc'
          : 'asc',
    }));
    setCurrentPage(1);
  };

  const getSortIndicator = (key: keyof Stok) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? '↑' : '↓';
    }
    return '';
  };

  const capitalizeFirstLetter = (string: string) => {
    return string.split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  // Added function to handle status class
  const getStatusClass = (status: string) => {
    if (status === 'aman') return 'bg-green-100 text-green-800';
    if (status === 'rusak') return 'bg-red-100 text-red-800';
    if (status === 'cacat') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const sortedStoks = useMemo(() => {
    // Kembali stoks tanpa sorting jika key kosong
    if (!sortConfig.key) return stoks;
    
    return [...stoks].sort((a, b) => {
      const key = sortConfig.key as keyof Stok;
      
      // Tangani kasus di mana nilai mungkin null atau undefined
      const valueA = a[key] ?? null;
      const valueB = b[key] ?? null;
      
      // Jika keduanya null/undefined, anggap sama
      if (valueA === null && valueB === null) return 0;
      
      // Jika hanya A yang null/undefined, letakkan di akhir saat asc, di awal saat desc
      if (valueA === null) return sortConfig.direction === 'asc' ? 1 : -1;
      
      // Jika hanya B yang null/undefined, letakkan di akhir saat asc, di awal saat desc
      if (valueB === null) return sortConfig.direction === 'asc' ? -1 : 1;
      
      // Jika keduanya ada nilai, lakukan perbandingan normal
      if (valueA < valueB) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [stoks, sortConfig]);
  

  const filteredStoks = useMemo(() => {
    return sortedStoks.filter((stok) => {
      const searchLower = search.toLowerCase();
      return (
        stok.kode.toLowerCase().includes(searchLower) ||
        stok.nama.toLowerCase().includes(searchLower) ||
        stok.kategori.toLowerCase().includes(searchLower) ||
        stok.lokasi.toLowerCase().includes(searchLower)
      );
    });
  }, [sortedStoks, search]);

  const fetchStoks = async () => {
    try {
      setLoading(true);
      // Fix URL construction - start with ? and use & for additional params
      let url = `/api/stok?page=${currentPage}`;
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedKategori) params.append('kategori', selectedKategori);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (sortConfig.key) {
        params.append('sortKey', sortConfig.key);
        params.append('sortDirection', sortConfig.direction);
      }
      // Only append params string if it's not empty
      const paramString = params.toString();
      if (paramString) {
        url += `&${paramString}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();

      if (data.success) {
        setStoks(data.data);
        setTotalPages(data.pagination.totalPages);
        prepareCsvData(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching stoks:', error);
      alert('Failed to fetch stoks: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const prepareCsvData = (data: Stok[]) => {
    const csvData = data.map(item => ({
      'Kode': item.kode,
      'Nama': item.nama,
      'Kategori': item.kategori,
      'Status': item.status,
      'Stok Masuk': item.stok_masuk,
      'Stok Keluar': item.stok_keluar,
      'Stok Sisa': item.stok_sisa,
      'Satuan': item.satuan,
      'Lokasi': item.lokasi,
      'Tanggal Entry': dayjs(item.tanggal_entry).format('DD/MM/YYYY'),
      'Tanggal Masuk': item.tanggal_masuk ? dayjs(item.tanggal_masuk).format('DD/MM/YYYY') : '-',
      'Tanggal Keluar': item.tanggal_keluar ? dayjs(item.tanggal_keluar).format('DD/MM/YYYY') : '-',
      'Keterangan': item.keterangan ?? '-'  // Changed from || to ??
    }));

    const headers = [
      { label: 'Kode', key: 'Kode' },
      { label: 'Nama', key: 'Nama' },
      { label: 'Kategori', key: 'Kategori' },
      { label: 'Status', key: 'Status' },
      { label: 'Stok Masuk', key: 'Stok Masuk' },
      { label: 'Stok Keluar', key: 'Stok Keluar' },
      { label: 'Stok Sisa', key: 'Stok Sisa' },
      { label: 'Satuan', key: 'Satuan' },
      { label: 'Lokasi', key: 'Lokasi' },
      { label: 'Tanggal Entry', key: 'Tanggal Entry' },
      { label: 'Tanggal Masuk', key: 'Tanggal Masuk' },
      { label: 'Tanggal Keluar', key: 'Tanggal Keluar' },
      { label: 'Keterangan', key: 'Keterangan' }
    ];

    setCsvData({
      data: csvData,
      headers: headers,
      filename: `stok-gudang-${dayjs().format('YYYYMMDD')}.csv`
    });
  };

  useEffect(() => {
    fetchStoks();
  }, [currentPage, selectedKategori, startDate, endDate, sortConfig, search]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Data Stok Gudang</h1>
        <div className="space-x-2">
          <CSVLink
            data={csvData.data || []}
            headers={csvData.headers || []}
            filename={csvData.filename}
            className="inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            Export CSV
          </CSVLink>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
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
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
            value={search}
            onChange={(e) => debouncedSearch(e.target.value)}
          />
          <select
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedKategori}
            onChange={(e) => setSelectedKategori(e.target.value)}
          >
            <option value="">Semua Kategori</option>
            <option value="material">Material</option>
            <option value="alat">Alat</option>
            <option value="consumable">Consumable</option>
          </select>
          <div className="flex space-x-2">
            <input
              type="date"
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="date"
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto shadow-md rounded-lg">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    {key: 'kode' as keyof Stok, label: 'Kode'},
                    {key: 'nama' as keyof Stok, label: 'Nama'},
                    {key: 'kategori' as keyof Stok, label: 'Kategori'},
                    {key: 'status' as keyof Stok, label: 'Status'},
                    {key: 'stok_masuk' as keyof Stok, label: 'Stok Masuk'},
                    {key: 'stok_keluar' as keyof Stok, label: 'Stok Keluar'},
                    {key: 'stok_sisa' as keyof Stok, label: 'Stok Sisa'},
                    {key: 'satuan' as keyof Stok, label: 'Satuan'},
                    {key: 'lokasi' as keyof Stok, label: 'Lokasi'},
                    {key: 'tanggal_entry' as keyof Stok, label: 'Tanggal Entry'},
                  ].map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort(column.key)}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{column.label}</span>
                        <span className="text-gray-400">
                          {getSortIndicator(column.key)}
                        </span>
                      </div>
                    </th>
                  ))}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStoks.map((stok) => (
                  <tr key={stok.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stok.kode}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stok.nama}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {capitalizeFirstLetter(stok.kategori)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full uppercase tracking-wider ${getStatusClass(stok.status)}`}>
                        {stok.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stok.stok_masuk}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stok.stok_keluar}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stok.stok_sisa}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stok.satuan}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stok.lokasi}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {dayjs(stok.tanggal_entry).format('DD/MM/YYYY')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <DeleteStokButton
                        id={stok.id}
                        kode={stok.kode}
                        nama={stok.nama}
                        onDelete={fetchStoks}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing page <span className="font-medium">{currentPage}</span> of{' '}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={`page-${i}`}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === i + 1
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {showTambahStok && (
        <TambahStok
          onClose={() => setShowTambahStok(false)}
          onSuccess={() => {
            setShowTambahStok(false);
            fetchStoks();
          }}
        />
      )}
    </div>
  );
};

export default StokGudang;
