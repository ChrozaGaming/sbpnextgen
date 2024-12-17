// app/api/stok/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Ubah ini dari 'import pool' menjadi 'import { db }'

// GET - Mengambil semua data stok
export async function GET(request: Request) {
    try {
        const [rows] = await db.execute('SELECT * FROM stok_barang');

        return NextResponse.json({
            message: 'Data berhasil diambil',
            data: rows
        }, { status: 200 });
    } catch (error) {
        console.error('Error fetching stok:', error);
        return NextResponse.json({
            message: 'Terjadi kesalahan saat mengambil data'
        }, { status: 500 });
    }
}

// POST - Menambah data stok baru
export async function POST(request: Request) {
    try {
        const body = await request.json();

        const [result] = await db.execute(`
            INSERT INTO stok_barang (
                nama_barang,
                kategori,
                tipe_material,
                merek,
                warna,
                satuan,
                kemasan,
                jumlah,
                stok_minimum,
                stok_maksimum,
                harga_beli,
                harga_jual,
                mixing_ratio,
                coverage_area,
                ketebalan,
                pot_life,
                curing_time,
                supplier,
                lokasi_gudang,
                nomor_rak,
                nomor_batch,
                tanggal_expired,
                tanggal_produksi,
                status,
                keterangan
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            body.nama_barang,
            body.kategori,
            body.tipe_material,
            body.merek,
            body.warna,
            body.satuan,
            body.kemasan,
            body.jumlah,
            body.stok_minimum,
            body.stok_maksimum,
            body.harga_beli,
            body.harga_jual,
            body.mixing_ratio,
            body.coverage_area,
            body.ketebalan,
            body.pot_life,
            body.curing_time,
            body.supplier,
            body.lokasi_gudang,
            body.nomor_rak,
            body.nomor_batch,
            body.tanggal_expired,
            body.tanggal_produksi,
            body.status,
            body.keterangan
        ]);

        // Ambil data yang baru diinsert
        const [newData] = await db.execute(
            'SELECT * FROM stok_barang WHERE id = ?',
            [(result as any).insertId]
        );

        return NextResponse.json({
            message: 'Data berhasil ditambahkan',
            data: newData[0]
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating stok:', error);
        return NextResponse.json({
            message: 'Terjadi kesalahan saat menambah data'
        }, { status: 500 });
    }
}

// DELETE - Menghapus data stok (bulk delete)
export async function DELETE(request: Request) {
    try {
        const { ids } = await request.json();

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({
                message: 'ID tidak valid'
            }, { status: 400 });
        }

        const placeholders = ids.map(() => '?').join(',');
        await db.execute(
            `DELETE FROM stok_barang WHERE id IN (${placeholders})`,
            ids
        );

        return NextResponse.json({
            message: 'Data berhasil dihapus'
        }, { status: 200 });

    } catch (error) {
        console.error('Error deleting stok:', error);
        return NextResponse.json({
            message: 'Terjadi kesalahan saat menghapus data'
        }, { status: 500 });
    }
}

// PATCH - Update sebagian data stok
export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json({
                message: 'ID harus disertakan'
            }, { status: 400 });
        }

        // Buat query dinamis berdasarkan field yang dikirim
        const updates = Object.keys(updateData)
            .map(key => `${key} = ?`)
            .join(', ');
        const values = [...Object.values(updateData), id];

        await db.execute(
            `UPDATE stok_barang SET ${updates} WHERE id = ?`,
            values
        );

        // Ambil data yang diupdate
        const [updatedData] = await db.execute(
            'SELECT * FROM stok_barang WHERE id = ?',
            [id]
        );

        return NextResponse.json({
            message: 'Data berhasil diupdate',
            data: updatedData[0]
        }, { status: 200 });

    } catch (error) {
        console.error('Error updating stok:', error);
        return NextResponse.json({
            message: 'Terjadi kesalahan saat mengupdate data'
        }, { status: 500 });
    }
}
