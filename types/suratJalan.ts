export interface FormData {
    noSurat: string;
    tanggal: string;
    noPO: string;
    noKendaraan: string;
    ekspedisi: string;
}

export interface BarangItem {
    no?: string;  // tambahkan tanda ? untuk membuat opsional
    jumlah: string;
    kemasan: string;
    kode: string;
    nama: string;
    keterangan: string;
}
