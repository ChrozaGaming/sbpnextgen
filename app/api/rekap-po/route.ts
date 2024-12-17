import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        const [rows] = await db.execute('SELECT * FROM rekap_po ORDER BY tanggal DESC');
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Database Error' }, { status: 500 });
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
