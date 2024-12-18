// app/api/stokgudang/keluar/route.ts
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
            WHERE s.stok_keluar > 0
            ORDER BY s.tanggal_keluar DESC
        `);

        return NextResponse.json({ data: rows });
    } catch (error) {
        return NextResponse.json(
            { error: "Error fetching stok keluar" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            id,
            stok_keluar,
            keterangan
        } = body;

        // Get current stok
        const [[currentStok]] = await db.execute(
            "SELECT stok_sisa FROM stok WHERE id = ?",
            [id]
        );

        if (!currentStok || stok_keluar > currentStok.stok_sisa) {
            return NextResponse.json(
                { error: "Stok tidak mencukupi" },
                { status: 400 }
            );
        }

        const newSisa = currentStok.stok_sisa - stok_keluar;

        const [result] = await db.execute(`
            UPDATE stok 
            SET 
                stok_keluar = stok_keluar + ?,
                stok_sisa = ?,
                tanggal_keluar = CURDATE(),
                keterangan = CONCAT(IFNULL(keterangan, ''), ' | ', ?)
            WHERE id = ?
        `, [stok_keluar, newSisa, keterangan, id]);

        return NextResponse.json({ message: "Stok keluar berhasil dicatat", data: result });
    } catch (error) {
        return NextResponse.json(
            { error: "Error updating stok keluar" },
            { status: 500 }
        );
    }
}
