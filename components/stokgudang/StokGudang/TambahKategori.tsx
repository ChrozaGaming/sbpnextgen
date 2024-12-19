'use client';

import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Table, Space, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface SubKategori {
    id: number;
    kategori_id: number;
    kode_item: string;
    nama: string;
    brand: string | null;
    status: string;
    keterangan: string | null;
    stok_tersedia: number;
    satuan: string;
}

const TambahKategori: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [subKategoris, setSubKategoris] = useState<SubKategori[]>([]);
    const [selectedKategori, setSelectedKategori] = useState<string>('material');

    const kategoriOptions = [
        { value: 'material', label: 'Material' },
        { value: 'alat', label: 'Alat' },
        { value: 'consumable', label: 'Consumable' }
    ];

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/stokgudang/sub-kategori', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ kategori: selectedKategori })
            });

            const result = await response.json();
            if (result.success) {
                setSubKategoris(result.data);
            } else {
                message.error(result.message || 'Gagal memuat data');
            }
        } catch (error) {
            console.error('Error:', error);
            message.error('Gagal memuat data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedKategori]);

    const handleKategoriChange = (value: string) => {
        setSelectedKategori(value);
        form.resetFields(['kode_item', 'nama', 'brand']); // Reset specific fields only
    };

    const onFinish = async (values: any) => {
        try {
            setLoading(true);
            const payload = {
                ...values,
                kategori_id: kategoriOptions.findIndex(k => k.value === selectedKategori) + 1,
                status: 'aman' // default status
            };

            const response = await fetch('/api/stokgudang/sub-kategori', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (result.success) {
                message.success('Data berhasil ditambahkan');
                form.resetFields(['kode_item', 'nama', 'brand']);
                fetchData();
            } else {
                throw new Error(result.message || 'Gagal menambahkan data');
            }
        } catch (error) {
            console.error('Error:', error);
            message.error(error instanceof Error ? error.message : 'Gagal menambahkan data');
        } finally {
            setLoading(false);
        }
    };

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
        message.error('Mohon lengkapi semua field yang diperlukan');
    };

    const columns: ColumnsType<SubKategori> = [
        {
            title: 'Kode Item',
            dataIndex: 'kode_item',
            key: 'kode_item',
        },
        {
            title: 'Nama',
            dataIndex: 'nama',
            key: 'nama',
        },
        {
            title: 'Brand',
            dataIndex: 'brand',
            key: 'brand',
            render: (text) => text || '-'
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
        },
        {
            title: 'Stok',
            dataIndex: 'stok_tersedia',
            key: 'stok_tersedia',
            render: (text, record) => `${text} ${record.satuan}`
        },
        {
            title: 'Aksi',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="link" onClick={() => handleEdit(record)}>
                        Edit
                    </Button>
                    <Button type="link" danger onClick={() => handleDelete(record.id)}>
                        Hapus
                    </Button>
                </Space>
            ),
        },
    ];

    const handleEdit = (record: SubKategori) => {
        // Implementasi edit
        console.log('Edit:', record);
    };

    const handleDelete = async (id: number) => {
        try {
            const response = await fetch(`/api/stokgudang/sub-kategori?id=${id}`, {
                method: 'DELETE'
            });

            const result = await response.json();
            if (result.success) {
                message.success('Data berhasil dihapus');
                fetchData();
            } else {
                throw new Error(result.message || 'Gagal menghapus data');
            }
        } catch (error) {
            console.error('Error:', error);
            message.error(error instanceof Error ? error.message : 'Gagal menghapus data');
        }
    };

    return (
        <div className="p-6">
            <Form
                form={form}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                layout="vertical"
                initialValues={{ kategori: selectedKategori }}
            >
                <div className="mb-6 flex gap-4">
                    <Form.Item
                        className="w-48"
                        label="Kategori"
                        name="kategori"
                    >
                        <Select
                            options={kategoriOptions}
                            onChange={handleKategoriChange}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Kode Item"
                        name="kode_item"
                        rules={[{ required: true, message: 'Masukkan kode item' }]}
                    >
                        <Input placeholder="Masukkan kode item" />
                    </Form.Item>

                    <Form.Item
                        label="Nama"
                        name="nama"
                        rules={[{ required: true, message: 'Masukkan nama' }]}
                    >
                        <Input placeholder="Masukkan nama" />
                    </Form.Item>

                    <Form.Item
                        label="Brand"
                        name="brand"
                    >
                        <Input placeholder="Masukkan brand" />
                    </Form.Item>

                    <Form.Item className="flex items-end">
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            disabled={loading}
                        >
                            Tambah
                        </Button>
                    </Form.Item>
                </div>
            </Form>

            <Table
                columns={columns}
                dataSource={subKategoris}
                loading={loading}
                rowKey="id"
                pagination={{ pageSize: 10 }}
            />
        </div>
    );
};

export default TambahKategori;
