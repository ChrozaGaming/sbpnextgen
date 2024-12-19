// pages/api/stokgudang/tambahbarang/route.ts

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { kategori_id, kode_item, nama, brand, status, keterangan } = body;

        // Validate required fields
        if (!kategori_id || !kode_item || !nama || !status) {
            return NextResponse.json(
                {
                    message: 'Data yang diperlukan tidak lengkap',
                    success: false
                },
                { status: 400 }
            );
        }

        // Validate data types
        if (
            typeof kategori_id !== 'number' ||
            typeof kode_item !== 'string' ||
            typeof nama !== 'string' ||
            typeof status !== 'string'
        ) {
            return NextResponse.json(
                {
                    message: 'Format data tidak valid',
                    success: false
                },
                { status: 400 }
            );
        }

        const [result] = await db.execute(
            `INSERT INTO sub_kategori_material 
       (kategori_id, kode_item, nama, brand, status, keterangan, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [kategori_id, kode_item, nama, brand, status, keterangan]
        );

        return NextResponse.json(
            {
                message: 'Barang berhasil ditambahkan',
                success: true,
                data: result
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Error adding item:', error);
        return NextResponse.json(
            {
                message: 'Terjadi kesalahan saat menambahkan barang',
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// Optional: Handle other HTTP methods
export async function GET() {
    return NextResponse.json(
        {
            message: 'Method tidak diizinkan',
            success: false
        },
        { status: 405 }
    );
}

// To handle CORS if needed
export const config = {
    api: {
        bodyParser: true,
        externalResolver: true,
    },
};
