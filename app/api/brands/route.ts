// app/api/brands/route.ts

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        const [rows] = await db.query(`
            SELECT DISTINCT 
                CASE 
                    WHEN brand IS NULL OR TRIM(brand) = '' THEN 'TANPA BRAND'
                    ELSE UPPER(brand)
                END as brand
            FROM sub_kategori_material
            WHERE brand IS NOT NULL 
            ORDER BY brand ASC
        `);

        const brands = Array.isArray(rows) ? rows.map((row: any) => row.brand) : [];

        return NextResponse.json({
            success: true,
            brands
        });

    } catch (error) {
        console.error('Database error:', error);

        return NextResponse.json({
            success: false,
            message: 'Failed to fetch brands',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, {
            status: 500
        });
    }
}
