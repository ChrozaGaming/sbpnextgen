/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket, OkPacket, ResultSetHeader } from 'mysql2';

// Definisi tipe untuk hasil query
type QueryResultRow = RowDataPacket & {
  id: number;
  tujuan: string;
  nomor_surat: string;
  tanggal: string;
  // tambahkan properti lain sesuai kebutuhan
};

export async function GET() {
  try {
    const [suratJalanRows] = await db.query(`
      SELECT sj.*, 
      (SELECT COUNT(*) FROM surat_jalan_detail WHERE surat_jalan_id = sj.id) as jumlah_barang
      FROM surat_jalan sj
      ORDER BY sj.tanggal DESC
    `) as [QueryResultRow[], any];

    // Gunakan tipe spesifik untuk hasil query
    return NextResponse.json({
      success: true,
      data: suratJalanRows,
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
