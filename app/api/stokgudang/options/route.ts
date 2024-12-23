// app/api/stokgudang/options/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        // Mengambil lokasi dan keterangan yang distinct
        const [lokasiRows] = await db.execute(
            'SELECT DISTINCT lokasi FROM stok WHERE lokasi IS NOT NULL AND lokasi != "" ORDER BY lokasi'
        );

        const [keteranganRows] = await db.execute(
            'SELECT DISTINCT keterangan FROM stok WHERE keterangan IS NOT NULL AND keterangan != "" ORDER BY keterangan'
        );

        return NextResponse.json({
            success: true,
            data: {
                lokasi: lokasiRows,
                keterangan: keteranganRows
            }
        });
    } catch (error) {
        console.error('Error fetching options:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
