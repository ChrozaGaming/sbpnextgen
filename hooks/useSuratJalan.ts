// hooks/useSuratJalan.ts
import { useState } from 'react';
import { FormData, BarangItem } from '@/types/suratJalan';

export const useSuratJalan = () => {
    const defaultFormData: FormData = {
        noSurat: "",
        tanggal: "",
        noPO: "",
        noKendaraan: "",
        ekspedisi: "",
    };

    const defaultBarangItem: BarangItem = {
        no: "",
        jumlah: "",
        kemasan: "",
        kode: "",
        nama: "",
        keterangan: "",
    };

    const [formData, setFormData] = useState<FormData>(defaultFormData);
    const [barang, setBarang] = useState<BarangItem[]>([defaultBarangItem]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleBarangChange = (
        index: number,
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;
        const updatedBarang = [...barang];
        updatedBarang[index] = {
            ...updatedBarang[index],
            [name]: value,
        };
        setBarang(updatedBarang);
    };

    const handleAddBarang = () => {
        setBarang([...barang, { ...defaultBarangItem }]);
    };

    const handleRemoveBarang = (index: number) => {
        if (barang.length > 1) {
            const newBarang = barang.filter((_, idx) => idx !== index);
            setBarang(newBarang);
        }
    };

    const handleReset = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (window.confirm("Apakah Anda yakin ingin mereset semua data?")) {
            setFormData(defaultFormData);
            setBarang([defaultBarangItem]);
        }
    };

    return {
        formData,
        barang,
        handleInputChange,
        handleBarangChange,
        handleAddBarang,
        handleRemoveBarang,
        handleReset,
    };
};
