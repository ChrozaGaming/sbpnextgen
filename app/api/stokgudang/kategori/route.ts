// app/api/stokgudang/kategori/route.ts

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

interface SubKategoriMaterial extends RowDataPacket {
    id: number;
    kategori_id: number;
    kode_item: string;
    nama: string;
    brand: string | null;
    status: 'aman' | 'rusak' | 'cacat' | 'sisa';
    keterangan: string | null;
    created_at: Date;
    updated_at: Date;
}

// GET: Mengambil semua data kategori
export async function GET() {
    try {
        const [kategoris] = await db.execute<SubKategoriMaterial[]>(
            `SELECT skm.*, COUNT(s.id) as item_count
             FROM sub_kategori_material skm
             LEFT JOIN stok s ON skm.id = s.sub_kategori_id
             GROUP BY skm.id
             ORDER BY skm.kode_item ASC`
        );

        return NextResponse.json({
            message: 'Data kategori berhasil dimuat',
            success: true,
            data: kategoris
        }, { status: 200 });

    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({
            message: 'Gagal memuat data kategori',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// POST: Menambah kategori baru
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { kategori, kode_item, nama, brand, status, keterangan } = body;

        // Validasi input
        if (!kategori || !kode_item || !nama) {
            return NextResponse.json({
                message: 'Kategori, kode item, dan nama harus diisi',
                success: false
            }, { status: 400 });
        }

        // Cek duplikasi kode_item
        const [existing] = await db.execute<SubKategoriMaterial[]>(
            'SELECT id FROM sub_kategori_material WHERE kode_item = ?',
            [kode_item]
        );

        if (existing.length > 0) {
            return NextResponse.json({
                message: 'Kode item sudah digunakan',
                success: false
            }, { status: 409 });
        }

        // Insert ke sub_kategori_material
        const [result] = await db.execute(
            `INSERT INTO sub_kategori_material 
             (kategori_id, kode_item, nama, brand, status, keterangan) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                kategori === 'material' ? 1 : kategori === 'alat' ? 2 : 3, // Map kategori ke ID
                kode_item,
                nama,
                brand || null,
                status || 'aman',
                keterangan || null
            ]
        );

        return NextResponse.json({
            message: 'Kategori berhasil ditambahkan',
            success: true,
            data: result
        }, { status: 201 });

    } catch (error) {
        console.error('Error adding category:', error);
        return NextResponse.json({
            message: 'Gagal menambahkan kategori',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// PUT: Mengupdate kategori
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, kategori, kode_item, nama, brand, status, keterangan } = body;

        // Validasi input
        if (!id || !kategori || !kode_item || !nama) {
            return NextResponse.json({
                message: 'ID, kategori, kode item, dan nama harus diisi',
                success: false
            }, { status: 400 });
        }

        // Cek apakah kategori exists
        const [existing] = await db.execute<SubKategoriMaterial[]>(
            'SELECT id FROM sub_kategori_material WHERE id = ?',
            [id]
        );

        if (!existing.length) {
            return NextResponse.json({
                message: 'Kategori tidak ditemukan',
                success: false
            }, { status: 404 });
        }

        // Cek duplikasi kode_item untuk id yang berbeda
        const [duplicate] = await db.execute<SubKategoriMaterial[]>(
            'SELECT id FROM sub_kategori_material WHERE kode_item = ? AND id != ?',
            [kode_item, id]
        );

        if (duplicate.length > 0) {
            return NextResponse.json({
                message: 'Kode item sudah digunakan',
                success: false
            }, { status: 409 });
        }

        // Update kategori
        const [result] = await db.execute(
            `UPDATE sub_kategori_material 
             SET kategori_id = ?, kode_item = ?, nama = ?, brand = ?, 
                 status = ?, keterangan = ?, updated_at = CURRENT_TIMESTAMP 
             WHERE id = ?`,
            [
                kategori === 'material' ? 1 : kategori === 'alat' ? 2 : 3,
                kode_item,
                nama,
                brand || null,
                status || 'aman',
                keterangan || null,
                id
            ]
        );

        return NextResponse.json({
            message: 'Kategori berhasil diperbarui',
            success: true,
            data: result
        }, { status: 200 });

    } catch (error) {
        console.error('Error updating category:', error);
        return NextResponse.json({
            message: 'Gagal memperbarui kategori',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// DELETE: Menghapus kategori
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({
                message: 'ID kategori harus disertakan',
                success: false
            }, { status: 400 });
        }

        // Cek apakah kategori digunakan di tabel stok
        const [usedInStok] = await db.execute<RowDataPacket[]>(
            'SELECT id FROM stok WHERE sub_kategori_id = ? LIMIT 1',
            [id]
        );

        if (usedInStok.length > 0) {
            return NextResponse.json({
                message: 'Kategori tidak dapat dihapus karena masih digunakan dalam stok',
                success: false
            }, { status: 409 });
        }

        // Hapus kategori
        const [result] = await db.execute(
            'DELETE FROM sub_kategori_material WHERE id = ?',
            [id]
        );

        return NextResponse.json({
            message: 'Kategori berhasil dihapus',
            success: true,
            data: result
        }, { status: 200 });

    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json({
            message: 'Gagal menghapus kategori',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// Konfigurasi API
export const config = {
    api: {
        bodyParser: true,
        externalResolver: true,
    },
};
