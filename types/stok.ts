// types/stok.ts
export interface ItemStok {
    id: number;
    kode_barang: string;
    nama_barang: string;
    kategori: string;
    merek: string;
    satuan: string;
    jumlah: number;
    stok_minimum: number;
    stok_maksimum: number;
    harga_beli: number;
    harga_jual: number;
    nama_pemasok: string;
    lokasi_gudang: string;
    nomor_rak: string;
    nomor_batch: string;
    tanggal_kadaluarsa: string;
    tanggal_produksi: string;
    jenis: 'masuk' | 'keluar';
    status: 'aktif' | 'nonaktif';
    tanggal: string;
    keterangan?: string;
}
