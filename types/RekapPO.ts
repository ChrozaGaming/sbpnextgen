export interface RekapPO {
    id: number;
    no_po: string;
    judulPO: string;
    tanggal: string;
    status: number;
    progress: 'onprogress' | 'finish';
    nilai_penawaran: number;
    nilai_po: number;
    biaya_pelaksanaan: number;
    profit: number;
    keterangan: string;
    nama_perusahaan: string;
    biaya_material: number;
    biaya_jasa: number;
    biaya_overhead: number;
  }