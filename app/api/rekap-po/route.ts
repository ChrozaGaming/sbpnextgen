import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        console.log('Fetching rekap-po data...');

        const [rows] = await db.execute(`
            SELECT 
                id,
                no_po,
                judulPO,
                DATE_FORMAT(tanggal, '%Y-%m-%d') as tanggal,
                CAST(status AS DECIMAL(10,2)) as status,
                CAST(nilai_penawaran AS DECIMAL(15,2)) as nilai_penawaran,
                CAST(nilai_po AS DECIMAL(15,2)) as nilai_po,
                CAST(biaya_pelaksanaan AS DECIMAL(15,2)) as biaya_pelaksanaan,
                CAST(profit AS DECIMAL(15,2)) as profit,
                keterangan,
                nama_perusahaan
            FROM rekap_po 
            ORDER BY tanggal DESC
        `);

        return NextResponse.json(rows);
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch data' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();

        const [result] = await db.execute(
            `INSERT INTO rekap_po (
                nama_perusahaan,
                no_po,
                judulPO,
                tanggal,
                nilai_penawaran,
                nilai_po,
                biaya_pelaksanaan,
                profit,
                status,
                keterangan
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.nama_perusahaan,
                data.no_po,
                data.judulPO,
                data.tanggal,
                data.nilai_penawaran,
                data.nilai_po,
                data.biaya_pelaksanaan,
                data.profit,
                data.status,
                data.keterangan
            ]
        );

        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Database Error' }, { status: 500 });
    }
}