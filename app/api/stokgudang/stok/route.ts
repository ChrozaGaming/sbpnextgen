// app/api/stokgudang/stok/route.ts
import { NextResponse } from 'next/server';
import { createPool } from 'mysql2/promise';

// Konfigurasi database
const pool = createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'sbp',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export async function GET() {
    try {
        const conn = await pool.getConnection();

        try {
            const [rows] = await conn.execute(`
                SELECT 
                    s.*,
                    skm.nama as sub_kategori_nama
                FROM stok s
                LEFT JOIN sub_kategori_material skm ON s.sub_kategori_id = skm.id
                ORDER BY s.tanggal_entry DESC
            `);

            return NextResponse.json({
                success: true,
                data: rows
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-store, no-cache, must-revalidate'
                }
            });

        } finally {
            conn.release(); // Selalu release connection ke pool
        }

    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Terjadi kesalahan dalam mengambil data stok',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-store, no-cache, must-revalidate'
                }
            }
        );
    }
}

// POST endpoint untuk menambah stok baru
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const conn = await pool.getConnection();

        try {
            const [result] = await conn.execute(`
                INSERT INTO stok (
                    kode,
                    nama,
                    kategori,
                    sub_kategori_id,
                    stok_masuk,
                    stok_keluar,
                    stok_sisa,
                    satuan,
                    lokasi,
                    tanggal_entry,
                    tanggal_masuk,
                    tanggal_keluar,
                    keterangan
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                body.kode,
                body.nama,
                body.kategori,
                body.sub_kategori_id,
                body.stok_masuk || 0,
                body.stok_keluar || 0,
                body.stok_sisa || 0,
                body.satuan,
                body.lokasi,
                body.tanggal_entry,
                body.tanggal_masuk || null,
                body.tanggal_keluar || null,
                body.keterangan || null
            ]);

            return NextResponse.json({
                success: true,
                message: 'Stok berhasil ditambahkan',
                data: result
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-store, no-cache, must-revalidate'
                }
            });

        } finally {
            conn.release();
        }

    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Gagal menambahkan stok',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-store, no-cache, must-revalidate'
                }
            }
        );
    }
}

// PUT endpoint untuk update stok
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const conn = await pool.getConnection();

        try {
            const [result] = await conn.execute(`
                UPDATE stok 
                SET 
                    nama = ?,
                    kategori = ?,
                    sub_kategori_id = ?,
                    stok_masuk = ?,
                    stok_keluar = ?,
                    stok_sisa = ?,
                    satuan = ?,
                    lokasi = ?,
                    tanggal_masuk = ?,
                    tanggal_keluar = ?,
                    keterangan = ?
                WHERE kode = ?
            `, [
                body.nama,
                body.kategori,
                body.sub_kategori_id,
                body.stok_masuk,
                body.stok_keluar,
                body.stok_sisa,
                body.satuan,
                body.lokasi,
                body.tanggal_masuk || null,
                body.tanggal_keluar || null,
                body.keterangan || null,
                body.kode
            ]);

            return NextResponse.json({
                success: true,
                message: 'Stok berhasil diupdate',
                data: result
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-store, no-cache, must-revalidate'
                }
            });

        } finally {
            conn.release();
        }

    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Gagal mengupdate stok',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-store, no-cache, must-revalidate'
                }
            }
        );
    }
}

// DELETE endpoint untuk menghapus stok
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const kode = searchParams.get('kode');

        if (!kode) {
            throw new Error('Kode stok tidak ditemukan');
        }

        const conn = await pool.getConnection();

        try {
            const [result] = await conn.execute('DELETE FROM stok WHERE kode = ?', [kode]);

            return NextResponse.json({
                success: true,
                message: 'Stok berhasil dihapus',
                data: result
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-store, no-cache, must-revalidate'
                }
            });

        } finally {
            conn.release();
        }

    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Gagal menghapus stok',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-store, no-cache, must-revalidate'
                }
            }
        );
    }
}
