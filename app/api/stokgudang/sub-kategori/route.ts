// app/api/stokgudang/sub-kategori/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { kategori_id, kode_item, nama, brand, satuan, status, keterangan } = body;

        // Validasi input
        if (!kategori_id || !kode_item || !nama || !satuan) {
            return NextResponse.json(
                { success: false, message: 'Kategori, kode item, nama, dan satuan wajib diisi' },
                { status: 400 }
            );
        }

        // Cek apakah kode_item sudah ada
        const [existing] = await db.execute<RowDataPacket[]>(
            'SELECT id FROM sub_kategori_material WHERE kode_item = ?',
            [kode_item]
        );

        if (Array.isArray(existing) && existing.length > 0) {
            return NextResponse.json(
                { success: false, message: 'Kode item sudah digunakan' },
                { status: 400 }
            );
        }

        // Insert ke database
        const [result] = await db.execute<ResultSetHeader>(
            `INSERT INTO sub_kategori_material (
                kategori_id, kode_item, nama, brand, satuan, status, keterangan
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [kategori_id, kode_item, nama, brand || null, satuan, status || 'aman', keterangan || null]
        );

        return NextResponse.json({
            success: true,
            message: 'Sub kategori berhasil ditambahkan',
            data: { id: result.insertId }
        });

    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Terjadi kesalahan server',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// GET method untuk mendapatkan sub kategori berdasarkan kategori
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const kategori = searchParams.get('kategori');

        if (!kategori) {
            return NextResponse.json(
                { success: false, message: 'Parameter kategori diperlukan' },
                { status: 400 }
            );
        }

        const kategoriMap: { [key: string]: number } = {
            'material': 1,
            'alat': 2,
            'consumable': 3
        };

        const kategoriId = kategoriMap[kategori];

        const [rows] = await db.execute<RowDataPacket[]>(
            `SELECT * FROM sub_kategori_material WHERE kategori_id = ? ORDER BY nama ASC`,
            [kategoriId]
        );

        return NextResponse.json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { success: false, message: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}

// PUT method untuk update sub kategori
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, kode_item, nama, brand, satuan, status, keterangan } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'ID diperlukan untuk update' },
                { status: 400 }
            );
        }

        const [result] = await db.execute(
            `UPDATE sub_kategori_material 
            SET 
                kode_item = ?,
                nama = ?,
                brand = ?,
                satuan = ?,
                status = ?,
                keterangan = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
            [kode_item, nama, brand || null, satuan, status || 'aman', keterangan || null, id]
        );

        return NextResponse.json({
            success: true,
            message: 'Sub kategori berhasil diperbarui'
        });

    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { success: false, message: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}

// DELETE method tetap sama
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'ID diperlukan untuk menghapus' },
                { status: 400 }
            );
        }

        await db.execute('DELETE FROM sub_kategori_material WHERE id = ?', [id]);

        return NextResponse.json({
            success: true,
            message: 'Sub kategori berhasil dihapus'
        });

    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { success: false, message: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}