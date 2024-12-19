import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Fungsi helper untuk format tanggal
function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
}

// Fungsi untuk memvalidasi format tanggal
function isValidDate(dateStr: string): boolean {
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date.getTime());
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);

        // Parse pagination parameters
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = (page - 1) * limit;

        // Parse filter parameters
        const search = searchParams.get('search');
        const kategori = searchParams.get('kategori');
        const startDate = searchParams.get('start_date');
        const endDate = searchParams.get('end_date');

        // Build query
        let conditions = ['1=1'];
        let params: any[] = [];

        if (search) {
            conditions.push('(s.kode LIKE ? OR s.nama LIKE ? OR s.lokasi LIKE ? OR skm.nama LIKE ?)');
            const searchValue = `%${search}%`;
            params.push(searchValue, searchValue, searchValue, searchValue);
        }

        if (kategori) {
            conditions.push('s.kategori = ?');
            params.push(kategori);
        }

        if (startDate && endDate) {
            conditions.push('s.tanggal_entry BETWEEN ? AND ?');
            params.push(startDate, endDate);
        }

        // Main query
        const query = `
            SELECT 
                s.*,
                skm.nama as sub_kategori_nama,
                skm.kode_item as sub_kategori_kode
            FROM stok s
            LEFT JOIN sub_kategori_material skm ON s.sub_kategori_id = skm.id
            WHERE ${conditions.join(' AND ')}
            ORDER BY s.tanggal_entry DESC
            LIMIT ? OFFSET ?
        `;

        // Count query for pagination
        const countQuery = `
            SELECT COUNT(*) as total
            FROM stok s
            LEFT JOIN sub_kategori_material skm ON s.sub_kategori_id = skm.id
            WHERE ${conditions.join(' AND ')}
        `;

        // Add pagination parameters
        params.push(limit.toString(), offset.toString());

        // Execute queries
        const [rows] = await db.execute(query, params);
        const [countResult] = await db.execute(countQuery, params.slice(0, -2));

        // Get total count
        const total = Array.isArray(countResult) && countResult.length > 0
            ? (countResult[0] as any).total
            : 0;

        // Calculate pagination metadata
        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return NextResponse.json({
            success: true,
            message: 'Data retrieved successfully',
            data: rows,
            pagination: {
                total,
                totalPages,
                currentPage: page,
                limit,
                hasNextPage,
                hasPrevPage
            }
        });

    } catch (error) {
        console.error('Error in GET /api/stok:', error);
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Validasi input wajib
        if (!body.kode || !body.nama || !body.kategori || !body.sub_kategori_id || !body.stok_masuk || !body.satuan || !body.lokasi || !body.tanggal_masuk) {
            return NextResponse.json({
                success: false,
                message: 'Semua field wajib diisi',
                requiredFields: ['kode', 'nama', 'kategori', 'sub_kategori_id', 'stok_masuk', 'satuan', 'lokasi', 'tanggal_masuk']
            }, { status: 400 });
        }

        // Validasi kategori
        const validKategori = ['material', 'alat', 'consumable'];
        if (!validKategori.includes(body.kategori?.toLowerCase())) {
            return NextResponse.json(
                { success: false, message: 'Kategori tidak valid' },
                { status: 400 }
            );
        }

        // Validasi satuan
        const validSatuan = ['kg', 'kgset', 'pail', 'galon5liter', 'galon10liter', 'pcs', 'lonjor', 'liter', 'literset', 'sak', 'unit'];
        if (!validSatuan.includes(body.satuan)) {
            return NextResponse.json(
                { success: false, message: 'Satuan tidak valid' },
                { status: 400 }
            );
        }

        // Format tanggal menggunakan helper functions
        const currentDate = formatDate(new Date());
        const tanggalMasuk = isValidDate(body.tanggal_masuk)
            ? formatDate(new Date(body.tanggal_masuk))
            : currentDate;

        // Persiapkan data dengan nilai default yang aman
        const stokData = {
            kode: body.kode.trim(),
            nama: body.nama.trim(),
            kategori: body.kategori.toLowerCase(),
            sub_kategori_id: parseInt(body.sub_kategori_id),
            stok_masuk: parseInt(body.stok_masuk),
            stok_keluar: 0,
            stok_sisa: parseInt(body.stok_masuk),
            satuan: body.satuan,
            lokasi: body.lokasi.trim(),
            tanggal_entry: currentDate,
            tanggal_masuk: tanggalMasuk,
            tanggal_keluar: null,
            keterangan: body.keterangan?.trim() || null
        };

        // Validasi nilai numerik
        if (isNaN(stokData.sub_kategori_id) || isNaN(stokData.stok_masuk)) {
            return NextResponse.json({
                success: false,
                message: 'Nilai numerik tidak valid'
            }, { status: 400 });
        }

        const query = `
            INSERT INTO stok (
                kode,
                nama,
                kategori,
                sub_kategori_id,
                stok_masuk,
                stok_keluar,
                stok_sisa,
                satuan,
                lokasi,
                tanggal_entry,
                tanggal_masuk,
                tanggal_keluar,
                keterangan
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            stokData.kode,
            stokData.nama,
            stokData.kategori,
            stokData.sub_kategori_id,
            stokData.stok_masuk,
            stokData.stok_keluar,
            stokData.stok_sisa,
            stokData.satuan,
            stokData.lokasi,
            stokData.tanggal_entry,
            stokData.tanggal_masuk,
            stokData.tanggal_keluar,
            stokData.keterangan
        ];

        const [result] = await db.execute(query, values);

        return NextResponse.json({
            success: true,
            message: 'Stok berhasil ditambahkan',
            data: {
                id: (result as any).insertId,
                ...stokData
            }
        });

    } catch (error) {
        console.error('Error in POST /api/stok:', error);

        if (error instanceof Error) {
            if (error.message.includes('Duplicate entry')) {
                return NextResponse.json(
                    { success: false, message: 'Kode stok sudah digunakan' },
                    { status: 400 }
                );
            }
        }

        return NextResponse.json({
            success: false,
            message: 'Gagal menambahkan stok',
            error: process.env.NODE_ENV === 'development'
                ? error instanceof Error ? error.message : 'Unknown error'
                : undefined
        }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const id = req.url.split('/').pop();

        if (!id) {
            return NextResponse.json({
                success: false,
                message: 'ID is required'
            }, { status: 400 });
        }

        const query = 'DELETE FROM stok WHERE id = ?';
        const [result] = await db.execute(query, [id]);

        return NextResponse.json({
            success: true,
            message: 'Data deleted successfully',
            data: result
        });

    } catch (error) {
        console.error('Error in DELETE /api/stok:', error);
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error occurred',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        }, { status: 500 });
    }
}
