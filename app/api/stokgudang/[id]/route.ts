// app/api/stokgudang/[id]/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);

        if (!id || isNaN(id)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'ID tidak valid'
                },
                { status: 400 }
            );
        }

        // Cek apakah data exists
        const [existingRows] = await db.query<RowDataPacket[]>(
            'SELECT kode, nama FROM stok WHERE id = ?',
            [id]
        );

        if (!existingRows.length) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Data stok tidak ditemukan'
                },
                { status: 404 }
            );
        }

        const existingData = existingRows[0];

        // Hapus data
        await db.query('DELETE FROM stok WHERE id = ?', [id]);

        return NextResponse.json({
            success: true,
            message: `Stok dengan kode ${existingData.kode} - ${existingData.nama} berhasil dihapus`,
        });

    } catch (error) {
        console.error('Error deleting stok:', error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Gagal menghapus data stok'
            },
            { status: 500 }
        );
    }
}
