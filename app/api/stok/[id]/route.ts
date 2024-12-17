// app/api/stok/[id]/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Mengambil data stok berdasarkan ID
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        const [rows] = await db.execute(
            'SELECT * FROM stok_barang WHERE id = ?',
            [id]
        );

        if (!Array.isArray(rows) || rows.length === 0) {
            return NextResponse.json({
                message: 'Data tidak ditemukan'
            }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Data berhasil diambil',
            data: rows[0]
        }, { status: 200 });

    } catch (error) {
        console.error('Error fetching stok:', error);
        return NextResponse.json({
            message: 'Terjadi kesalahan saat mengambil data'
        }, { status: 500 });
    }
}

// PUT - Update seluruh data stok berdasarkan ID
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const body = await request.json();

        // Cek apakah data exists
        const [existingData] = await db.execute(
            'SELECT * FROM stok_barang WHERE id = ?',
            [id]
        );

        if (!Array.isArray(existingData) || existingData.length === 0) {
            return NextResponse.json({
                message: 'Data tidak ditemukan'
            }, { status: 404 });
        }

        // Update data
        await db.execute(`
            UPDATE stok_barang 
            SET 
                nama_barang = ?,
                kategori = ?,
                tipe_material = ?,
                merek = ?,
                warna = ?,
                satuan = ?,
                kemasan = ?,
                jumlah = ?,
                stok_minimum = ?,
                stok_maksimum = ?,
                harga_beli = ?,
                harga_jual = ?,
                mixing_ratio = ?,
                coverage_area = ?,
                ketebalan = ?,
                pot_life = ?,
                curing_time = ?,
                supplier = ?,
                lokasi_gudang = ?,
                nomor_rak = ?,
                nomor_batch = ?,
                tanggal_expired = ?,
                tanggal_produksi = ?,
                status = ?,
                keterangan = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
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
            body.keterangan,
            id
        ]);

        // Ambil data yang sudah diupdate
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

// PATCH - Update sebagian data stok berdasarkan ID
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const body = await request.json();

        // Cek apakah data exists
        const [existingData] = await db.execute(
            'SELECT * FROM stok_barang WHERE id = ?',
            [id]
        );

        if (!Array.isArray(existingData) || existingData.length === 0) {
            return NextResponse.json({
                message: 'Data tidak ditemukan'
            }, { status: 404 });
        }

        // Buat query dinamis berdasarkan field yang dikirim
        const updates = Object.keys(body)
            .map(key => `${key} = ?`)
            .join(', ');
        const values = [...Object.values(body), id];

        await db.execute(
            `UPDATE stok_barang SET ${updates}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            values
        );

        // Ambil data yang sudah diupdate
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

// DELETE - Menghapus data stok berdasarkan ID
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        // Cek apakah data exists
        const [existingData] = await db.execute(
            'SELECT * FROM stok_barang WHERE id = ?',
            [id]
        );

        if (!Array.isArray(existingData) || existingData.length === 0) {
            return NextResponse.json({
                message: 'Data tidak ditemukan'
            }, { status: 404 });
        }

        await db.execute(
            'DELETE FROM stok_barang WHERE id = ?',
            [id]
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
