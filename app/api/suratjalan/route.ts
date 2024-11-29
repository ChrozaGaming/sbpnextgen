// app/api/suratjalan/route.ts
import { db } from '@/lib/db';
import { ResultSetHeader } from 'mysql2';
import { NextResponse } from 'next/server';

interface SuratJalan extends RowDataPacket {
    id: number;
    noSurat: string;
    tanggal: string;
    noPO: string;
    noKendaraan: string;
    ekspedisi: string;
    user_id: number;
    username: string;
    createdAt: Date;
    updatedAt: Date;
}


export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const offset = (page - 1) * limit;

        const conn = await db.getConnection();

        try {
            // Count total rows
            const [totalRows] = await conn.query<RowDataPacket[]>(
                `SELECT COUNT(*) as total 
                 FROM surat_jalan 
                 WHERE noSurat LIKE ?`,
                [`%${search}%`]
            );

            const total = totalRows[0].total;

            // Get paginated data
            const [rows] = await conn.query<SuratJalan[]>(
                `SELECT 
                    sj.*,
                    u.username 
                 FROM surat_jalan sj 
                 LEFT JOIN users u ON sj.user_id = u.id 
                 WHERE sj.noSurat LIKE ? 
                 ORDER BY sj.createdAt DESC 
                 LIMIT ? OFFSET ?`,
                [`%${search}%`, limit, offset]
            );

            // Calculate pagination info
            const totalPages = Math.ceil(total / limit);
            const hasNextPage = page < totalPages;
            const hasPrevPage = page > 1;
            const startIndex = offset + 1;
            const endIndex = Math.min(offset + limit, total);

            return NextResponse.json({
                success: true,
                data: rows,
                pagination: {
                    total,
                    currentPage: page,
                    totalPages,
                    limit,
                    startIndex,
                    endIndex,
                    hasNextPage,
                    hasPrevPage
                }
            });

        } finally {
            conn.release(); // Selalu release connection
        }

    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Gagal mengambil data',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    const conn = await db.getConnection();

    try {
        const body = await request.json() as SuratJalanRequest;

        // Validasi data
        const requiredFields: (keyof SuratJalanRequest)[] = [
            'noSurat', 'tanggal', 'noPO', 'noKendaraan', 'ekspedisi', 'user_id'
        ];

        const missingFields = requiredFields.filter(field => !body[field]);
        if (missingFields.length > 0) {
            return NextResponse.json({
                success: false,
                error: `Field berikut harus diisi: ${missingFields.join(', ')}`
            }, { status: 400 });
        }

        await conn.beginTransaction();

        try {
            // Check duplicate noSurat
            const [existing] = await conn.query(
                'SELECT id FROM surat_jalan WHERE noSurat = ?',
                [body.noSurat]
            );

            if ((existing as any[]).length > 0) {
                await conn.rollback();
                return NextResponse.json({
                    success: false,
                    error: 'Nomor surat sudah digunakan'
                }, { status: 400 });
            }

            // Insert data
            const [result] = await conn.query(
                `INSERT INTO surat_jalan
                    (noSurat, tanggal, noPO, noKendaraan, ekspedisi, user_id)
                VALUES (?, ?, ?, ?, ?, ?)`,
                [body.noSurat, body.tanggal, body.noPO, body.noKendaraan, body.ekspedisi, body.user_id]
            );

            await conn.commit();

            return NextResponse.json({
                success: true,
                data: {
                    id: (result as ResultSetHeader).insertId,
                    ...body
                },
                message: 'Surat jalan berhasil disimpan'
            }, { status: 201 });

        } catch (error) {
            await conn.rollback();
            throw error;
        }

    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({
            success: false,
            error: 'Gagal menyimpan surat jalan',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    } finally {
        conn.release();
    }
}

// OPTIONS handler untuk CORS
export async function OPTIONS() {
    return NextResponse.json({}, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
    });
}
