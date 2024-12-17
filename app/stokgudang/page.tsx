'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tab } from '@headlessui/react';
import { FaBoxOpen, FaBoxes, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import EditStokModal from '@/components/stok/EditStokModal';

interface StokBarang {
    id: number;
    kode_barang: string;
    nama_barang: string;
    kategori: 'Epoxy' | 'Hardener' | 'Tools' | 'Material Pendukung';
    tipe_material: 'Floor Coating' | 'Self Leveling' | 'Mortar' | 'Primer' | 'Finishing';
    merek: string;
    warna: string;
    satuan: string;
    kemasan: string;
    jumlah: number;
    mixing_ratio: string;
    coverage_area: number;
    ketebalan: string;
    supplier: string;
    lokasi_gudang: string;
    status: 'aktif' | 'nonaktif';
}

interface StokMasuk {
    id: number; // Ditambahkan untuk key prop
    no_transaksi: string;
    tanggal_masuk: string;
    kode_barang: string;
    nama_barang: string;
    jumlah_masuk: number;
    supplier: string;
    no_po: string;
    penerima: string;
}

interface StokKeluar {
    id: number; // Ditambahkan untuk key prop
    no_transaksi: string;
    tanggal_keluar: string;
    kode_barang: string;
    nama_barang: string;
    jumlah_keluar: number;
    nama_proyek: string;
    lokasi_proyek: string;
    luas_area: number;
    tim_aplikator: string;
    pengambil: string;
}

interface NotificationState {
    show: boolean;
    message: string;
    type: 'success' | 'error';
}

export default function StokGudang() {
    const [dataStok, setDataStok] = useState<StokBarang[]>([]);
    const [dataMasuk, setDataMasuk] = useState<StokMasuk[]>([]);
    const [dataKeluar, setDataKeluar] = useState<StokKeluar[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTab, setSelectedTab] = useState(0);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<StokBarang | null>(null);
    const [notification, setNotification] = useState<NotificationState>({
        show: false,
        message: '',
        type: 'success'
    });

    // Memindahkan fetchData ke useCallback
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [stokRes, masukRes, keluarRes] = await Promise.all([
                fetch('/api/stok'),
                fetch('/api/stok/masuk'),
                fetch('/api/stok/keluar')
            ]);

            if (!stokRes.ok || !masukRes.ok || !keluarRes.ok) {
                throw new Error('Failed to fetch data');
            }

            const stokData = await stokRes.json();
            const masukData = await masukRes.json();
            const keluarData = await keluarRes.json();

            setDataStok(stokData.data || []);
            setDataMasuk(masukData.data || []);
            setDataKeluar(keluarData.data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const showNotification = useCallback((message: string, type: 'success' | 'error') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }));
        }, 3000);
    }, []);

    const handleEdit = useCallback((item: StokBarang) => {
        setSelectedItem(item);
        setIsEditModalOpen(true);
    }, []);

    const handleUpdate = useCallback(async (updatedData: StokBarang) => {
        try {
            const response = await fetch(`/api/stok/${updatedData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });

            if (!response.ok) {
                throw new Error('Failed to update data');
            }

            await fetchData();
            showNotification('Data berhasil diupdate', 'success');
            setIsEditModalOpen(false);
            setSelectedItem(null);
        } catch (error) {
            console.error('Error updating data:', error);
            showNotification('Gagal mengupdate data', 'error');
        }
    }, [fetchData, showNotification]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button
                        onClick={() => fetchData()}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Coba Lagi
                    </button>
                </div>
            </div>
        );
    }

    const tabItems = [
        { icon: FaBoxes, label: 'Stok Saat Ini', color: 'blue' },
        { icon: FaArrowLeft, label: 'Barang Masuk', color: 'green' },
        { icon: FaArrowRight, label: 'Barang Keluar', color: 'orange' }
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2">Sistem Manajemen Stok Gudang</h1>
                <p className="text-gray-600">Epoxy Specialist & General Contractor</p>
            </div>

            <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
                <Tab.List className="flex space-x-4 bg-white p-2 rounded-lg shadow mb-6">
                    {tabItems.map((item, index) => (
                        <Tab
                            key={index}
                            className={({ selected }) =>
                                `flex items-center px-4 py-2 rounded-md flex-1 justify-center ${
                                    selected
                                        ? `bg-${item.color}-600 text-white`
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`
                            }
                        >
                            <item.icon className="mr-2" />
                            {item.label}
                        </Tab>
                    ))}
                </Tab.List>

                <Tab.Panels>
                    <Tab.Panel>
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="p-4 border-b flex justify-between items-center">
                                <h2 className="text-lg font-semibold">Daftar Stok Material</h2>
                                <button
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Tambah Material
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {dataStok.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">{item.kode_barang}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{item.nama_barang}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{item.kategori}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {item.jumlah} {item.satuan}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        item.status === 'aktif'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {item.status}
                                                    </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </Tab.Panel>

                    <Tab.Panel>
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="p-4 border-b">
                                <h2 className="text-lg font-semibold">Riwayat Barang Masuk</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No Transaksi</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No PO</th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {dataMasuk.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">{item.no_transaksi}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {new Date(item.tanggal_masuk).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">{item.nama_barang}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{item.jumlah_masuk}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{item.supplier}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{item.no_po}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </Tab.Panel>

                    <Tab.Panel>
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="p-4 border-b">
                                <h2 className="text-lg font-semibold">Riwayat Barang Keluar</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No Transaksi</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proyek</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tim</th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {dataKeluar.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">{item.no_transaksi}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {new Date(item.tanggal_keluar).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">{item.nama_barang}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{item.jumlah_keluar}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{item.nama_proyek}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{item.tim_aplikator}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>

            {selectedItem && (
                <EditStokModal
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedItem(null);
                    }}
                    onSubmit={handleUpdate}
                    initialData={selectedItem}
                />
            )}

            {notification.show && (
                <div
                    className={`fixed bottom-4 right-4 px-4 py-2 rounded-md ${
                        notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                    } text-white`}
                >
                    {notification.message}
                </div>
            )}
        </div>
    );
}
