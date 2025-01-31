import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = Math.max(1, parseInt(searchParams.get('limit') || '10'));
        const offset = (page - 1) * limit;

        const [countResult] = await db.query<RowDataPacket[]>('SELECT COUNT(*) as total FROM stok');
        const total = countResult[0].total;

        const [rows] = await db.query<RowDataPacket[]>(
            `SELECT 
                s.*,
                sm.status,
                sm.kode_item as sub_kategori_kode,
                sm.nama as sub_kategori_nama,
                km.nama as kategori_nama
            FROM stok s
            LEFT JOIN sub_kategori_material sm ON s.sub_kategori_id = sm.id
            LEFT JOIN kategori_material km ON sm.kategori_id = km.id
            ORDER BY s.tanggal_entry DESC
            LIMIT ? OFFSET ?`,
            [limit, offset]
        );

        const formattedRows = rows.map(row => ({
            id: row.id,
            kode: row.kode,
            nama: row.nama,
            kategori: row.kategori,
            kategori_nama: row.kategori_nama,
            sub_kategori_id: row.sub_kategori_id,
            sub_kategori_kode: row.sub_kategori_kode,
            sub_kategori_nama: row.sub_kategori_nama,
            status: row.status || 'aman',
            stok_masuk: Number(row.stok_masuk),
            stok_keluar: Number(row.stok_keluar),
            stok_sisa: Number(row.stok_sisa),
            satuan: row.satuan,
            lokasi: row.lokasi,
            tanggal_entry: row.tanggal_entry,
            tanggal_masuk: row.tanggal_masuk,
            tanggal_keluar: row.tanggal_keluar,
            keterangan: row.keterangan
        }));

        return NextResponse.json({
            success: true,
            data: formattedRows,
            pagination: {
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                pageSize: limit
            }
        });
    } catch (error) {
        console.error('Error fetching stok:', error);
        return NextResponse.json(
            { success: false, message: 'Gagal mengambil data stok', error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const validations = {
            kode: body.kode?.trim(),
            nama: body.nama?.trim(),
            kategori: body.kategori,
            sub_kategori_id: Number(body.sub_kategori_id),
            stok_masuk: Number(body.stok_masuk),
            satuan: body.satuan?.trim(),
            lokasi: body.lokasi?.trim(),
            tanggal_entry: body.tanggal_entry,
            tanggal_masuk: body.tanggal_masuk
        };

        const invalidFields = Object.entries(validations).filter(([key, value]) => {
            if (key === 'stok_masuk') return isNaN(value) || value <= 0;
            if (key === 'sub_kategori_id') return isNaN(value) || value <= 0;
            return !value && value !== 0;
        });

        if (invalidFields.length > 0) {
            return NextResponse.json({
                success: false,
                message: `Invalid or missing fields: ${invalidFields.map(([key]) => key).join(', ')}`,
                invalidFields: Object.fromEntries(invalidFields)
            }, { status: 400 });
        }

        await db.query('START TRANSACTION');

        try {
            const [existingStok] = await db.query<RowDataPacket[]>(
                'SELECT id, stok_sisa, stok_masuk FROM stok WHERE kode = ?',
                [validations.kode]
            );

            if (existingStok.length > 0) {
                const existingData = existingStok[0];
                const updatedStokMasuk = existingData.stok_masuk + validations.stok_masuk;
                const updatedStokSisa = existingData.stok_sisa + validations.stok_masuk;

                await db.query(
                    `UPDATE stok 
                     SET stok_masuk = ?, stok_sisa = ?, updated_at = CURRENT_TIMESTAMP 
                     WHERE id = ?`,
                    [updatedStokMasuk, updatedStokSisa, existingData.id]
                );

                await db.query('COMMIT');

                return NextResponse.json({
                    success: true,
                    message: `Stok dengan kode ${validations.kode} berhasil diperbarui.`,
                    updatedData: {
                        id: existingData.id,
                        stok_masuk: updatedStokMasuk,
                        stok_sisa: updatedStokSisa
                    }
                });
            } else {
                const stok_sisa = validations.stok_masuk;

                const [result] = await db.query(
                    `INSERT INTO stok (
                        kode, nama, kategori, sub_kategori_id,
                        stok_masuk, stok_keluar, stok_sisa,
                        satuan, lokasi, tanggal_entry,
                        tanggal_masuk, keterangan
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        validations.kode,
                        validations.nama,
                        validations.kategori,
                        validations.sub_kategori_id,
                        validations.stok_masuk,
                        0,
                        stok_sisa,
                        validations.satuan,
                        validations.lokasi,
                        validations.tanggal_entry,
                        validations.tanggal_masuk || null,
                        body.keterangan || null
                    ]
                );

                await db.query('COMMIT');

                return NextResponse.json({
                    success: true,
                    message: 'Data stok berhasil ditambahkan.',
                    data: {
                        id: (result as any).insertId,
                        ...validations
                    }
                });
            }
        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Error creating/updating stok:', error);
        return NextResponse.json(
            { success: false, message: 'Gagal memproses data stok', error: error.message },
            { status: 500 }
        );
    }
}
