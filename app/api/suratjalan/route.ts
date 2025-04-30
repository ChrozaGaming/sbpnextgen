/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

type QueryResultRow = RowDataPacket & {
  id: number;
  tujuan: string;
  nomor_surat: string;
  tanggal: string;
  no_po: string;
  keterangan_proyek: string;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search') || '';
    const field = searchParams.get('field') || 'nomor_surat';
    const sort = searchParams.get('sort') || 'id';
    const order = (searchParams.get('order') || 'desc').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const offset = (page - 1) * limit;

    // Validasi kolom yang boleh di-sort/filter
    const allowedFields = ['nomor_surat', 'no_po', 'tujuan', 'keterangan_proyek', 'id', 'tanggal'];
    const fieldSafe = allowedFields.includes(field) ? field : 'nomor_surat';
    const sortSafe = allowedFields.includes(sort) ? sort : 'id';

    // Filter query
    let whereClause = '';
    let params: any[] = [];
    if (search) {
      whereClause = `WHERE ${fieldSafe} LIKE ?`;
      params.push(`%${search}%`);
    }

    // Hitung total data untuk pagination
    const [countRows] = await db.query(
      `SELECT COUNT(*) as total FROM surat_jalan ${whereClause}`,
      params
    ) as [RowDataPacket[], any];
    const totalItems = countRows[0]?.total || 0;
    const totalPages = Math.ceil(totalItems / limit) || 1;

    // Query data
    const [suratJalanRows] = await db.query(
      `
        SELECT sj.*, 
        (SELECT COUNT(*) FROM surat_jalan_detail WHERE surat_jalan_id = sj.id) as jumlah_barang
        FROM surat_jalan sj
        ${whereClause}
        ORDER BY sj.${sortSafe} ${order}
        LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    ) as [QueryResultRow[], any];

    return NextResponse.json({
      success: true,
      data: suratJalanRows,
      pagination: {
        totalPages,
        currentPage: page,
        totalItems,
      },
    });
  } catch (error) {
    console.error('Error fetching surat jalan:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan saat mengambil data surat jalan',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Ambil data dari body request
    const body = await request.json();
    const { tujuan, nomorSurat, tanggal, nomorKendaraan, noPo, barang, keteranganProyek } = body;

    console.log("Received data:", { tujuan, nomorSurat, tanggal, barangLength: barang?.length });

    // Validasi data input
    if (!tujuan || !nomorSurat || !tanggal || !Array.isArray(barang) || barang.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Data surat jalan tidak lengkap',
          missing: {
            tujuan: !tujuan,
            nomorSurat: !nomorSurat,
            tanggal: !tanggal,
            barang: !Array.isArray(barang) || barang.length === 0
          }
        },
        { status: 400 }
      );
    }

    // Mulai transaksi
    await db.query('START TRANSACTION');

    try {
      // Simpan data surat jalan
      const [suratJalanResult] = await db.query(
        `
          INSERT INTO surat_jalan (tujuan, nomor_surat, tanggal, nomor_kendaraan, no_po, keterangan_proyek)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        [tujuan, nomorSurat, tanggal, nomorKendaraan ?? null, noPo ?? null, keteranganProyek ?? null]
      ) as [ResultSetHeader, any];

      const suratJalanId = suratJalanResult.insertId;

      // Simpan data barang dan update stok
      let noUrut = 1;
      for (const item of barang) {
        const { jumlah, satuan, berat, kode, nama } = item;

        // Tambahkan detail surat jalan
        await db.query(
          `
          INSERT INTO surat_jalan_detail (surat_jalan_id, no_urut, quantity, unit, weight, kode_barang, nama_barang)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          `,
          [suratJalanId, noUrut++, jumlah, satuan, berat ?? null, kode, nama]
        );

        // Update stok - tambahkan stok_keluar dan kurangi stok_sisa
        const [updateResult] = await db.query(
          `
          UPDATE stok 
          SET 
            stok_keluar = stok_keluar + ?, 
            stok_sisa = stok_sisa - ?,
            tanggal_keluar = CURRENT_DATE()
          WHERE kode = ? AND stok_sisa >= ?
          `,
          [jumlah, jumlah, kode, jumlah]
        ) as [ResultSetHeader, any];

        // Periksa jika stok berhasil diperbarui
        if (updateResult.affectedRows === 0) {
          // Stok tidak cukup atau kode barang tidak ditemukan
          throw new Error(`Stok tidak cukup atau kode barang ${kode} tidak ditemukan`);
        }
      }

      await db.query('COMMIT');

      return NextResponse.json({
        success: true,
        message: 'Surat Jalan berhasil disimpan dan stok berhasil diperbarui',
        id: suratJalanId,
      });
    } catch (error) {
      // Rollback jika ada kesalahan
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error creating surat jalan:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan saat menyimpan surat jalan',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID surat jalan tidak ditemukan' },
        { status: 400 }
      );
    }

    // Mulai transaksi
    await db.query('START TRANSACTION');

    try {
      // Ambil detail surat jalan untuk memulihkan stok
      const [details] = await db.query(
        'SELECT kode_barang, quantity FROM surat_jalan_detail WHERE surat_jalan_id = ?', 
        [id]
      ) as [RowDataPacket[], any];

      // Kembalikan stok untuk setiap barang
      for (const detail of details) {
        await db.query(
          `
          UPDATE stok 
          SET 
            stok_keluar = stok_keluar - ?, 
            stok_sisa = stok_sisa + ?
          WHERE kode = ?
          `,
          [detail.quantity, detail.quantity, detail.kode_barang]
        );
      }

      // Hapus detail surat jalan
      await db.query('DELETE FROM surat_jalan_detail WHERE surat_jalan_id = ?', [id]);
      
      // Hapus surat jalan
      await db.query('DELETE FROM surat_jalan WHERE id = ?', [id]);

      await db.query('COMMIT');

      return NextResponse.json({
        success: true,
        message: 'Surat Jalan berhasil dihapus dan stok dipulihkan',
      });
    } catch (error) {
      // Rollback jika ada kesalahan
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error deleting surat jalan:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan saat menghapus surat jalan',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
