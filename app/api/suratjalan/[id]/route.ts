// app/api/suratjalan/[id]/route.ts

import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Langsung hapus data di surat_jalan (barang akan dihapus otomatis jika ON DELETE CASCADE diaktifkan)
        await db.query('DELETE FROM surat_jalan WHERE id = ?', [params.id]);

        // Jika ON DELETE CASCADE tidak aktif, hapus barang secara eksplisit
        // await db.query('DELETE FROM barang WHERE suratJalan_id = ?', [params.id]);

        return new Response(
            JSON.stringify({ success: true, message: 'Surat jalan berhasil dihapus' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error deleting surat jalan:', error);
        return new Response(
            JSON.stringify({ success: false, error: 'Gagal menghapus surat jalan' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
