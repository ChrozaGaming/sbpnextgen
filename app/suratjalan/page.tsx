'use client';

import { useEffect, useState } from 'react';
import DataSuratJalan from '@/components/DataSuratJalan'; // Impor komponen daftar surat jalan

interface Barang {
    id: number;
    kode: string;
    nama: string;
    kategori: string;
    satuan: string;
    stok_sisa: number;
}

interface SelectedBarang extends Barang {
    jumlah: number;
}

const SuratJalanPage = () => {
    const [stok, setStok] = useState<Barang[]>([]);
    const [filteredStok, setFilteredStok] = useState<Barang[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBarang, setSelectedBarang] = useState<SelectedBarang[]>([]);
    const [form, setForm] = useState({
        tujuan: '',
        nomorSurat: '',
        tanggal: '',
        nomorKendaraan: '',
        noPo: '',
        keteranganProyek: '',
    });
    const [currentBarang, setCurrentBarang] = useState<SelectedBarang>({
        id: 0,
        kode: '',
        nama: '',
        kategori: '',
        satuan: '',
        jumlah: 1,
        stok_sisa: 0,
    });

    // Fetch data stok
    useEffect(() => {
        const fetchStok = async () => {
            try {
                const response = await fetch('/api/stok');
                if (!response.ok) throw new Error('Failed to fetch stok');

                const data = await response.json();
                if (data.success) {
                    setStok(data.data);
                    setFilteredStok(data.data); // Inisialisasi filtered stok
                } else {
                    console.error('Failed to fetch stok:', data.message);
                }
            } catch (error) {
                console.error('Error fetching stok:', error);
            }
        };
        fetchStok();
    }, []);

    // Debounce search query
    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchQuery.trim()) {
                const filtered = stok.filter(
                    (item) =>
                        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.kode.toLowerCase().includes(searchQuery.toLowerCase())
                );
                setFilteredStok(filtered);
            } else {
                setFilteredStok(stok);
            }
        }, 300); // Delay 300ms

        return () => clearTimeout(handler); // Clear timeout jika query berubah sebelum waktu selesai
    }, [searchQuery, stok]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSelectBarang = (item: Barang) => {
        setCurrentBarang({
            ...item,
            jumlah: 1,
        });
        setSearchQuery(`${item.nama} (${item.kode})`); // Isi ulang input dengan label barang yang dipilih
    };

    const addBarang = () => {
        if (currentBarang.id !== 0) {
            const stokBarang = stok.find((item) => item.id === currentBarang.id);
            if (stokBarang && stokBarang.stok_sisa < currentBarang.jumlah) {
                alert(`Stok barang tidak mencukupi. Sisa stok: ${stokBarang.stok_sisa}`);
                return;
            }

            const isDuplicate = selectedBarang.some((item) => item.id === currentBarang.id);

            if (isDuplicate) {
                alert('Barang ini sudah ada di daftar.');
                return;
            }

            setSelectedBarang((prev) => [...prev, currentBarang]);
            setCurrentBarang({
                id: 0,
                kode: '',
                nama: '',
                kategori: '',
                satuan: '',
                jumlah: 1,
                stok_sisa: 0,
            });
        }
    };

    const removeBarang = (id: number) => {
        setSelectedBarang((prev) => prev.filter((item) => item.id !== id));
    };

    const resetBarang = () => {
        setSelectedBarang([]);
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch('/api/suratjalan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    barang: selectedBarang,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(`Gagal membuat Surat Jalan: ${data.message}`);
                return;
            }

            if (data.success) {
                alert('Surat Jalan berhasil dibuat!');
                setForm({
                    tujuan: '',
                    nomorSurat: '',
                    tanggal: '',
                    nomorKendaraan: '',
                    noPo: '',
                    keteranganProyek: '',
                });
                setSelectedBarang([]);
            }
        } catch (error) {
            console.error('Error submitting surat jalan:', error);
            alert('Gagal membuat Surat Jalan');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-5 bg-gray-50 shadow-md rounded-lg">
            <h1 className="text-2xl font-bold text-center mb-6">Buat Surat Jalan</h1>
            <form className="space-y-4">
                {/* Form Input */}
                <div className="flex flex-col space-y-2">
                    <h3 className="font-semibold">Pilih Barang</h3>
                    <div className="relative">
                        {/* Search Input */}
                        <input
                            type="text"
                            placeholder="Cari barang berdasarkan nama atau kode..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border rounded-md p-2 w-full"
                        />
                        {/* Suggestion Dropdown */}
                        {searchQuery && filteredStok.length > 0 && (
                            <ul className="absolute z-10 bg-white border rounded-md shadow-md w-full max-h-48 overflow-auto">
                                {filteredStok.map((item) => (
                                    <li
                                        key={item.id}
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => handleSelectBarang(item)}
                                    >
                                        {item.nama} ({item.kode})
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    {/* Input Jumlah */}
                    <div className="flex items-center space-x-4">
                        <input
                            type="text" // Gunakan text untuk kontrol penuh
                            inputMode="decimal" // Memunculkan keyboard angka dengan tanda koma pada perangkat sentuh
                            pattern="[0-9]*[.,]?[0-9]*" // Validasi angka dan desimal
                            placeholder="Jumlah (gunakan koma untuk desimal)"
                            value={currentBarang.jumlah !== 0 ? currentBarang.jumlah.toString().replace('.', ',') : ''}
                            onChange={(e) => {
                                const input = e.target.value;
                                const isValid = /^[0-9]*[.,]?[0-9]*$/.test(input);
                                if (!isValid) return;
                                const jumlah = parseFloat(input.replace(',', '.'));
                                setCurrentBarang({
                                    ...currentBarang,
                                    jumlah: !isNaN(jumlah) ? jumlah : 0,
                                });
                            }}
                            className="border rounded-md p-2 w-1/4"
                        />
                        <button
                            type="button"
                            onClick={addBarang}
                            className="bg-blue-500 text-white px-4 py-2 rounded-md"
                        >
                            Tambah Barang
                        </button>
                    </div>
                </div>

                {/* Daftar barang yang ditambahkan */}
                <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-4">Daftar Barang</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                            <tr className="bg-gray-200">
                                <th className="border border-gray-300 px-4 py-2">No</th>
                                <th className="border border-gray-300 px-4 py-2">Kode</th>
                                <th className="border border-gray-300 px-4 py-2">Nama</th>
                                <th className="border border-gray-300 px-4 py-2">Kategori</th>
                                <th className="border border-gray-300 px-4 py-2">Satuan</th>
                                <th className="border border-gray-300 px-4 py-2">Jumlah</th>
                                <th className="border border-gray-300 px-4 py-2">Stok Sisa</th>
                                <th className="border border-gray-300 px-4 py-2">Aksi</th>
                            </tr>
                            </thead>
                            <tbody>
                            {selectedBarang.map((item, index) => (
                                <tr key={item.id} className="text-center">
                                    <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                                    <td className="border border-gray-300 px-4 py-2">{item.kode}</td>
                                    <td className="border border-gray-300 px-4 py-2">{item.nama}</td>
                                    <td className="border border-gray-300 px-4 py-2">{item.kategori}</td>
                                    <td className="border border-gray-300 px-4 py-2">{item.satuan}</td>
                                    <td className="border border-gray-300 px-4 py-2">{item.jumlah}</td>
                                    <td className="border border-gray-300 px-4 py-2">{item.stok_sisa}</td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        <button
                                            onClick={() => removeBarang(item.id)}
                                            className="text-red-500 hover:underline"
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
                        type="button"
                        onClick={resetBarang}
                        className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md"
                    >
                        Reset Barang
                    </button>
                </div>

                <button
                    type="button"
                    className="w-full bg-green-500 text-white px-4 py-2 rounded-md mt-6"
                    onClick={handleSubmit}
                >
                    Simpan Surat Jalan
                </button>
            </form>

            {/* Komponen DataSuratJalan */}
            <DataSuratJalan />
        </div>
    );
};

export default SuratJalanPage;
