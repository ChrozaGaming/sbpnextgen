// app/api/barang/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
    const connection = await db.getConnection();

    try {
        const { suratJalanId, barang } = await request.json();

        // Debug log
        console.log('Received data:', { suratJalanId, barang });

        // Validasi data
        if (!suratJalanId || !barang || !Array.isArray(barang)) {
            return NextResponse.json(
                { error: 'Data tidak valid' },
                { status: 400 }
            );
        }

        // Mulai transaksi
        await connection.beginTransaction();

        try {
            const insertPromises = barang.map(async (item) => {
                const [result] = await connection.execute(
                    `INSERT INTO barang 
                    (no, jumlah, kemasan, kode, nama, keterangan, suratJalan_id) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        item.no || '',        // Handle empty values
                        item.jumlah || '',
                        item.kemasan || '',
                        item.kode || '',
                        item.nama || '',
                        item.keterangan || '',
                        suratJalanId
                    ]
                );
                return result;
            });

            await Promise.all(insertPromises);
            await connection.commit();

            return NextResponse.json({
                success: true,
                message: 'Data barang berhasil disimpan'
            });

        } catch (error) {
            await connection.rollback();
            console.error('Transaction Error:', error);
            throw error;
        }

    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Gagal menyimpan data barang',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    } finally {
        connection.release();
    }
}
