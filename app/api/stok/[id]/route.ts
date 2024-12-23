// app/api/stok/[id]/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

// Types & Interfaces
interface StokParams {
    params: Promise<{
        id: string;
    }>;
}

interface StokBody {
    kode: string;
    nama: string;
    kategori: 'material' | 'alat' | 'consumable';
    sub_kategori_id: number;
    stok_masuk: number;
    stok_keluar: number;
    satuan: string;
    lokasi: string;
    tanggal_masuk: string;
    keterangan?: string;
    status?: 'aman' | 'rusak' | 'cacat' | 'sisa';
}

// Utility Functions
const validateStokBody = (body: any): body is StokBody => {
    const requiredFields = ['kode', 'nama', 'kategori', 'sub_kategori_id', 'stok_masuk', 'satuan', 'lokasi', 'tanggal_masuk'];
    return requiredFields.every(field => field in body);
};

const getStokQuery = `
    SELECT DISTINCT
        s.*,
        skm.nama as sub_kategori_nama,
        skm.kode_item as sub_kategori_kode,
        skm.status as status,
        skm.id as sub_kategori_id,
        skm.kategori_id,
        skm.brand,
        skm.satuan as sub_kategori_satuan
    FROM stok s
    LEFT JOIN sub_kategori_material skm ON s.sub_kategori_id = skm.id
    WHERE s.id = ?
`;

// API Routes
export async function GET(request: Request, { params }: StokParams) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({
                success: false,
                message: 'ID is required'
            }, { status: 400 });
        }

        const [rows] = await db.execute<RowDataPacket[]>(getStokQuery, [id]);

        if (!Array.isArray(rows) || rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'Stok not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: rows[0]
        });

    } catch (error) {
        console.error('Error in GET /api/stok/[id]:', error);
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: StokParams) {
    try {
        const { id } = await params;
        const body = await request.json();

        if (!id) {
            return NextResponse.json({
                success: false,
                message: 'ID is required'
            }, { status: 400 });
        }

        if (!validateStokBody(body)) {
            return NextResponse.json({
                success: false,
                message: 'Invalid request body'
            }, { status: 400 });
        }

        // Begin transaction
        await db.query('START TRANSACTION');

        try {
            // 1. Update status di sub_kategori_material
            if (body.status && body.sub_kategori_id) {
                const updateStatusQuery = `
                    UPDATE sub_kategori_material 
                    SET 
                        status = ?,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `;

                await db.execute(updateStatusQuery, [
                    body.status,
                    body.sub_kategori_id
                ]);
            }

            // 2. Hitung stok_sisa
            const stok_sisa = body.stok_masuk - (body.stok_keluar || 0);

            // 3. Update data stok
            const stokQuery = `
                UPDATE stok 
                SET 
                    kode = ?,
                    nama = ?,
                    kategori = ?,
                    sub_kategori_id = ?,
                    stok_masuk = ?,
                    stok_keluar = ?,
                    stok_sisa = ?,
                    satuan = ?,
                    lokasi = ?,
                    tanggal_masuk = ?,
                    keterangan = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

            await db.execute(stokQuery, [
                body.kode,
                body.nama,
                body.kategori,
                body.sub_kategori_id,
                body.stok_masuk,
                body.stok_keluar || 0,
                stok_sisa,
                body.satuan,
                body.lokasi,
                body.tanggal_masuk,
                body.keterangan || null,
                id
            ]);

            // 4. Get updated data
            const [updatedRows] = await db.execute<RowDataPacket[]>(getStokQuery, [id]);

            // Commit transaction
            await db.query('COMMIT');

            return NextResponse.json({
                success: true,
                message: 'Stok updated successfully',
                data: updatedRows[0]
            });

        } catch (error) {
            // Rollback on error
            await db.query('ROLLBACK');
            throw error;
        }

    } catch (error) {
        console.error('Error in PUT /api/stok/[id]:', error);
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: StokParams) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({
                success: false,
                message: 'ID is required'
            }, { status: 400 });
        }

        // Begin transaction
        await db.query('START TRANSACTION');

        try {
            // Delete the record
            await db.execute('DELETE FROM stok WHERE id = ?', [id]);

            // Commit transaction
            await db.query('COMMIT');

            return NextResponse.json({
                success: true,
                message: 'Stok deleted successfully'
            });

        } catch (error) {
            // Rollback on error
            await db.query('ROLLBACK');
            throw error;
        }

    } catch (error) {
        console.error('Error in DELETE /api/stok/[id]:', error);
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        }, { status: 500 });
    }
}
