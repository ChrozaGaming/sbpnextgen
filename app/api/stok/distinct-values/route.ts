// app/api/stok/distinct-values/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        // Get distinct kategori
        const [kategoriRows] = await db.query(
            'SELECT DISTINCT kategori FROM stok ORDER BY kategori'
        );

        // Get all sub kategori with their kategori
        const [subKategoriRows] = await db.query(`
            SELECT 
                sm.id,
                sm.kode_item,
                sm.nama,
                km.nama as kategori
            FROM sub_kategori_material sm
            JOIN kategori_material km ON sm.kategori_id = km.id
            ORDER BY sm.kode_item
        `);

        return NextResponse.json({
            success: true,
            kategoriList: (kategoriRows as any[]).map(row => row.kategori),
            subKategoriList: subKategoriRows
        });

    } catch (error) {
        console.error('Error fetching distinct values:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Gagal mengambil data'
            },
            { status: 500 }
        );
    }
}