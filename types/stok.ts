export interface Stok {
    id: number;
    kode: string;
    nama: string;
    kategori: 'material' | 'alat' | 'consumable';
    status: 'aman' | 'rusak' | 'cacat' | 'sisa';
    sub_kategori_id: number;
    stok_masuk: number;
    stok_keluar: number;
    stok_sisa: number;
    satuan: string;
    lokasi: string;
    tanggal_entry: string;
    tanggal_masuk: string;
    tanggal_keluar: string | null;
    keterangan: string | null;
    sub_kategori_nama?: string;
    sub_kategori_kode?: string;
}

export interface SortConfig {
    key: keyof Stok | '';
    direction: 'asc' | 'desc';
}

export interface StokFormData {
    kode: string;
    nama: string;
    kategori: string;
    sub_kategori_id: number;
    stok_masuk: number;
    satuan: string;
    lokasi: string;
    tanggal_masuk: string;
    keterangan?: string;
}
