// app/api/stok/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const distinct = searchParams.get('distinct')
        const type = searchParams.get('type') || 'stok'
        const search = searchParams.get('search') || ''
        const kategori = searchParams.get('kategori')
        const startDate = searchParams.get('start_date')
        const endDate = searchParams.get('end_date')

        // Jika distinct=kategori, ambil data kategori unik
        if (distinct === 'kategori') {
            const [rows] = await db.execute(`
                SELECT DISTINCT 
                    stok.kategori as kategori,
                    CASE 
                        WHEN stok.kategori = 'material' THEN 'Material'
                        WHEN stok.kategori = 'alat' THEN 'Alat'
                        WHEN stok.kategori = 'consumable' THEN 'Consumable'
                    END as nama
                FROM stok
                ORDER BY stok.kategori
            `)
            return NextResponse.json({ data: rows })
        }

        // Query dasar untuk data stok
        let query = `
            SELECT 
                s.*,
                skm.kode_item as sub_kategori_kode,
                skm.nama as sub_kategori_nama,
                skm.brand as sub_kategori_brand,
                skm.status as sub_kategori_status
            FROM stok s
            LEFT JOIN sub_kategori_material skm ON s.sub_kategori_id = skm.id
            WHERE 1=1
        `
        const params: any[] = []

        // Filter berdasarkan tipe (stok masuk/keluar)
        if (type === 'masuk') {
            query += ` AND s.stok_masuk > 0`
        } else if (type === 'keluar') {
            query += ` AND s.stok_keluar > 0`
        }

        // Filter pencarian
        if (search) {
            query += ` AND (s.kode LIKE ? OR s.nama LIKE ? OR skm.nama LIKE ?)`
            params.push(`%${search}%`, `%${search}%`, `%${search}%`)
        }

        // Filter kategori
        if (kategori && kategori !== 'semua') {
            query += ` AND s.kategori = ?`
            params.push(kategori)
        }

        // Filter rentang tanggal
        if (startDate && endDate) {
            query += ` AND s.tanggal_entry BETWEEN ? AND ?`
            params.push(startDate, endDate)
        }

        query += ` ORDER BY s.tanggal_entry DESC`

        const [rows] = await db.execute(query, params)

        // Transform data sesuai dengan interface yang dibutuhkan frontend
        const transformedData = (rows as any[]).map(row => ({
            id: row.id,
            kode: row.kode,
            nama: row.nama,
            kategori: row.kategori,
            kategori_nama: row.kategori === 'material' ? 'Material' :
                row.kategori === 'alat' ? 'Alat' :
                    row.kategori === 'consumable' ? 'Consumable' : '',
            sub_kategori: {
                kode: row.sub_kategori_kode,
                nama: row.sub_kategori_nama,
                brand: row.sub_kategori_brand,
                status: row.sub_kategori_status
            },
            stok: {
                masuk: row.stok_masuk,
                keluar: row.stok_keluar,
                sisa: row.stok_sisa,
                satuan: row.satuan
            },
            lokasi: row.lokasi,
            tanggal: {
                entry: row.tanggal_entry,
                masuk: row.tanggal_masuk,
                keluar: row.tanggal_keluar
            },
            keterangan: row.keterangan
        }))

        return NextResponse.json({
            data: transformedData,
            message: 'Data retrieved successfully'
        })

    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
