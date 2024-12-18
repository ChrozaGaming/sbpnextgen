// app/api/stokgudang/all/route.ts
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
            ORDER BY s.kode ASC
        `);

        if (!rows || (Array.isArray(rows) && rows.length === 0)) {
            return NextResponse.json(
                { error: "No data found" },
                { status: 404 }
            );
        }

        const formattedData = (rows as any[]).map((item) => ({
            id: item.id,
            kode: item.kode,
            nama: item.nama,
            kategori: item.kategori,
            sub_kategori: {
                kode: item.kode_item,
                nama: item.sub_kategori_nama,
                brand: item.brand,
                status: item.status
            },
            stok: {
                masuk: item.stok_masuk,
                keluar: item.stok_keluar,
                sisa: item.stok_sisa,
                satuan: item.satuan
            },
            lokasi: item.lokasi,
            tanggal: {
                entry: item.tanggal_entry,
                masuk: item.tanggal_masuk,
                keluar: item.tanggal_keluar
            }
        }));

        return NextResponse.json({
            status: "success",
            data: formattedData
        });

    } catch (error) {
        console.error("Error fetching all stock data:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
