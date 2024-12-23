// /app/api/stokgudang/kode-nama/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const kategori = searchParams.get('kategori');

    if (!kategori) {
        return NextResponse.json(
            { success: false, message: 'Kategori is required' },
            { status: 400 }
        );
    }

    try {
        const [rows] = await db.execute(`
            SELECT 
                skm.kode_item as kode,
                skm.nama,
                skm.satuan,
                skm.brand
            FROM sub_kategori_material skm
            WHERE skm.kategori_id IN (
                SELECT id 
                FROM kategori_material 
                WHERE nama = ?
            )
            ORDER BY skm.kode_item ASC
        `, [kategori]);

        return NextResponse.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Error fetching kode-nama:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
