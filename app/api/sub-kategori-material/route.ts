/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const kategori = searchParams.get('kategori');
    const brand = searchParams.get('brand');
    const satuan = searchParams.get('satuan');
    const status = searchParams.get('status');

    let query = `
            SELECT 
                skm.*,
                km.nama as kategori_nama
            FROM sub_kategori_material skm
            LEFT JOIN kategori_material km ON skm.kategori_id = km.id
            WHERE 1=1
        `;

    const queryParams: any[] = [];

    if (search) {
      query += ` AND (skm.kode_item LIKE ? OR skm.nama LIKE ?)`;
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (kategori) {
      query += ` AND km.nama = ?`;
      queryParams.push(kategori);
    }

    if (brand) {
      query += ` AND skm.brand = ?`;
      queryParams.push(brand);
    }

    if (satuan) {
      query += ` AND skm.satuan = ?`;
      queryParams.push(satuan);
    }

    if (status) {
      query += ` AND skm.status = ?`;
      queryParams.push(status);
    }

    const [countResult] = await db.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM (${query}) as count_table`,
      queryParams
    );

    const total = countResult[0]?.total ?? 0;

    query += ` ORDER BY skm.updated_at DESC LIMIT ? OFFSET ?`;
    queryParams.push(limit, (page - 1) * limit);

    const [rows] = await db.query<RowDataPacket[]>(query, queryParams);

    return NextResponse.json({
      success: true,
      data: rows,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        pageSize: limit
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const requiredFields = ['kategori_id', 'kode_item', 'nama', 'satuan'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            success: false,
            message: `Field ${field} is required`
          },
          { status: 400 }
        );
      }
    }

    const validSatuan = ['kg', 'kgset', 'pail', 'galon5liter', 'galon10liter',
      'pcs', 'lonjor', 'liter', 'literset', 'sak', 'unit'];
    if (!validSatuan.includes(body.satuan.toLowerCase())) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid satuan value'
        },
        { status: 400 }
      );
    }

    const brand = body.brand ? body.brand.trim() : null;

    const [existing] = await db.query<RowDataPacket[]>(
      'SELECT id FROM sub_kategori_material WHERE kode_item = ?',
      [body.kode_item.trim()]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Kode item already exists'
        },
        { status: 400 }
      );
    }

    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO sub_kategori_material (
                kategori_id,
                kode_item,
                nama,
                brand,
                satuan,
                status,
                keterangan
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        body.kategori_id,
        body.kode_item.trim(),
        body.nama.trim(),
        brand,
        body.satuan.toLowerCase(),
        (body.status || 'aman').toLowerCase(),
        body.keterangan ? body.keterangan.trim() : null
      ]
    );

    const [newRow] = await db.query<RowDataPacket[]>(
      `SELECT 
                skm.*,
                km.nama as kategori_nama
            FROM sub_kategori_material skm
            LEFT JOIN kategori_material km ON skm.kategori_id = km.id
            WHERE skm.id = ?`,
      [result.insertId]
    );

    return NextResponse.json({
      success: true,
      message: 'Sub kategori material berhasil ditambahkan',
      data: newRow[0] ?? null
    });

  } catch (error) {
    console.error('Error in POST /api/stokgudang/sub-kategori-material:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
