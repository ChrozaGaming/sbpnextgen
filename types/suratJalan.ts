interface FormData {
    noSurat: string;
    tanggal: string;
    noPO: string;
    noKendaraan: string;
    ekspedisi: string;
    tujuan: string;  // Add this line
}

export interface BarangItem {
    no?: string;
    jumlah: string;
    kemasan: string;
    kode: string;
    nama: string;
    keterangan: string;
}