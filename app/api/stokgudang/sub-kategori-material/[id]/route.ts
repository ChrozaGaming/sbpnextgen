// app/api/stokgudang/sub-kategori-material/[id]/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

interface RouteParams {
    params: {
        id: string;
    };
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const [rows] = await db.execute<RowDataPacket[]>(
            `SELECT
                 skm.*,
                 km.nama as kategori_nama
             FROM sub_kategori_material skm
                      LEFT JOIN kategori_material km ON skm.kategori_id = km.id
             WHERE skm.id = ?`,
            [params.id]
        );

        if (!Array.isArray(rows) || rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Sub kategori material not found'
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: rows[0]
        });

    } catch (error) {
        console.error('Error in GET /api/stokgudang/sub-kategori-material/[id]:', error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error occurred'
            },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request, { params }: RouteParams) {
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

        // Check if kode_item already exists for different id
        const [existing] = await db.execute<RowDataPacket[]>(
            'SELECT id FROM sub_kategori_material WHERE kode_item = ? AND id != ?',
            [body.kode_item, params.id]
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

        // Update record
        await db.execute(
            `UPDATE sub_kategori_material SET
                                              kategori_id = ?,
                                              kode_item = ?,
                                              nama = ?,
                                              brand = ?,
                                              satuan = ?,
                                              status = ?,
                                              keterangan = ?
             WHERE id = ?`,
            [
                body.kategori_id,
                body.kode_item,
                body.nama,
                body.brand || null,
                body.satuan,
                body.status || 'aman',
                body.keterangan || null,
                params.id
            ]
        );

        // Get updated data
        const [updatedRow] = await db.execute<RowDataPacket[]>(
            `SELECT
                 skm.*,
                 km.nama as kategori_nama
             FROM sub_kategori_material skm
                      LEFT JOIN kategori_material km ON skm.kategori_id = km.id
             WHERE skm.id = ?`,
            [params.id]
        );

        return NextResponse.json({
            success: true,
            message: 'Sub kategori material berhasil diupdate',
            data: (updatedRow as RowDataPacket[])[0]
        });

    } catch (error) {
        console.error('Error in PUT /api/stokgudang/sub-kategori-material/[id]:', error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error occurred'
            },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        // Check if sub kategori is being used in stok
        const [stokUsage] = await db.execute<RowDataPacket[]>(
            'SELECT id FROM stok WHERE sub_kategori_id = ? LIMIT 1',
            [params.id]
        );

        if ((stokUsage as RowDataPacket[]).length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Produk ini sedang digunakan pada data stok gudang, Hapus terlebih dahulu datanya di stok gudang jika ingin menghapus produk ini!'
                },
                { status: 400 }
            );
        }

        await db.execute(
            'DELETE FROM sub_kategori_material WHERE id = ?',
            [params.id]
        );

        return NextResponse.json({
            success: true,
            message: 'Sub kategori material berhasil dihapus'
        });

    } catch (error) {
        console.error('Error in DELETE /api/stokgudang/sub-kategori-material/[id]:', error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error occurred'
            },
            { status: 500 }
        );
    }
}
