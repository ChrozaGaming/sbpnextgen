// app/api/stokgudang/sub-kategori/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { kategori } = await request.json();

        let kategoriId;
        switch(kategori.toLowerCase()) {
            case 'material': kategoriId = 1; break;
            case 'alat': kategoriId = 2; break;
            case 'consumable': kategoriId = 3; break;
            default: throw new Error('Kategori tidak valid');
        }

        const query = `
            SELECT 
                skm.id,
                skm.kategori_id,
                skm.kode_item,
                skm.nama,
                skm.brand,
                skm.status,
                skm.keterangan,
                COALESCE(
                    (SELECT stok_sisa 
                     FROM stok 
                     WHERE sub_kategori_id = skm.id 
                     ORDER BY id DESC 
                     LIMIT 1
                    ), 0
                ) as stok_tersedia,
                COALESCE(
                    (SELECT satuan 
                     FROM stok 
                     WHERE sub_kategori_id = skm.id 
                     AND satuan IS NOT NULL
                     ORDER BY id DESC 
                     LIMIT 1
                    ),
                    CASE 
                        WHEN skm.kategori_id = 1 THEN 'kg'
                        WHEN skm.kategori_id = 2 THEN 'unit'
                        WHEN skm.kategori_id = 3 THEN 'pcs'
                    END
                ) as satuan,
                CASE 
                    WHEN skm.kategori_id = 1 THEN 'material'
                    WHEN skm.kategori_id = 2 THEN 'alat'
                    WHEN skm.kategori_id = 3 THEN 'consumable'
                END as kategori
            FROM sub_kategori_material skm
            WHERE skm.kategori_id = ? 
            AND skm.status = 'aman'
            ORDER BY skm.kode_item
        `;

        const [rows] = await db.query(query, [kategoriId]);

        console.log('Query result:', rows);

        if (!rows || rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'Tidak ada data yang ditemukan'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Berhasil mengambil data sub kategori',
            data: rows
        });

    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : 'Gagal mengambil data sub kategori',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
