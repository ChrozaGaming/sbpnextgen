// app/api/suratjalan/[id]/route.ts

import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        // 1. Hapus semua barang terkait terlebih dahulu
        await db.query(
            'DELETE FROM barang WHERE suratJalan_id = ?',
            [params.id]
        );

        // 2. Kemudian hapus surat jalan
        await db.query(
            'DELETE FROM surat_jalan WHERE id = ?',
            [params.id]
        );

        return NextResponse.json({
            success: true,
            message: 'Surat jalan dan barang terkait berhasil dihapus'
        });

    } catch (error) {
        console.error('Error deleting surat jalan:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Gagal menghapus surat jalan'
            },
            { status: 500 }
        );
    }
}
