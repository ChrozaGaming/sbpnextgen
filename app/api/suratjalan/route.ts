import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; // File koneksi database

export async function POST(request: Request) {
    try {
        // Ambil data dari body request
        const body = await request.json();
        const { tujuan, nomorSurat, tanggal, nomorKendaraan, noPo, barang, keteranganProyek } = body;

        // Validasi data input
        if (!tujuan || !nomorSurat || !tanggal || !Array.isArray(barang) || barang.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Data surat jalan tidak lengkap' },
                { status: 400 }
            );
        }

        // Mulai transaksi
        await db.query('START TRANSACTION');

        try {
            // Simpan data surat jalan
            const [suratJalanResult] = await db.query(
                `
                    INSERT INTO surat_jalan (tujuan, nomor_surat, tanggal, nomor_kendaraan, no_po, keterangan_proyek)
                    VALUES (?, ?, ?, ?, ?, ?)
                `,
                [tujuan, nomorSurat, tanggal, nomorKendaraan || null, noPo || null, keteranganProyek || null]
            );

            const suratJalanId = (suratJalanResult as any).insertId;

            // Simpan data barang yang terkait dengan surat jalan
            for (const item of barang) {
                const { id, jumlah } = item;

                // Validasi data barang
                if (!id || !jumlah || jumlah <= 0) {
                    throw new Error(`Data barang tidak valid: ${JSON.stringify(item)}`);
                }

                // Periksa apakah stok mencukupi
                const [stokResult] = await db.query(
                    'SELECT stok_sisa, satuan FROM stok WHERE id = ?',
                    [id]
                );

                if (stokResult.length === 0) {
                    throw new Error(`Barang dengan ID ${id} tidak ditemukan.`);
                }

                const stokSisa = stokResult[0].stok_sisa;
                if (stokSisa < jumlah) {
                    return NextResponse.json(
                        {
                            success: false,
                            message: `Stok barang dengan ID ${id} tidak mencukupi. Sisa stok: ${stokSisa}`,
                        },
                        { status: 400 }
                    );
                }


                // Masukkan data barang ke dalam tabel barang_surat_jalan
                await db.query(
                    `
                        INSERT INTO barang_surat_jalan (surat_jalan_id, barang_id, jumlah)
                        VALUES (?, ?, ?)
                    `,
                    [suratJalanId, id, jumlah]
                );

                // Kurangi stok barang di tabel stok
                await db.query(
                    `
                        UPDATE stok
                        SET stok_sisa = stok_sisa - ?, stok_keluar = stok_keluar + ?
                        WHERE id = ?
                    `,
                    [jumlah, jumlah, id]
                );
            }

            // Commit transaksi
            await db.query('COMMIT');

            return NextResponse.json({
                success: true,
                message: 'Surat Jalan berhasil disimpan',
                suratJalanId,
            });
        } catch (error) {
            // Rollback jika ada kesalahan
            await db.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Error processing surat jalan:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Terjadi kesalahan saat memproses surat jalan',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

// Contoh handler GET di API backend
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const field = searchParams.get('field') || 'nomor_surat';
    const sort = searchParams.get('sort') || 'id';
    const order = searchParams.get('order') || 'asc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    try {
        const [rows] = await db.query(
            `
            SELECT
                sj.id,
                sj.nomor_surat,
                sj.tujuan,
                sj.tanggal,
                sj.nomor_kendaraan,
                sj.no_po,
                sj.keterangan_proyek,
                sj.created_at,
                IFNULL(
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'kode', s.kode,
                            'nama', s.nama,
                            'jumlah', bsj.jumlah,
                            'satuan', s.satuan
                        )
                    ),
                    JSON_ARRAY()
                ) AS barang
            FROM
                surat_jalan sj
            LEFT JOIN
                barang_surat_jalan bsj ON sj.id = bsj.surat_jalan_id
            LEFT JOIN
                stok s ON bsj.barang_id = s.id
            WHERE
                ${field} LIKE ?
            GROUP BY
                sj.id
            ORDER BY
                ${sort} ${order}
            LIMIT ? OFFSET ?
            `,
            [`%${search}%`, limit, offset]
        );

        const [countResult] = await db.query(`
            SELECT COUNT(*) as total
            FROM surat_jalan sj
            WHERE ${field} LIKE ?
        `, [`%${search}%`]);

        const total = countResult[0].total || 0;
        return NextResponse.json({
            success: true,
            data: rows,
            pagination: {
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                pageSize: limit,
            },
        });
    } catch (error) {
        console.error('Error fetching surat jalan:', error);
        return NextResponse.json(
            { success: false, message: 'Gagal mengambil data surat jalan', error: error.message },
            { status: 500 }
        );
    }
}



