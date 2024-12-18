'use client'

import { useEffect, useState } from "react"

interface StokData {
    id: number;
    kode: string;
    nama: string;
    kategori: string;
    kode_item?: string;
    sub_kategori_nama?: string;
    brand?: string;
    status?: string;
    stok_masuk: number;
    stok_keluar: number;
    stok_sisa: number;
    satuan: string;
    lokasi: string;
    tanggal_entry: string;
    tanggal_masuk: string | null;
    tanggal_keluar: string | null;
    keterangan?: string;
}

interface SortConfig {
    key: keyof StokData;
    direction: 'asc' | 'desc';
}

export default function DataStokKeluar() {
    const [data, setData] = useState<StokData[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'kode', direction: 'asc' })
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    const fetchData = async () => {
        try {
            setLoading(true)
            const response = await fetch("/api/stokgudang/keluar")
            const result = await response.json()
            setData(result.data)
        } catch (error) {
            console.error("Error fetching data:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const sortData = (data: StokData[]) => {
        return [...data].sort((a, b) => {
            let aValue = a[sortConfig.key] || '';
            let bValue = b[sortConfig.key] || '';

            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase()
                bValue = bValue.toLowerCase()
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    const handleSort = (key: keyof StokData) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }))
    }

    const getSortIcon = (key: keyof StokData) => {
        if (sortConfig.key !== key) return '↕️'
        return sortConfig.direction === 'asc' ? '↑' : '↓'
    }

    const filteredData = data.filter(item =>
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.kode.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const paginateData = (items: StokData[]) => {
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return items.slice(startIndex, endIndex)
    }

    const totalPages = Math.ceil(filteredData.length / itemsPerPage)

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    return (
        <div className="container mx-auto p-4">
            {/* Header Section */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Stok Keluar</h1>
                <p className="text-gray-600">Data barang yang keluar dari gudang</p>
            </div>

            {/* Search and Refresh Section */}
            <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="Cari berdasarkan nama atau kode..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    />
                    <svg
                        className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>

                <button
                    onClick={() => fetchData()}
                    className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm"
                >
                    <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                    </svg>
                    Refresh Data
                </button>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <>
                    {/* Table Section */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1000px]">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        onClick={() => handleSort('kode')}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    >
                                        <div className="flex items-center gap-1">
                                            Kode
                                            <span className="text-gray-400">{getSortIcon('kode')}</span>
                                        </div>
                                    </th>
                                    <th
                                        onClick={() => handleSort('nama')}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    >
                                        <div className="flex items-center gap-1">
                                            Nama
                                            <span className="text-gray-400">{getSortIcon('nama')}</span>
                                        </div>
                                    </th>
                                    <th
                                        onClick={() => handleSort('kategori')}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    >
                                        <div className="flex items-center gap-1">
                                            Kategori
                                            <span className="text-gray-400">{getSortIcon('kategori')}</span>
                                        </div>
                                    </th>
                                    <th
                                        onClick={() => handleSort('brand')}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    >
                                        <div className="flex items-center gap-1">
                                            Brand
                                            <span className="text-gray-400">{getSortIcon('brand')}</span>
                                        </div>
                                    </th>
                                    <th
                                        onClick={() => handleSort('stok_keluar')}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    >
                                        <div className="flex items-center gap-1">
                                            Jumlah Keluar
                                            <span className="text-gray-400">{getSortIcon('stok_keluar')}</span>
                                        </div>
                                    </th>
                                    <th
                                        onClick={() => handleSort('tanggal_keluar')}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    >
                                        <div className="flex items-center gap-1">
                                            Tanggal Keluar
                                            <span className="text-gray-400">{getSortIcon('tanggal_keluar')}</span>
                                        </div>
                                    </th>
                                    <th
                                        onClick={() => handleSort('keterangan')}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    >
                                        <div className="flex items-center gap-1">
                                            Keterangan
                                            <span className="text-gray-400">{getSortIcon('keterangan')}</span>
                                        </div>
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {paginateData(sortData(filteredData)).map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {item.kode}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.nama}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.kategori}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.brand || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                                            {item.stok_keluar.toLocaleString()} {item.satuan}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.tanggal_keluar
                                                ? new Date(item.tanggal_keluar).toLocaleDateString('id-ID', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })
                                                : '-'
                                            }
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.keterangan || '-'}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination Section */}
                    <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-gray-700">
                            Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} dari {filteredData.length} data
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                            <button
                                onClick={() => handlePageChange(1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1 rounded border border-gray-300 text-sm font-medium
                                    disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100
                                    transition-colors duration-200"
                            >
                                ««
                            </button>
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1 rounded border border-gray-300 text-sm font-medium
                                    disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100
                                    transition-colors duration-200"
                            >
                                «
                            </button>

                            {[...Array(totalPages)].map((_, index) => {
                                const pageNumber = index + 1;
                                if (
                                    pageNumber === 1 ||
                                    pageNumber === totalPages ||
                                    (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
                                ) {
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => handlePageChange(pageNumber)}
                                            className={`px-3 py-1 rounded border text-sm font-medium
                                                transition-colors duration-200 
                                                ${currentPage === pageNumber
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'border-gray-300 hover:bg-gray-100'
                                            }`}
                                        >
                                            {pageNumber}
                                        </button>
                                    )
                                } else if (
                                    pageNumber === currentPage - 3 ||
                                    pageNumber === currentPage + 3
                                ) {
                                    return <span key={index} className="px-2">...</span>
                                }
                                return null
                            })}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 rounded border border-gray-300 text-sm font-medium
                                    disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100
                                    transition-colors duration-200"
                            >
                                »
                            </button>
                            <button
                                onClick={() => handlePageChange(totalPages)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 rounded border border-gray-300 text-sm font-medium
                                    disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100
                                    transition-colors duration-200"
                            >
                                »»
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
