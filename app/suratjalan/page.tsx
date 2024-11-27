'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import 'jspdf-autotable';
import { generatePDF } from '@/utils/pdfGenerator';  // Hapus savePDF dari import

interface BarangItem {
    no?: string;
    jumlah: string;
    kemasan: string;
    kode: string;
    nama: string;
    keterangan: string;
}

interface FormData {
    noSurat: string;
    tanggal: string;
    noPO: string;
    noKendaraan: string;
    ekspedisi: string;
}

const defaultBarangItem: BarangItem = {
    jumlah: '',
    kemasan: '',
    kode: '',
    nama: '',
    keterangan: ''
};

const defaultFormData: FormData = {
    noSurat: '',
    tanggal: '',
    noPO: '',
    noKendaraan: '',
    ekspedisi: ''
};

export default function SuratJalan() {
    const router = useRouter();
    const { user } = useAuth();
    const [formData, setFormData] = useState<FormData>(defaultFormData);
    const [barang, setBarang] = useState<BarangItem[]>([defaultBarangItem]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!user) {
            router.push('/login');
        }
    }, [user, router]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleBarangChange = (index: number, field: keyof BarangItem, value: string) => {
        const newBarang = [...barang];
        newBarang[index] = {
            ...newBarang[index],
            [field]: value
        };
        setBarang(newBarang);
    };

    const addBarangRow = () => {
        setBarang([...barang, defaultBarangItem]);
    };

    const removeBarangRow = (index: number) => {
        if (barang.length > 1) {
            const newBarang = barang.filter((_, i) => i !== index);
            setBarang(newBarang);
        }
    };

    const handleGeneratePDF = async () => {
        try {
            setIsLoading(true);

            // Validasi form
            if (!formData.noSurat || !formData.tanggal || !formData.noPO ||
                !formData.noKendaraan || !formData.ekspedisi) {
                alert('Mohon lengkapi semua data surat jalan');
                return;
            }

            if (!user?.id) {
                alert('Sesi login tidak valid. Silakan login ulang.');
                return;
            }

            if (!barang.length) {
                alert('Minimal harus ada satu data barang');
                return;
            }

            // Konfirmasi
            const isConfirmed = window.confirm('Apakah Anda yakin ingin menyimpan dan generate PDF?');
            if (!isConfirmed) return;

            // Simpan data surat jalan
            const suratJalanResponse = await fetch('/api/suratjalan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    user_id: user.id
                }),
            });

            const suratJalanData = await suratJalanResponse.json();

            if (!suratJalanResponse.ok) {
                throw new Error(suratJalanData.error || 'Gagal menyimpan surat jalan');
            }

            // Simpan data barang
            const barangResponse = await fetch('/api/barang', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    suratJalanId: suratJalanData.id,
                    barang: barang
                }),
            });

            const barangResponseData = await barangResponse.json();

            if (!barangResponse.ok) {
                throw new Error(barangResponseData.error || 'Gagal menyimpan data barang');
            }

            // Generate PDF
            const doc = generatePDF(formData, barang, user?.username || 'Unknown');

            // Simpan PDF dengan nama file yang sesuai
            const fileName = `SJ_${formData.noSurat}_${formData.tanggal}.pdf`;
            doc.save(fileName);

            // Reset form dan tampilkan sukses
            setFormData(defaultFormData);
            setBarang([defaultBarangItem]);
            alert('Data berhasil disimpan dan PDF telah digenerate');

        } catch (error) {
            console.error('Error:', error);
            alert(error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan data');
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Buat Surat Jalan</h1>

            {/* Form Surat Jalan */}
            <div className="bg-white p-4 rounded shadow mb-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-2">No. Surat:</label>
                        <input
                            type="text"
                            name="noSurat"
                            value={formData.noSurat}
                            onChange={handleFormChange}
                            className="w-full border p-2 rounded"
                        />
                    </div>
                    <div>
                        <label className="block mb-2">Tanggal:</label>
                        <input
                            type="date"
                            name="tanggal"
                            value={formData.tanggal}
                            onChange={handleFormChange}
                            className="w-full border p-2 rounded"
                        />
                    </div>
                    <div>
                        <label className="block mb-2">No. PO:</label>
                        <input
                            type="text"
                            name="noPO"
                            value={formData.noPO}
                            onChange={handleFormChange}
                            className="w-full border p-2 rounded"
                        />
                    </div>
                    <div>
                        <label className="block mb-2">No. Kendaraan:</label>
                        <input
                            type="text"
                            name="noKendaraan"
                            value={formData.noKendaraan}
                            onChange={handleFormChange}
                            className="w-full border p-2 rounded"
                        />
                    </div>
                    <div>
                        <label className="block mb-2">Ekspedisi:</label>
                        <input
                            type="text"
                            name="ekspedisi"
                            value={formData.ekspedisi}
                            onChange={handleFormChange}
                            className="w-full border p-2 rounded"
                        />
                    </div>
                </div>
            </div>

            {/* Tabel Barang */}
            <div className="bg-white p-4 rounded shadow mb-4">
                <h2 className="text-xl font-bold mb-4">Data Barang</h2>
                <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2">No</th>
                            <th className="p-2">Jumlah</th>
                            <th className="p-2">Kemasan</th>
                            <th className="p-2">Kode</th>
                            <th className="p-2">Nama Barang</th>
                            <th className="p-2">Keterangan</th>
                            <th className="p-2">Aksi</th>
                        </tr>
                        </thead>
                        <tbody>
                        {barang.map((item, index) => (
                            <tr key={index}>
                                <td className="p-2">{index + 1}</td>
                                <td className="p-2">
                                    <input
                                        type="text"
                                        value={item.jumlah}
                                        onChange={(e) => handleBarangChange(index, 'jumlah', e.target.value)}
                                        className="w-full border p-1 rounded"
                                    />
                                </td>
                                <td className="p-2">
                                    <input
                                        type="text"
                                        value={item.kemasan}
                                        onChange={(e) => handleBarangChange(index, 'kemasan', e.target.value)}
                                        className="w-full border p-1 rounded"
                                    />
                                </td>
                                <td className="p-2">
                                    <input
                                        type="text"
                                        value={item.kode}
                                        onChange={(e) => handleBarangChange(index, 'kode', e.target.value)}
                                        className="w-full border p-1 rounded"
                                    />
                                </td>
                                <td className="p-2">
                                    <input
                                        type="text"
                                        value={item.nama}
                                        onChange={(e) => handleBarangChange(index, 'nama', e.target.value)}
                                        className="w-full border p-1 rounded"
                                    />
                                </td>
                                <td className="p-2">
                                    <input
                                        type="text"
                                        value={item.keterangan}
                                        onChange={(e) => handleBarangChange(index, 'keterangan', e.target.value)}
                                        className="w-full border p-1 rounded"
                                    />
                                </td>
                                <td className="p-2">
                                    <button
                                        onClick={() => removeBarangRow(index)}
                                        className="bg-red-500 text-white px-2 py-1 rounded"
                                        disabled={barang.length === 1}
                                    >
                                        Hapus
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                <button
                    onClick={addBarangRow}
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Tambah Barang
                </button>
            </div>

            {/* Tombol Submit */}
            <button
                onClick={handleGeneratePDF}
                disabled={isLoading}
                className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
            >
                {isLoading ? 'Memproses...' : 'Simpan & Generate PDF'}
            </button>
        </div>
    );
}
