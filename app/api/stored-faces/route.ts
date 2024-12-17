import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

export async function GET() {
    try {
        const connection = await mysql.createConnection(dbConfig);

        const [rows] = await connection.execute(`
            SELECT 
                id,
                nama,
                email,
                face_descriptors,
                confidence_score,
                status
            FROM deteksiwajah
            WHERE status = 'active'
            ORDER BY created_at DESC
        `);

        await connection.end();

        const faces = (rows as any[]).map(row => ({
            ...row,
            face_descriptors: JSON.parse(row.face_descriptors)
        }));

        return NextResponse.json({
            success: true,
            faces
        });

    } catch (error) {
        console.error('Error fetching stored faces:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Gagal mengambil data wajah tersimpan',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
