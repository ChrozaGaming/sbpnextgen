// app/api/sub-kategori-material/route.ts

import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Buat koneksi database
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const kategori_id = searchParams.get('kategori_id');

        if (!kategori_id) {
            return NextResponse.json(
                { success: false, message: 'kategori_id is required' },
                { status: 400 }
            );
        }

        const query = `
            SELECT
                id,
                kategori_id,
                kode_item,
                nama,
                brand,
                satuan,
                status
            FROM sub_kategori_material
            WHERE kategori_id = ?
              AND status = 'aman'
            ORDER BY kode_item ASC
        `;

        try {
            const [results] = await db.execute(query, [kategori_id]);

            return NextResponse.json({
                success: true,
                data: results
            });
        } catch (dbError) {
            console.error('Database error:', dbError);
            return NextResponse.json(
                { success: false, message: 'Database error' },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Error fetching sub kategori material:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Tambahkan error handler
export function errorHandler(err: any) {
    console.error(err);
    return NextResponse.json(
        { success: false, message: 'Internal Server Error' },
        { status: 500 }
    );
}
