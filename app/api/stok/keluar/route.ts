// app/api/stok/keluar/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        const [rows] = await db.execute(`
            SELECT 
                sk.no_transaksi,
                sk.tanggal_keluar,
                sk.kode_barang,
                sb.nama_barang,
                sk.jumlah_keluar,
                sk.nama_proyek,
                sk.lokasi_proyek,
                sk.luas_area,
                sk.ketebalan_aplikasi,
                sk.tim_aplikator,
                sk.pengambil,
                sk.keterangan
            FROM stok_keluar sk
            LEFT JOIN stok_barang sb ON sk.kode_barang = sb.kode_barang
            ORDER BY sk.tanggal_keluar DESC
        `);

        return NextResponse.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Gagal mengambil data stok keluar'
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Begin transaction
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // Cek stok tersedia
            const [[stokData]] = await connection.execute(
                'SELECT jumlah FROM stok_barang WHERE kode_barang = ?',
                [data.kode_barang]
            );

            if (!stokData || stokData.jumlah < data.jumlah_keluar) {
                throw new Error('Stok tidak mencukupi');
            }

            // Insert ke stok_keluar
            const [resultKeluar] = await connection.execute(
                `INSERT INTO stok_keluar (
                    no_transaksi,
                    kode_barang,
                    jumlah_keluar,
                    nama_proyek,
                    lokasi_proyek,
                    luas_area,
                    ketebalan_aplikasi,
                    tim_aplikator,
                    pengambil,
                    keterangan
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    data.no_transaksi,
                    data.kode_barang,
                    data.jumlah_keluar,
                    data.nama_proyek,
                    data.lokasi_proyek,
                    data.luas_area,
                    data.ketebalan_aplikasi,
                    data.tim_aplikator,
                    data.pengambil,
                    data.keterangan
                ]
            );

            // Update stok_barang
            await connection.execute(
                `UPDATE stok_barang 
                SET jumlah = jumlah - ? 
                WHERE kode_barang = ?`,
                [data.jumlah_keluar, data.kode_barang]
            );

            await connection.commit();
            connection.release();

            return NextResponse.json({
                success: true,
                data: resultKeluar
            });
        } catch (err) {
            await connection.rollback();
            connection.release();
            throw err;
        }
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : 'Gagal menyimpan data stok keluar'
        }, { status: 500 });
    }
}
