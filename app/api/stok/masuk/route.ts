// app/api/stok/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        const [rows] = await db.execute(`
            SELECT 
                id, 
                kode_barang,
                nama_barang,
                kategori,
                tipe_material,
                merek,
                warna,
                satuan,
                kemasan,
                jumlah,
                stok_minimum,
                mixing_ratio,
                coverage_area,
                ketebalan,
                supplier,
                lokasi_gudang,
                status
            FROM stok_barang 
            ORDER BY id DESC
        `);

        return NextResponse.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Gagal mengambil data stok'
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();

        const [result] = await db.execute(
            `INSERT INTO stok_barang (
                kode_barang,
                nama_barang,
                kategori,
                tipe_material,
                merek,
                warna,
                satuan,
                kemasan,
                jumlah,
                stok_minimum,
                mixing_ratio,
                coverage_area,
                ketebalan,
                supplier,
                lokasi_gudang,
                status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.kode_barang,
                data.nama_barang,
                data.kategori,
                data.tipe_material,
                data.merek,
                data.warna,
                data.satuan,
                data.kemasan,
                data.jumlah,
                data.stok_minimum,
                data.mixing_ratio,
                data.coverage_area,
                data.ketebalan,
                data.supplier,
                data.lokasi_gudang,
                data.status || 'aktif'
            ]
        );

        return NextResponse.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Gagal menyimpan data'
        }, { status: 500 });
    }
}
