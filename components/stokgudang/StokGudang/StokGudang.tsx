'use client'

import {useEffect, useState} from "react"

interface StokData {
    id: number
    kode: string
    nama: string
    kategori: string
    sub_kategori: {
        kode: string
        nama: string
        brand: string
        satuan: 'kg' | 'kgset' | 'pail' | 'galon5liter' | 'galon10liter' | 'pcs' | 'lonjor' | 'liter' | 'literset' | 'sak' | 'unit'
    }
    stok: {
        masuk: number
        keluar: number
        sisa: number
        satuan: string
    }
    lokasi: string
    status?: 'aman' | 'rusak' | 'cacat' | 'sisa'
    tanggal: {
        entry: string
        masuk: string | null
        keluar: string | null
    }
}

interface SortConfig {
    key: keyof StokData | 'sub_kategori.brand' | 'stok.masuk' | 'stok.keluar' | 'stok.sisa' | 'tanggal.entry' | 'lokasi' | 'status'
    direction: 'asc' | 'desc'
}

export default function StokGudang() {
    const [data, setData] = useState<StokData[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [sortConfig, setSortConfig] = useState<SortConfig>({key: 'kode', direction: 'asc'})
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    const fetchData = async () => {
        try {
            setLoading(true)
            const response = await fetch("/api/stokgudang/all")
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
            let aValue: any
            let bValue: any

            if (sortConfig.key.includes('.')) {
                const [parent, child] = sortConfig.key.split('.')
                aValue = a[parent as keyof StokData][child]
                bValue = b[parent as keyof StokData][child]

                if (parent === 'tanggal') {
                    aValue = new Date(aValue).getTime()
                    bValue = new Date(bValue).getTime()
                }
            } else {
                aValue = a[sortConfig.key as keyof StokData]
                bValue = b[sortConfig.key as keyof StokData]
            }

            if (aValue === null || aValue === undefined) return 1
            if (bValue === null || bValue === undefined) return -1

            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase()
                bValue = bValue.toLowerCase()
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
            return 0
        })
    }

    const handleSort = (key: SortConfig['key']) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }))
    }

    const getSortIcon = (key: SortConfig['key']) => {
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

    const getStatusStyle = (status: string = 'aman') => {
        switch (status.toLowerCase()) {
            case 'aman':
                return 'bg-green-100 text-green-800'
            case 'rusak':
                return 'bg-red-100 text-red-800'
            case 'cacat':
                return 'bg-yellow-100 text-yellow-800'
            case 'sisa':
                return 'bg-gray-100 text-gray-800'
            default:
                return 'bg-green-100 text-green-800'
        }
    }

    return (
        <div className="container mx-auto p-4">
            {/* Header Section */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Stok Gudang</h1>
                <p className="text-gray-600">Kelola dan monitor stok barang di gudang</p>
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
                                    <th scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('kode')}>
                                        Kode {getSortIcon('kode')}
                                    </th>
                                    <th scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('nama')}>
                                        Nama {getSortIcon('nama')}
                                    </th>
                                    <th scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('kategori')}>
                                        Kategori {getSortIcon('kategori')}
                                    </th>
                                    <th scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('sub_kategori.brand')}>
                                        Brand {getSortIcon('sub_kategori.brand')}
                                    </th>
                                    <th scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('stok.masuk')}>
                                        Stok Masuk {getSortIcon('stok.masuk')}
                                    </th>
                                    <th scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('stok.keluar')}>
                                        Stok Keluar {getSortIcon('stok.keluar')}
                                    </th>
                                    <th scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('stok.sisa')}>
                                        Stok Sisa {getSortIcon('stok.sisa')}
                                    </th>
                                    <th scope="col"
                                        onClick={() => handleSort('tanggal.entry')}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                                        <div className="flex items-center gap-1">
                                            Tanggal Entry {getSortIcon('tanggal.entry')}
                                        </div>
                                    </th>
                                    <th scope="col"
                                        onClick={() => handleSort('lokasi')}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                                        <div className="flex items-center gap-1">
                                            Lokasi {getSortIcon('lokasi')}
                                        </div>
                                    </th>
                                    <th scope="col"
                                        onClick={() => handleSort('status')}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                                        <div className="flex items-center gap-1">
                                            Status {getSortIcon('status')}
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
                                            {item.sub_kategori.brand || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.stok.masuk.toLocaleString()} {item.stok.satuan}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.stok.keluar.toLocaleString()} {item.stok.satuan}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <span className={`${
            item.stok.sisa <= 10
                ? 'text-red-600 font-bold'
                : 'text-gray-900'
        }`}>
            {item.stok.sisa.toLocaleString()} {item.stok.satuan}
        </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(item.tanggal.entry).toLocaleDateString('id-ID', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.lokasi}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(item.status || 'aman')}`}>
                                                {(item.status || 'aman').toUpperCase()}
                                            </span>
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
                                const pageNumber = index + 1
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
