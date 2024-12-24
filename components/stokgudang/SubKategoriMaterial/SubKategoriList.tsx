// components/stokgudang/SubKategoriMaterial/SubKategoriList.tsx

import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { toast } from 'react-hot-toast';
import { EditModal } from './EditModal';
import { FilterComponents } from './FilterComponents';

interface SubKategoriMaterial {
    id: number;
    kategori_id: number;
    kategori_nama: string;
    kode_item: string;
    nama: string;
    brand: string | null;
    satuan: string;
    status: string;
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

interface CurrentFilters {
    kategori: string;
    brand: string;
    satuan: string;
    status: string;
}

const SubKategoriList = () => {
    const [items, setItems] = useState<SubKategoriMaterial[]>([]);
    const [filteredItems, setFilteredItems] = useState<SubKategoriMaterial[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<SubKategoriMaterial | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);
    const [currentFilters, setCurrentFilters] = useState<CurrentFilters>({
        kategori: '',
        brand: '',
        satuan: '',
        status: ''
    });

    const [pagination, setPagination] = useState<PaginationData>({
        total: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10
    });

    const fetchData = async (page: number = 1, search: string = '') => {
        try {
            setLoading(true);
            let queryParams = new URLSearchParams({
                page: page.toString(),
                limit: pagination.pageSize.toString(),
            });

            if (search) {
                queryParams.append('search', search);
            }

            if (currentFilters.kategori) {
                queryParams.append('kategori', currentFilters.kategori);
            }

            if (currentFilters.brand) {
                queryParams.append('brand', currentFilters.brand);
            }

            if (currentFilters.satuan) {
                queryParams.append('satuan', currentFilters.satuan);
            }

            if (currentFilters.status) {
                queryParams.append('status', currentFilters.status);
            }

            const response = await fetch(`/api/stokgudang/sub-kategori-material?${queryParams}`);

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            if (data.success) {
                setItems(data.data);
                setFilteredItems(data.data);
                setPagination(data.pagination);
            } else {
                throw new Error(data.message || 'Failed to fetch data');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Gagal memuat data');
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchData(1, searchTerm);
    }, [searchTerm, currentFilters]);

    const handleFilterChange = (newFilters: CurrentFilters) => {
        setCurrentFilters(newFilters);
        setPagination(prev => ({
            ...prev,
            currentPage: 1
        }));
    };


    const handleEdit = (item: SubKategoriMaterial) => {
        setSelectedItem(item);
        setShowEditModal(true);
    };

    const handleDelete = (id: number) => {
        setItemToDelete(id);
        setShowDeleteModal(true);
        setDeleteError(null);
        setDeletePassword('');
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        try {
            const response = await fetch(`/api/stokgudang/sub-kategori-material/${itemToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password: deletePassword }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Item berhasil dihapus');
                setShowDeleteModal(false);
                setDeletePassword('');
                setItemToDelete(null);
                fetchData(pagination.currentPage, searchTerm);
            } else {
                setDeleteError(data.message || 'Password tidak valid');
            }
        } catch (error) {
            console.error('Error deleting item:', error);
            setDeleteError('Terjadi kesalahan saat menghapus item');
        }
    };

    const getStatusColor = (status: string) => {
        const colors = {
            aman: 'bg-green-100 text-green-800',
            rusak: 'bg-red-100 text-red-800',
            cacat: 'bg-yellow-100 text-yellow-800',
            sisa: 'bg-gray-100 text-gray-800'
        };
        return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
    };

    const renderPagination = () => {
        if (pagination.totalPages <= 1) return null;

        return (
            <div className="px-6 py-4 flex justify-between items-center bg-white">
                <div className="text-sm text-gray-700">
                    Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to{' '}
                    {Math.min(pagination.currentPage * pagination.pageSize, pagination.total)} of{' '}
                    {pagination.total} results
                </div>
                <div className="flex space-x-2">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => fetchData(page, searchTerm)}
                            className={`px-3 py-1 rounded ${
                                page === pagination.currentPage
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">
                    Daftar Produk Yang Sudah Terdaftar
                </h1>
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

            <FilterComponents
                onFilterChange={(filters: CurrentFilters) => handleFilterChange(filters)}
            />


            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode Item</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Satuan</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated At</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                        <tr>
                            <td colSpan={9} className="px-6 py-4 text-center">
                                Loading...
                            </td>
                        </tr>
                    ) : filteredItems.length === 0 ? (
                        <tr>
                            <td colSpan={9} className="px-6 py-4 text-center">
                                Tidak ada data
                            </td>
                        </tr>
                    ) : (
                        filteredItems.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {item.kategori_nama}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {item.kode_item}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {item.nama}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {item.brand || '-'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {item.satuan}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                                            {item.status.toUpperCase()}
                                        </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {item.keterangan || '-'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {dayjs(item.updated_at).format('DD/MM/YYYY HH:mm')}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="text-blue-600 hover:text-blue-900 transition duration-150 ease-in-out flex items-center"
                                        >
                                            <svg
                                                className="w-4 h-4 mr-1"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                                />
                                            </svg>
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="text-red-600 hover:text-red-900 transition duration-150 ease-in-out flex items-center"
                                        >
                                            <svg
                                                className="w-4 h-4 mr-1"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
                                            </svg>
                                            Hapus
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
                {renderPagination()}
            </div>

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
                                {deleteError && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                        <p className="text-sm text-red-600">{deleteError}</p>
                                    </div>
                                )}
                                <p className="text-sm text-gray-500 mb-4">
                                    Anda perlu memasukkan password untuk menghapus item ini.<br />
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
                                            setDeleteError(null);
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
