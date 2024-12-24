// /app/api/stokgudang/filter-options/route.ts

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET() {
    try {
        // Query untuk mendapatkan brand yang unik
        const [brandRows] = await db.query<RowDataPacket[]>(`
            SELECT DISTINCT 
                CASE 
                    WHEN brand IS NULL OR TRIM(brand) = '' THEN 'Tanpa Brand'
                    ELSE brand 
                END as brand
            FROM sub_kategori_material
            WHERE brand IS NOT NULL 
            ORDER BY brand ASC
        `);

        // Kategori dari enum values
        const kategoris = [
            { value: 'material', label: 'Material' },
            { value: 'alat', label: 'Alat' },
            { value: 'consumable', label: 'Consumable' }
        ];

        // Transform brand rows
        const brands = brandRows.map(row => row.brand);

        return NextResponse.json({
            success: true,
            data: {
                brands,
                kategoris
            }
        });

    } catch (error) {
        console.error('Error in filter-options API:', error);

        return NextResponse.json({
            success: false,
            message: 'Internal Server Error',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
