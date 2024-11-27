// constants/defaultValues.ts
import { BarangItem, FormData } from '@/types/suratJalan';

export const defaultFormData: FormData = {
    noSurat: "",
    tanggal: "",
    noPO: "",
    noKendaraan: "",
    ekspedisi: "",
};

export const defaultBarangItem: BarangItem = {
    jumlah: "",
    kemasan: "",
    kode: "",
    nama: "",
    keterangan: "",
};
