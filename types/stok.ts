// types/stok.ts
export interface Stok {
    id: number;
    kode: string;
    nama: string;
    kategori: 'material' | 'alat' | 'consumable';
    sub_kategori_id: number;
    stok_masuk: number;
    stok_keluar: number;
    stok_sisa: number;
    satuan: 'kg' | 'kgset' | 'pail' | 'galon5liter' | 'galon10liter' | 'pcs' | 'lonjor' | 'liter' | 'literset' | 'sak' | 'unit';
    lokasi: string;
    tanggal_entry: string;
    tanggal_masuk: string;
    tanggal_keluar: string | null;
    keterangan: string | null;
    created_at: string;
    updated_at: string;
    sub_kategori_nama?: string;
    sub_kategori_kode?: string;
}

export interface StokResponse {
    success: boolean;
    data: Stok[];
    pagination?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    message?: string;
}
