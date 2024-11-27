// app/api/suratjalan/route.ts
import { db } from '@/lib/db';
import { ResultSetHeader } from 'mysql2';

interface SuratJalanRequest {
    noSurat: string;
    tanggal: string;
    noPO: string;
    noKendaraan: string;
    ekspedisi: string;
    user_id: number;
}

export async function POST(request: Request) {
    try {
        const body = await request.json() as SuratJalanRequest;

        // Validasi data
        const requiredFields: (keyof SuratJalanRequest)[] = [
            'noSurat',
            'tanggal',
            'noPO',
            'noKendaraan',
            'ekspedisi',
            'user_id'
        ];

        const missingFields = requiredFields.filter(field => !body[field]);

        if (missingFields.length > 0) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: `Field berikut harus diisi: ${missingFields.join(', ')}`
                }),
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        // Insert data
        const [result] = await db.execute<ResultSetHeader>(
            `INSERT INTO surat_jalan 
            (noSurat, tanggal, noPO, noKendaraan, ekspedisi, user_id) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                body.noSurat,
                body.tanggal,
                body.noPO,
                body.noKendaraan,
                body.ekspedisi,
                body.user_id
            ]
        );

        return new Response(
            JSON.stringify({
                success: true,
                id: result.insertId,
                message: 'Surat jalan berhasil disimpan'
            }),
            {
                status: 201,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

    } catch (error) {
        console.error('Database Error:', error);
        return new Response(
            JSON.stringify({
                success: false,
                error: 'Gagal menyimpan surat jalan',
                details: error instanceof Error ? error.message : 'Unknown error'
            }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }
}

export async function GET() {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM surat_jalan ORDER BY tanggal DESC'
        );

        return new Response(
            JSON.stringify({
                success: true,
                data: rows
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

    } catch (error) {
        console.error('Database Error:', error);
        return new Response(
            JSON.stringify({
                success: false,
                error: 'Gagal mengambil data surat jalan',
                details: error instanceof Error ? error.message : 'Unknown error'
            }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();

        if (!id) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'ID surat jalan diperlukan'
                }),
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        await db.execute(
            'DELETE FROM surat_jalan WHERE id = ?',
            [id]
        );

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Surat jalan berhasil dihapus'
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

    } catch (error) {
        console.error('Database Error:', error);
        return new Response(
            JSON.stringify({
                success: false,
                error: 'Gagal menghapus surat jalan',
                details: error instanceof Error ? error.message : 'Unknown error'
            }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }
}
