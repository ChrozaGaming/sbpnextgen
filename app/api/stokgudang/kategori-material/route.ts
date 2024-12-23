// app/api/stokgudang/kategori-material/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: Request) {
    try {
        const [rows] = await db.query<RowDataPacket[]>(
            'SELECT id, nama FROM kategori_material ORDER BY nama ASC'
        );

        return NextResponse.json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error('Error in GET /api/stokgudang/kategori-material:', error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error occurred'
            },
            { status: 500 }
        );
    }
}
