// components/stokgudang/StokMasuk/TambahStokMasuk.tsx
'use client';

import { useState, useEffect } from 'react';
import { Form, Input, Select, InputNumber, DatePicker, Button, message } from 'antd';
import dayjs from 'dayjs';

interface SubKategori {
    id: number;
    kategori_id: number;
    kode_item: string;
    nama: string;
    brand: string | null;
    status: string;
    keterangan: string | null;
    stok_tersedia: number;
    kategori: string;
    satuan: string;
}

interface StokMasukForm {
    kode: string;
    nama: string;
    kategori: 'material' | 'alat' | 'consumable';
    sub_kategori_id: number;
    stok_masuk: number;
    satuan: 'kg' | 'kgset' | 'pail' | 'galon5liter' | 'galon10liter' | 'pcs' | 'lonjor' | 'liter' | 'literset' | 'sak' | 'unit';
    lokasi: string;
    tanggal_masuk: string;
    keterangan?: string;
}

const TambahStokMasuk = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [subKategoriList, setSubKategoriList] = useState<SubKategori[]>([]);
    const [selectedKategori, setSelectedKategori] = useState<string>('');

    const kategoriOptions = [
        { value: 'material', label: 'Material' },
        { value: 'alat', label: 'Alat' },
        { value: 'consumable', label: 'Consumable' }
    ];

    const satuanOptions = [
        { value: 'kg', label: 'Kilogram (kg)' },
        { value: 'kgset', label: 'Kilogram Set' },
        { value: 'pail', label: 'Pail' },
        { value: 'galon5liter', label: 'Galon 5 Liter' },
        { value: 'galon10liter', label: 'Galon 10 Liter' },
        { value: 'pcs', label: 'Pieces (pcs)' },
        { value: 'lonjor', label: 'Lonjor' },
        { value: 'liter', label: 'Liter' },
        { value: 'literset', label: 'Liter Set' },
        { value: 'sak', label: 'Sak' },
        { value: 'unit', label: 'Unit' }
    ];

    // Helper function untuk mendapatkan satuan default
    const getDefaultSatuan = (kategori: string): string => {
        switch (kategori) {
            case 'material':
                return 'kg';
            case 'alat':
                return 'unit';
            case 'consumable':
                return 'pcs';
            default:
                return 'pcs';
        }
    };

    // Effect untuk me-reset form saat kategori berubah
    useEffect(() => {
        if (selectedKategori) {
            form.setFieldsValue({
                sub_kategori_id: undefined,
                satuan: getDefaultSatuan(selectedKategori)
            });
        }
    }, [selectedKategori, form]);

    const handleSubKategoriChange = (value: number) => {
        const selectedItem = subKategoriList.find(item => item.id === value);

        if (selectedItem) {
            console.log('Selected Item:', selectedItem);
            console.log('Selected Item Satuan:', selectedItem.satuan);

            setTimeout(() => {
                const formValues = {
                    nama: selectedItem.nama,
                    satuan: selectedItem.satuan || getDefaultSatuan(selectedItem.kategori)
                };

                console.log('Setting form values:', formValues);
                form.setFieldsValue(formValues);
                console.log('Form values after set:', form.getFieldsValue());
            }, 100);
        }
    };

    const fetchSubKategori = async (kategori: string) => {
        try {
            const response = await fetch('/api/stokgudang/sub-kategori', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ kategori })
            });

            if (!response.ok) throw new Error('Network response was not ok');
            const result = await response.json();

            console.log('API Response:', result);

            if (result.success && Array.isArray(result.data)) {
                setSubKategoriList(result.data);
            } else {
                throw new Error(result.message || 'Data tidak valid');
            }
        } catch (error) {
            console.error('Error:', error);
            message.error('Gagal mengambil data sub kategori');
        }
    };

    const handleKategoriChange = (value: string) => {
        setSelectedKategori(value);
        form.setFieldsValue({
            sub_kategori_id: undefined,
            satuan: getDefaultSatuan(value)
        });
        fetchSubKategori(value);
    };

    const generateKode = (kategori: string) => {
        const today = dayjs();
        const year = today.format('YYYY');
        const prefix = 'STK';
        const kategoriCode = kategori.substring(0, 3).toUpperCase();
        return `${prefix}/${kategoriCode}/${year}/`;
    };

    const onFinish = async (values: StokMasukForm) => {
        try {
            setLoading(true);

            const stokData = {
                ...values,
                tanggal_entry: dayjs().format('YYYY-MM-DD'),
                tanggal_masuk: dayjs(values.tanggal_masuk).format('YYYY-MM-DD'),
                stok_sisa: values.stok_masuk,
                stok_keluar: 0
            };

            const response = await fetch('/api/stokgudang/stok-masuk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(stokData)
            });

            if (!response.ok) throw new Error('Network response was not ok');
            const result = await response.json();

            if (result.success) {
                message.success('Stok berhasil ditambahkan');
                form.resetFields();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            message.error('Gagal menambahkan stok');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h2 className="text-lg font-semibold mb-4">Tambah Stok Masuk</h2>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                    tanggal_masuk: dayjs()
                }}
            >
                <Form.Item
                    name="kategori"
                    label="Kategori"
                    rules={[{ required: true, message: 'Pilih kategori' }]}
                >
                    <Select
                        placeholder="Pilih kategori"
                        onChange={handleKategoriChange}
                        options={kategoriOptions}
                    />
                </Form.Item>

                <Form.Item
                    name="sub_kategori_id"
                    label="Item"
                    rules={[{ required: true, message: 'Pilih item' }]}
                >
                    <Select
                        placeholder="Pilih item"
                        disabled={!selectedKategori}
                        onChange={handleSubKategoriChange}
                        options={subKategoriList.map(item => ({
                            value: item.id,
                            label: `${item.nama} (${item.kode_item})`
                        }))}
                        notFoundContent={subKategoriList.length === 0 ? "Tidak ada data" : null}
                    />
                </Form.Item>

                <Form.Item
                    name="kode"
                    label="Kode Stok"
                    rules={[{ required: true, message: 'Masukkan kode stok' }]}
                >
                    <Input
                        placeholder="Masukkan kode stok"
                        addonBefore={selectedKategori ? generateKode(selectedKategori) : 'STK/'}
                    />
                </Form.Item>

                <Form.Item
                    name="stok_masuk"
                    label="Jumlah Stok Masuk"
                    rules={[{ required: true, message: 'Masukkan jumlah stok' }]}
                >
                    <InputNumber
                        min={1}
                        placeholder="Masukkan jumlah"
                        style={{ width: '100%' }}
                    />
                </Form.Item>

                <Form.Item
                    name="satuan"
                    label="Satuan"
                    rules={[{ required: true, message: 'Pilih satuan' }]}
                    initialValue={getDefaultSatuan(selectedKategori)}
                >
                    <Select
                        placeholder="Pilih satuan"
                        options={satuanOptions}
                        disabled={!selectedKategori}
                    />
                </Form.Item>

                <Form.Item
                    name="lokasi"
                    label="Lokasi"
                    rules={[{ required: false, message: 'Masukkan lokasi' }]}
                >
                    <Input placeholder="Masukkan lokasi (contoh: RAK-A1)" />
                </Form.Item>

                <Form.Item
                    name="tanggal_masuk"
                    label="Tanggal Masuk"
                    rules={[{ required: true, message: 'Pilih tanggal masuk' }]}
                >
                    <DatePicker
                        style={{ width: '100%' }}
                        format="YYYY-MM-DD"
                    />
                </Form.Item>

                <Form.Item
                    name="keterangan"
                    label="Keterangan"
                >
                    <Input.TextArea
                        placeholder="Masukkan keterangan (opsional)"
                        rows={3}
                    />
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        block
                    >
                        Simpan Stok Masuk
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default TambahStokMasuk;
