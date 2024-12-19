// app/api/stokgudang/all/route.ts
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        // Verify database connection first
        if (!db) {
            throw new Error("Database connection not established")
        }

        const [rows] = await db.execute(`
            SELECT 
                s.*,
                sk.kode_item,
                sk.nama as sub_kategori_nama,
                sk.brand,
                sk.status
            FROM stok s
            LEFT JOIN sub_kategori_material sk ON s.sub_kategori_id = sk.id
            ORDER BY s.kode ASC
        `);

        if (!rows) {
            return NextResponse.json({
                status: "error",
                error: "No data returned from database"
            }, { status: 404 });
        }

        if (Array.isArray(rows) && rows.length === 0) {
            return NextResponse.json({
                status: "success",
                data: []
            });
        }

        const formattedData = (rows as any[]).map((item) => ({
            id: item.id,
            kode: item.kode,
            nama: item.nama,
            kategori: item.kategori,
            sub_kategori: {
                kode: item.kode_item || '',
                nama: item.sub_kategori_nama || '',
                brand: item.brand || '',
                status: item.status || 'aman'
            },
            stok: {
                masuk: Number(item.stok_masuk) || 0,
                keluar: Number(item.stok_keluar) || 0,
                sisa: Number(item.stok_sisa) || 0,
                satuan: item.satuan || 'pcs'
            },
            lokasi: item.lokasi || '',
            tanggal: {
                entry: item.tanggal_entry || new Date().toISOString(),
                masuk: item.tanggal_masuk,
                keluar: item.tanggal_keluar
            }
        }));

        return NextResponse.json({
            status: "success",
            data: formattedData
        });

    } catch (error: any) {
        console.error("Database Error:", error);

        return NextResponse.json({
            status: "error",
            error: error.message || "Internal Server Error",
            details: process.env.NODE_ENV === 'development' ? error : undefined
        }, {
            status: 500
        });
    }
}
