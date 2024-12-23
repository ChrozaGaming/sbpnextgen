// pages/api/stok/update-status/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json(
                { success: false, message: 'ID dan status harus diisi' },
                { status: 400 }
            );
        }

        // Validasi status sesuai enum di database
        const validStatus = ['aman', 'rusak', 'cacat', 'sisa'];
        if (!validStatus.includes(status)) {
            return NextResponse.json(
                { success: false, message: 'Status tidak valid' },
                { status: 400 }
            );
        }

        await db.query('START TRANSACTION');

        try {
            // 1. Dapatkan data sub_kategori_id dari tabel stok
            const [stokRows] = await db.execute(
                'SELECT sub_kategori_id FROM stok WHERE id = ?',
                [id]
            );

            if (!stokRows || !stokRows[0]) {
                throw new Error('Stok tidak ditemukan');
            }

            const sub_kategori_id = stokRows[0].sub_kategori_id;

            // 2. Update status di tabel sub_kategori_material
            const updateQuery = `
                UPDATE sub_kategori_material 
                SET status = ?,
                    updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            `;

            await db.execute(updateQuery, [status, sub_kategori_id]);

            // 3. Ambil data terbaru dengan JOIN
            const [updatedRows] = await db.execute(`
                SELECT 
                    s.*,
                    sm.status,
                    sm.kode_item as sub_kategori_kode,
                    sm.nama as sub_kategori_nama
                FROM stok s
                LEFT JOIN sub_kategori_material sm ON s.sub_kategori_id = sm.id
                WHERE s.id = ?
            `, [id]);

            await db.query('COMMIT');

            return NextResponse.json({
                success: true,
                message: 'Status berhasil diupdate',
                data: updatedRows[0]
            });

        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }

    } catch (error) {
        console.error('Error updating status:', error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Gagal mengupdate status'
            },
            { status: 500 }
        );
    }
}