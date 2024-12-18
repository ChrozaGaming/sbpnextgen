// app/api/stokgudang/stok-masuk/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Mulai transaksi
        await db.beginTransaction();

        try {
            // Insert ke tabel stok
            const [result] = await db.query(
                `INSERT INTO stok (
                    kode, nama, kategori, sub_kategori_id,
                    stok_masuk, stok_keluar, stok_sisa,
                    satuan, lokasi, tanggal_entry,
                    tanggal_masuk, keterangan
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    data.kode,
                    data.nama,
                    data.kategori,
                    data.sub_kategori_id,
                    data.stok_masuk,
                    data.stok_keluar,
                    data.stok_sisa,
                    data.satuan,
                    data.lokasi,
                    data.tanggal_entry,
                    data.tanggal_masuk,
                    data.keterangan || null
                ]
            );

            // Commit transaksi
            await db.commit();

            return NextResponse.json({
                success: true,
                message: 'Stok berhasil ditambahkan',
                data: result
            });

        } catch (error) {
            // Rollback jika terjadi error
            await db.rollback();
            throw error;
        }

    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Gagal menambahkan stok',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
