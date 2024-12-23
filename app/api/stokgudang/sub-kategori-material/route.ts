// app/api/stokgudang/sub-kategori-material/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: Request) {
    try {
        // Parse URL and get query parameters
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '10');
        const searchTerm = url.searchParams.get('search') || '';
        const offset = (page - 1) * limit;

        // Build base query
        let baseQuery = `
            FROM sub_kategori_material skm
            LEFT JOIN kategori_material km ON skm.kategori_id = km.id
            WHERE 1=1
        `;

        // Prepare search conditions and parameters
        const conditions: string[] = [];
        const values: any[] = [];

        if (searchTerm) {
            conditions.push('(skm.nama LIKE ? OR skm.kode_item LIKE ?)');
            values.push(`%${searchTerm}%`, `%${searchTerm}%`);
        }

        // Add conditions to base query if any
        if (conditions.length > 0) {
            baseQuery += ` AND ${conditions.join(' AND ')}`;
        }

        // Get total count
        const countQuery = `SELECT COUNT(*) as total ${baseQuery}`;
        const [countRows] = await db.query<RowDataPacket[]>(countQuery, values);
        const total = countRows[0].total;

        // Get paginated data
        const dataQuery = `
            SELECT 
                skm.*,
                km.nama as kategori_nama
            ${baseQuery}
            ORDER BY skm.updated_at DESC
            LIMIT ? OFFSET ?
        `;

        const [rows] = await db.query<RowDataPacket[]>(
            dataQuery,
            [...values, limit, offset]
        );

        return NextResponse.json({
            success: true,
            data: rows,
            pagination: {
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                pageSize: limit
            }
        });

    } catch (error) {
        console.error('Error in GET /api/stokgudang/sub-kategori-material:', error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error occurred'
            },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate required fields
        const requiredFields = ['kategori_id', 'kode_item', 'nama', 'satuan'];
        for (const field of requiredFields) {
            if (!body[field]) {
                return NextResponse.json(
                    {
                        success: false,
                        message: `Field ${field} is required`
                    },
                    { status: 400 }
                );
            }
        }

        // Validate satuan
        const validSatuan = ['kg', 'kgset', 'pail', 'galon5liter', 'galon10liter',
            'pcs', 'lonjor', 'liter', 'literset', 'sak', 'unit'];
        if (!validSatuan.includes(body.satuan)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid satuan value'
                },
                { status: 400 }
            );
        }

        // Check if kode_item already exists
        const [existing] = await db.query<RowDataPacket[]>(
            'SELECT id FROM sub_kategori_material WHERE kode_item = ?',
            [body.kode_item]
        );

        if ((existing as RowDataPacket[]).length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Kode item already exists'
                },
                { status: 400 }
            );
        }

        // Insert new record
        const [result] = await db.query(
            `INSERT INTO sub_kategori_material (
                kategori_id,
                kode_item,
                nama,
                brand,
                satuan,
                status,
                keterangan
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                body.kategori_id,
                body.kode_item,
                body.nama,
                body.brand || null,
                body.satuan,
                body.status || 'aman',
                body.keterangan || null
            ]
        );

        // Get inserted data
        const [newRow] = await db.query<RowDataPacket[]>(
            `SELECT 
                skm.*,
                km.nama as kategori_nama
            FROM sub_kategori_material skm
            LEFT JOIN kategori_material km ON skm.kategori_id = km.id
            WHERE skm.id = ?`,
            [(result as any).insertId]
        );

        return NextResponse.json({
            success: true,
            message: 'Sub kategori material berhasil ditambahkan',
            data: (newRow as RowDataPacket[])[0]
        });

    } catch (error) {
        console.error('Error in POST /api/stokgudang/sub-kategori-material:', error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error occurred'
            },
            { status: 500 }
        );
    }
}
