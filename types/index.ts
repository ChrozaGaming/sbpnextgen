// types/index.ts
export interface SubKategori {
    id?: number;
    kategori_id: number;
    kode_item: string;
    nama: string;
    brand?: string | null;
    status: 'aman' | 'rusak' | 'cacat' | 'sisa';
    keterangan?: string | null;
    created_at?: string;
    updated_at?: string;
}
