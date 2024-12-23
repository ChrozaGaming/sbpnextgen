import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { toast } from 'react-hot-toast';
import { EditModal } from './EditModal';

interface SubKategoriMaterial {
    id: number;
    kategori_id: number;
    kategori_nama: string;
    kode_item: string;
    nama: string;
    brand: string | null;
    satuan: 'kg' | 'kgset' | 'pail' | 'galon5liter' | 'galon10liter' | 'pcs' | 'lonjor' | 'liter' | 'literset' | 'sak' | 'unit';
    status: 'aman' | 'rusak' | 'cacat' | 'sisa';
    keterangan: string | null;
    created_at: string;
    updated_at: string;
}

interface PaginationData {
    total: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

const SubKategoriList = () => {
    const [items, setItems] = useState<SubKategoriMaterial[]>([]);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<SubKategoriMaterial | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);
    const [pagination, setPagination] = useState<PaginationData>({
        total: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10
    });
    const fetchData = async (page: number = 1, search: string = '') => {
        try {
            setLoading(true);
            const response = await fetch(
                `/api/stokgudang/sub-kategori-material?page=${page}&limit=${pagination.pageSize}&search=${search}`
            );
            const data = await response.json();

            if (data.success) {
                setItems(data.data);
                setPagination(data.pagination);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Gagal memuat data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchData(1, searchTerm);
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm]);

    const handleEdit = (item: SubKategoriMaterial) => {
        setSelectedItem(item);
        setShowEditModal(true);
    };

    const handleDelete = (id: number) => {
        setItemToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (deletePassword !== 'TES123') {
            toast.error('Password salah');
            return;
        }

        try {
            const response = await fetch(`/api/stokgudang/sub-kategori-material/${itemToDelete}`, {
                method: 'DELETE',
            });
            const data = await response.json();

            if (data.success) {
                toast.success('Item berhasil dihapus');
                fetchData(pagination.currentPage, searchTerm);
                setShowDeleteModal(false);
                setDeletePassword('');
                setItemToDelete(null);
                setDeleteError(null);
            } else {
                setDeleteError(data.message);
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error deleting item:', error);
            setDeleteError(error instanceof Error ? error.message : 'Gagal menghapus item');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'aman':
                return 'bg-green-100 text-green-800';
            case 'rusak':
                return 'bg-red-100 text-red-800';
            case 'cacat':
                return 'bg-yellow-100 text-yellow-800';
            case 'sisa':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    const renderPagination = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return (
            <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                <div className="flex justify-between flex-1 sm:hidden">
                    <button
                        onClick={() => fetchData(pagination.currentPage - 1, searchTerm)}
                        disabled={pagination.currentPage === 1}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md
                            ${pagination.currentPage === 1
                            ? 'bg-gray-100 text-gray-400'
                            : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => fetchData(pagination.currentPage + 1, searchTerm)}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md
                            ${pagination.currentPage === pagination.totalPages
                            ? 'bg-gray-100 text-gray-400'
                            : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                        Next
                    </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Showing{' '}
                            <span className="font-medium">
                                {((pagination.currentPage - 1) * pagination.pageSize) + 1}
                            </span>{' '}
                            to{' '}
                            <span className="font-medium">
                                {Math.min(pagination.currentPage * pagination.pageSize, pagination.total)}
                            </span>{' '}
                            of{' '}
                            <span className="font-medium">{pagination.total}</span>{' '}
                            results
                        </p>
                    </div>
                    <div>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                            <button
                                onClick={() => fetchData(1, searchTerm)}
                                disabled={pagination.currentPage === 1}
                                className={`relative inline-flex items-center px-2 py-2 rounded-l-md text-sm font-medium
                                    ${pagination.currentPage === 1
                                    ? 'bg-gray-100 text-gray-400'
                                    : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                            >
                                <span className="sr-only">First</span>
                                «
                            </button>
                            <button
                                onClick={() => fetchData(pagination.currentPage - 1, searchTerm)}
                                disabled={pagination.currentPage === 1}
                                className={`relative inline-flex items-center px-2 py-2 text-sm font-medium
                                    ${pagination.currentPage === 1
                                    ? 'bg-gray-100 text-gray-400'
                                    : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                            >
                                <span className="sr-only">Previous</span>
                                ‹
                            </button>
                            {pageNumbers.map((page) => (
                                <button
                                    key={page}
                                    onClick={() => fetchData(page, searchTerm)}
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium
                                        ${pagination.currentPage === page
                                        ? 'z-10 bg-blue-600 text-white'
                                        : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => fetchData(pagination.currentPage + 1, searchTerm)}
                                disabled={pagination.currentPage === pagination.totalPages}
                                className={`relative inline-flex items-center px-2 py-2 text-sm font-medium
                                    ${pagination.currentPage === pagination.totalPages
                                    ? 'bg-gray-100 text-gray-400'
                                    : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                            >
                                <span className="sr-only">Next</span>
                                ›
                            </button>
                            <button
                                onClick={() => fetchData(pagination.totalPages, searchTerm)}
                                disabled={pagination.currentPage === pagination.totalPages}
                                className={`relative inline-flex items-center px-2 py-2 rounded-r-md text-sm font-medium
                                    ${pagination.currentPage === pagination.totalPages
                                    ? 'bg-gray-100 text-gray-400'
                                    : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                            >
                                <span className="sr-only">Last</span>
                                »
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        );
    };
    if (loading && !items.length) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Daftar Produk Yang Sudah Terdaftar</h1>
                <div className="w-full md:w-1/3">
                    <input
                        type="text"
                        placeholder="Cari berdasarkan kode atau nama..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Kategori
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Kode Item
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nama
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Brand
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Satuan
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Keterangan
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Updated At
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Aksi
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.kategori_nama}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.kode_item}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.nama}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.brand || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.satuan}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                                        {item.status.toUpperCase()}
                                    </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.keterangan || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {dayjs(item.updated_at).format('DD/MM/YYYY HH:mm')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                <button
                                    onClick={() => handleEdit(item)}
                                    className="text-blue-600 hover:text-blue-900"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="text-red-600 hover:text-red-900"
                                >
                                    Hapus
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                {renderPagination()}
            </div>

            {/* Modals */}
            {showEditModal && (
                <EditModal
                    item={selectedItem}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedItem(null);
                    }}
                    onSuccess={() => {
                        setShowEditModal(false);
                        setSelectedItem(null);
                        fetchData(pagination.currentPage, searchTerm);
                    }}
                />
            )}

            {showDeleteModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                            <div className="text-center mb-6">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Konfirmasi Hapus</h3>

                                {/* Error Message */}
                                {deleteError && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                        <p className="text-sm text-red-600">
                                            {deleteError}
                                        </p>
                                    </div>
                                )}

                                <p className="text-sm text-gray-500 mb-4">
                                    Anda perlu memasukkan password untuk menghapus item ini.
                                    <br />
                                    Hubungi Admin System: <span className="font-medium">Bpk. Prasetyo Wibowo</span>
                                </p>
                                <div className="mb-4">
                                    <input
                                        type="password"
                                        value={deletePassword}
                                        onChange={(e) => setDeletePassword(e.target.value)}
                                        placeholder="Masukkan password"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                confirmDelete();
                                            }
                                        }}
                                    />
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={() => {
                                            setShowDeleteModal(false);
                                            setDeletePassword('');
                                            setItemToDelete(null);
                                            setDeleteError(null); // Reset error saat modal ditutup
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubKategoriList;
