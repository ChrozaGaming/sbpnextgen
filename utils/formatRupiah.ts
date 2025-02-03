// File: src/utils/formatRupiah.ts

export const formatRupiah = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

export const parseRupiah = (rupiah: string): number => {
    // Menghapus semua karakter yang bukan angka dan mengonversinya menjadi number
    return Number(rupiah.replace(/[^0-9]/g, ''));
};
