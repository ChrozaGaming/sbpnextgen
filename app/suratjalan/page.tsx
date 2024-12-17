'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import 'jspdf-autotable';
import { generateMultiCopyPDF } from '@/utils/pdfGenerator';
import DataSuratJalan from "@/components/DataSuratJalan/DataSuratJalan";

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
    tujuan: string;  // Added tujuan field
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
    ekspedisi: '',
    tujuan: ''  // Added tujuan default value
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

            // Validasi form yang lebih detail
            const validateForm = () => {
                if (!formData.noSurat.trim()) throw new Error('Nomor Surat harus diisi');
                if (!formData.tanggal) throw new Error('Tanggal harus diisi');
                if (!formData.noPO.trim()) throw new Error('Nomor PO harus diisi');
                if (!formData.noKendaraan.trim()) throw new Error('Nomor Kendaraan harus diisi');
                if (!formData.ekspedisi.trim()) throw new Error('Ekspedisi harus diisi');
                if (!formData.tujuan.trim()) throw new Error('Tujuan harus diisi');  // Added tujuan validation
            };

            // Validasi barang
            const validateBarang = () => {
                if (!barang.length) throw new Error('Minimal harus ada satu data barang');

                barang.forEach((item, index) => {
                    if (!item.jumlah.trim()) throw new Error(`Jumlah barang baris ${index + 1} harus diisi`);
                    if (!item.kemasan.trim()) throw new Error(`Kemasan barang baris ${index + 1} harus diisi`);
                    if (!item.kode.trim()) throw new Error(`Kode barang baris ${index + 1} harus diisi`);
                    if (!item.nama.trim()) throw new Error(`Nama barang baris ${index + 1} harus diisi`);
                });
            };

            // Jalankan validasi
            validateForm();
            validateBarang();

            if (!user?.id) {
                throw new Error('Sesi login tidak valid. Silakan login ulang.');
            }

            // Konfirmasi
            const isConfirmed = window.confirm('Apakah Anda yakin ingin menyimpan dan generate PDF?');
            if (!isConfirmed) {
                setIsLoading(false);
                return;
            }

            // Persiapkan data untuk dikirim
            const suratJalanData = {
                ...formData,
                user_id: user.id,
                tanggal: new Date(formData.tanggal).toISOString().split('T')[0]
            };

            // Simpan data surat jalan
            const suratJalanResponse = await fetch('/api/suratjalan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                body: JSON.stringify(suratJalanData),
            });

            const suratJalanResult = await suratJalanResponse.json();

            if (!suratJalanResponse.ok) {
                throw new Error(suratJalanResult.error || 'Gagal menyimpan surat jalan');
            }
                p
            // Persiapkan data barang
            const barangData = {
                suratJalanId: suratJalanResult.data.id,
                barang: barang.map((item, index) => ({
                    ...item,
                    no: (index + 1).toString()
                }))
            };

            // Simpan data barang
            const barangResponse = await fetch('/api/barang', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                body: JSON.stringify(barangData),
            });

            const barangResult = await barangResponse.json();

            if (!barangResponse.ok) {
                throw new Error(barangResult.error || 'Gagal menyimpan data barang');
            }

            // Generate PDF
            const doc = generateMultiCopyPDF(formData, barang, user?.username || 'Unknown');

            // Simpan PDF dengan nama file yang sesuai
            const fileName = `SJ_${formData.noSurat}_${formData.tanggal}_MULTI.pdf`;
            doc.save(fileName);

            setFormData(defaultFormData);
            setBarang([defaultBarangItem]);
            alert('Data berhasil disimpan dan PDF dengan 4 copy telah digenerate');

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
                    <div>
                        <label className="block mb-2">Tujuan:</label>
                        <input
                            type="text"
                            name="tujuan"
                            value={formData.tujuan}
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
                className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-400 mb-8"
            >
                {isLoading ? 'Memproses...' : 'Simpan & Generate PDF'}
            </button>

            {/* Tambahkan DataSuratJalan component di sini */}
            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Daftar Surat Jalan</h2>
                <div className="bg-white p-4 rounded shadow">
                    <DataSuratJalan />
                </div>
            </div>
        </div>
    );
}