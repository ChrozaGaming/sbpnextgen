import { NextRequest, NextResponse } from 'next/server';
import { db, testConnection } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        // Uji koneksi database
        const isConnected = await testConnection();
        if (!isConnected) throw new Error('Database not connected');

        // Query data dari tabel 'rekap_po'
        const [rows] = await db.query('SELECT * FROM rekap_po');

        // Return hasil dalam format JSON
        return NextResponse.json(rows, { status: 200 });
    } catch (error) {
        console.error('Error fetching data:', error);
        return NextResponse.json(
            { message: 'Failed to fetch data', error: error.message },
            { status: 500 }
        );
    }
}
