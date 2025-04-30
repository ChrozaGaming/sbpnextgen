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
    tanggal: new Date().toISOString().slice(0, 10), // Format YYYY-MM-DD
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
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

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
    
    // Hapus error untuk field ini jika ada
    if (formErrors[name]) {
      const newErrors = { ...formErrors };
      delete newErrors[name];
      setFormErrors(newErrors);
    }
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
      setSearchQuery(''); // Bersihkan search input
    }
  };

  const removeBarang = (id: number) => {
    setSelectedBarang((prev) => prev.filter((item) => item.id !== id));
  };

  const resetBarang = () => {
    setSelectedBarang([]);
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!form.tujuan.trim()) {
      errors.tujuan = 'Tujuan wajib diisi';
    }
    
    if (!form.nomorSurat.trim()) {
      errors.nomorSurat = 'Nomor Surat wajib diisi';
    }
    
    if (!form.tanggal) {
      errors.tanggal = 'Tanggal wajib diisi';
    }
    
    if (selectedBarang.length === 0) {
      errors.barang = 'Minimal satu barang harus ditambahkan';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      alert('Mohon lengkapi formulir sebelum menyimpan');
      return;
    }
    
    try {
      const barangData = selectedBarang.map(item => ({
        kode: item.kode,
        nama: item.nama,
        jumlah: item.jumlah,
        satuan: item.satuan,
        berat: null
      }));
      
      const response = await fetch('/api/suratjalan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tujuan: form.tujuan,
          nomorSurat: form.nomorSurat,
          tanggal: form.tanggal,
          nomorKendaraan: form.nomorKendaraan,
          noPo: form.noPo,
          keteranganProyek: form.keteranganProyek,
          barang: barangData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Gagal membuat Surat Jalan: ${data.message}`);
        console.error('API Response:', data);
        return;
      }

      if (data.success) {
        alert('Surat Jalan berhasil dibuat!');
        setForm({
          tujuan: '',
          nomorSurat: '',
          tanggal: new Date().toISOString().slice(0, 10),
          nomorKendaraan: '',
          noPo: '',
          keteranganProyek: '',
        });
        setSelectedBarang([]);
        // Refresh data surat jalan jika diperlukan
        window.location.reload();
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
        {/* Form Data Surat Jalan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tujuan <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="tujuan"
              value={form.tujuan}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border ${formErrors.tujuan ? 'border-red-500' : 'border-gray-300'} shadow-sm p-2`}
              placeholder="Masukkan tujuan"
            />
            {formErrors.tujuan && (
              <p className="mt-1 text-sm text-red-500">{formErrors.tujuan}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nomor Surat <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="nomorSurat"
              value={form.nomorSurat}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border ${formErrors.nomorSurat ? 'border-red-500' : 'border-gray-300'} shadow-sm p-2`}
              placeholder="Masukkan nomor surat"
            />
            {formErrors.nomorSurat && (
              <p className="mt-1 text-sm text-red-500">{formErrors.nomorSurat}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tanggal <span className="text-red-500">*</span></label>
            <input
              type="date"
              name="tanggal"
              value={form.tanggal}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border ${formErrors.tanggal ? 'border-red-500' : 'border-gray-300'} shadow-sm p-2`}
            />
            {formErrors.tanggal && (
              <p className="mt-1 text-sm text-red-500">{formErrors.tanggal}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nomor Kendaraan</label>
            <input
              type="text"
              name="nomorKendaraan"
              value={form.nomorKendaraan}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
              placeholder="Masukkan nomor kendaraan"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">No PO</label>
            <input
              type="text"
              name="noPo"
              value={form.noPo}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
              placeholder="Masukkan nomor PO"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Keterangan Proyek</label>
            <input
              type="text"
              name="keteranganProyek"
              value={form.keteranganProyek}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
              placeholder="Masukkan keterangan proyek"
            />
          </div>
        </div>

        {/* Divider */}
        <hr className="my-6" />

        {/* Form Pemilihan Barang */}
        <div className="flex flex-col space-y-2">
          <h3 className="font-semibold">Pilih Barang <span className="text-red-500">*</span></h3>
          <div className="relative">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Cari barang berdasarkan nama atau kode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`border ${formErrors.barang ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 w-full`}
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
          {formErrors.barang && (
            <p className="mt-1 text-sm text-red-500">{formErrors.barang}</p>
          )}
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
              disabled={currentBarang.id === 0}
            >
              Tambah Barang
            </button>
          </div>
        </div>

        {/* Daftar barang yang ditambahkan */}
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">Daftar Barang</h3>
          <div className="overflow-x-auto">
            {selectedBarang.length > 0 ? (
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
                          type="button"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center p-4 bg-gray-100 rounded-md">
                Belum ada barang yang ditambahkan
              </div>
            )}
          </div>
          {selectedBarang.length > 0 && (
            <button
              type="button"
              onClick={resetBarang}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md"
            >
              Reset Barang
            </button>
          )}
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
      <div className="mt-10">
        <DataSuratJalan />
      </div>
    </div>
  );
};

export default SuratJalanPage;
