// app/api/stokgudang/check-kode/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const kode = searchParams.get('kode')

        if (!kode) {
            return NextResponse.json({ exists: false })
        }

        // Cek apakah kode sudah ada di tabel stok
        const [rows]: any = await db.execute(
            'SELECT kode FROM stok WHERE kode = ?',
            [kode]
        )

        // Jika ada data dengan kode tersebut
        const exists = rows.length > 0

        return NextResponse.json({ exists })
    } catch (error) {
        console.error('Error checking kode:', error)
        return NextResponse.json(
            { error: 'Internal Server Error', exists: false },
            { status: 500 }
        )
    }
}
