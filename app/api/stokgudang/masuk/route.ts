// app/api/stokgudang/masuk/route.ts
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const [rows] = await db.execute(`
            SELECT 
                s.*,
                sk.kode_item,
                sk.nama as sub_kategori_nama,
                sk.brand,
                sk.status
            FROM stok s
            LEFT JOIN sub_kategori_material sk ON s.sub_kategori_id = sk.id
            WHERE s.stok_masuk > 0
            ORDER BY s.tanggal_masuk DESC
        `);

        return NextResponse.json({ data: rows });
    } catch (error) {
        return NextResponse.json(
            { error: "Error fetching stok masuk" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            kode,
            nama,
            kategori,
            sub_kategori_id,
            stok_masuk,
            satuan,
            lokasi,
            keterangan
        } = body;

        const [result] = await db.execute(`
            INSERT INTO stok (
                kode,
                nama,
                kategori,
                sub_kategori_id,
                stok_masuk,
                stok_sisa,
                satuan,
                lokasi,
                tanggal_entry,
                tanggal_masuk,
                keterangan
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), CURDATE(), ?)
        `, [kode, nama, kategori, sub_kategori_id, stok_masuk, stok_masuk, satuan, lokasi, keterangan]);

        return NextResponse.json({ message: "Stok masuk berhasil ditambahkan", data: result });
    } catch (error) {
        return NextResponse.json(
            { error: "Error adding stok masuk" },
            { status: 500 }
        );
    }
}
