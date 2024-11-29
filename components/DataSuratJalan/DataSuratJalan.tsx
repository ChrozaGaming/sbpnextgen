'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaFilePdf, FaTrash, FaChevronLeft, FaChevronRight, FaSearch, FaPrint } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { ErrorBoundary } from 'react-error-boundary';

// Interfaces
interface SuratJalan {
    id: number;
    noSurat: string;
    tanggal: string;
    noPO: string;
    noKendaraan: string;
    ekspedisi: string;
    username: string;
}

interface PaginationInfo {
    total: number;
    currentPage: number;
    totalPages: number;
    limit: number;
    startIndex: number;
    endIndex: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

interface ApiResponse {
    success: boolean;
    data: SuratJalan[];
    pagination: PaginationInfo;
    error?: string;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
);

const EmptyState: React.FC<{ searchTerm: string }> = ({ searchTerm }) => (
    <div className="text-center py-4">
        {searchTerm
            ? `Tidak ada data surat jalan dengan nomor "${searchTerm}"`
            : "Tidak ada data surat jalan"}
    </div>
);

interface ErrorFallbackProps {
    error: Error;
    resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => (
    <div role="alert" className="text-center p-4">
        <p className="text-red-500 font-bold">Terjadi kesalahan:</p>
        <pre className="text-sm text-red-600 mt-2">{error.message}</pre>
        <button
            onClick={resetErrorBoundary}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
            Coba Lagi
        </button>
    </div>
);

const DataSuratJalan: React.FC = () => {
    const router = useRouter();
    const [suratJalan, setSuratJalan] = useState<SuratJalan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [pagination, setPagination] = useState<PaginationInfo>({
        total: 0,
        currentPage: 1,
        totalPages: 1,
        limit: itemsPerPage,
        startIndex: 0,
        endIndex: 0,
        hasNextPage: false,
        hasPrevPage: false
    });

    const lastFetchedData = useRef<string>('');
    const pollingInterval = useRef<NodeJS.Timeout>();
    const searchTimeout = useRef<NodeJS.Timeout>();

    // Calculate row number based on current page and position
    const getRowNumber = (index: number): number => {
        return ((currentPage - 1) * itemsPerPage) + index + 1;
    };

    useEffect(() => {
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        searchTimeout.current = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1);
        }, 300);

        return () => {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
        };
    }, [searchTerm]);

    const fetchData = useCallback(async (search: string = debouncedSearchTerm, showLoading: boolean = true) => {
        try {
            setError(null);
            if (showLoading) setLoading(true);

            const response = await fetch(
                `/api/suratjalan?page=${currentPage}&limit=${itemsPerPage}&search=${search}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json() as ApiResponse;

            if (result.success) {
                const newDataString = JSON.stringify(result.data);
                if (newDataString !== lastFetchedData.current) {
                    setSuratJalan(result.data);
                    setPagination({
                        ...result.pagination,
                        startIndex: (result.pagination.currentPage - 1) * itemsPerPage
                    });
                    lastFetchedData.current = newDataString;
                }
            } else {
                throw new Error(result.error || 'Failed to fetch data');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setError(error instanceof Error ? error.message : 'Gagal memuat data');
        } finally {
            if (showLoading) setLoading(false);
        }
    }, [currentPage, itemsPerPage, debouncedSearchTerm]);

    useEffect(() => {
        fetchData(debouncedSearchTerm, true);
    }, [fetchData, debouncedSearchTerm, currentPage]);

    useEffect(() => {
        pollingInterval.current = setInterval(() => {
            fetchData(debouncedSearchTerm, false);
        }, 5000);

        return () => {
            if (pollingInterval.current) {
                clearInterval(pollingInterval.current);
            }
        };
    }, [fetchData, debouncedSearchTerm]);

    const handleDelete = async (id: number) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus surat jalan ini?')) {
            return;
        }

        try {
            const response = await fetch(`/api/suratjalan/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                alert('Surat jalan berhasil dihapus');
                // Reset to page 1 if current page becomes empty after deletion
                if (suratJalan.length === 1 && currentPage > 1) {
                    setCurrentPage(1);
                }
                fetchData(debouncedSearchTerm, true);
            } else {
                alert(data.error || 'Gagal menghapus surat jalan');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Terjadi kesalahan saat menghapus data');
        }
    };

    const handleViewPDF = (id: number) => {
        window.open(`/api/suratjalan/pdf/${id}`, '_blank');
    };

    const handlePrint = (id: number) => {
        const printWindow = window.open(`/api/suratjalan/pdf/${id}`, '_blank');
        printWindow?.addEventListener('load', () => {
            printWindow.print();
        });
    };

    if (loading && suratJalan.length === 0) return <LoadingSpinner />;
    if (error) return <ErrorFallback error={new Error(error)} resetErrorBoundary={() => fetchData(debouncedSearchTerm, true)} />;

    return (
        <div className="container mx-auto px-4">
            <div className="mb-4">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Cari No Surat..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                </div>
            </div>

            {suratJalan.length === 0 ? (
                <EmptyState searchTerm={searchTerm} />
            ) : (
                <>
                    <div className="overflow-x-auto shadow-md rounded-lg">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-50">
                            <tr>
                                {['No.', 'No. Surat', 'Tanggal', 'No. PO', 'No. Kendaraan', 'Ekspedisi', 'Action'].map((header) => (
                                    <th
                                        key={header}
                                        className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {suratJalan.map((item, index) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {getRowNumber(index)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {item.noSurat}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(item.tanggal).toLocaleDateString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {item.noPO}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {item.noKendaraan}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {item.ekspedisi}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleViewPDF(item.id)}
                                                className="text-white bg-blue-600 hover:bg-blue-700 p-2 rounded-full"
                                                title="View PDF"
                                            >
                                                <FaFilePdf />
                                            </button>
                                            <button
                                                onClick={() => handlePrint(item.id)}
                                                className="text-white bg-green-600 hover:bg-green-700 p-2 rounded-full"
                                                title="Print"
                                            >
                                                <FaPrint />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="text-white bg-red-600 hover:bg-red-700 p-2 rounded-full"
                                                title="Delete"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Menampilkan {getRowNumber(0)} - {getRowNumber(suratJalan.length - 1)} dari {pagination.total} data
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                disabled={!pagination.hasPrevPage}
                                className={`px-3 py-1 rounded-md ${
                                    pagination.hasPrevPage
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                <FaChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="text-sm text-gray-700">
                                Halaman {pagination.currentPage} dari {pagination.totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                disabled={!pagination.hasNextPage}
                                className={`px-3 py-1 rounded-md ${
                                    pagination.hasNextPage
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                <FaChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default function DataSuratJalanWithErrorBoundary() {
    return (
        <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
            <DataSuratJalan />
        </ErrorBoundary>
    );
}