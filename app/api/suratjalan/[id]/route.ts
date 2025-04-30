/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket, OkPacket, ResultSetHeader } from 'mysql2';

// Definisi tipe untuk hasil query
type SuratJalanRow = RowDataPacket & {
  id: number;
  tujuan: string;
  nomor_surat: string;
  tanggal: string;
  nomor_kendaraan: string | null;
  no_po: string | null;
  keterangan_proyek: string | null;
  // tambahkan properti lain yang diperlukan
};

type SuratJalanDetailRow = RowDataPacket & {
  id: number;
  surat_jalan_id: number;
  no_urut: number;
  quantity: number;
  unit: string;
  weight: number | null;
  kode_barang: string;
  nama_barang: string;
  // tambahkan properti lain yang diperlukan
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Query untuk mendapatkan detail surat jalan
    const [suratJalanRows] = await db.query(
      `SELECT * FROM surat_jalan WHERE id = ?`,
      [id]
    ) as [SuratJalanRow[], any];

    if (suratJalanRows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Surat Jalan tidak ditemukan' },
        { status: 404 }
      );
    }

    const suratJalan = suratJalanRows[0];

    // Query untuk mendapatkan detail barang
    const [barangRows] = await db.query(
      `SELECT 
        sjd.id,
        sjd.surat_jalan_id,
        sjd.no_urut,
        sjd.quantity as jumlah,
        sjd.unit as satuan,
        sjd.weight as berat,
        sjd.kode_barang as kode,
        sjd.nama_barang as nama
      FROM surat_jalan_detail sjd
      WHERE sjd.surat_jalan_id = ? 
      ORDER BY sjd.no_urut`,
      [id]
    ) as [SuratJalanDetailRow[], any];

    // Transformasi data ke format yang diharapkan
    const transformedBarang = barangRows.map(item => ({
      kode: item.kode,
      nama: item.nama,
      jumlah: Number(item.jumlah),
      satuan: item.satuan,
      berat: item.berat
    }));

    return NextResponse.json({
      success: true,
      data: {
        id: suratJalan.id,
        tujuan: suratJalan.tujuan,
        nomor_surat: suratJalan.nomor_surat,
        tanggal: suratJalan.tanggal,
        nomor_kendaraan: suratJalan.nomor_kendaraan,
        no_po: suratJalan.no_po,
        keterangan_proyek: suratJalan.keterangan_proyek,
        created_at: suratJalan.created_at,
        barang: transformedBarang
      },
    });
  } catch (error) {
    console.error('Error fetching surat jalan detail:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan saat mengambil detail surat jalan',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const { tujuan, nomorSurat, tanggal, nomorKendaraan, noPo, barang, keteranganProyek } = body;

    console.log(`Updating surat jalan ${id} with data:`, { tujuan, nomorSurat, barangLength: barang?.length });

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

    // Periksa apakah surat jalan ada
    const [existingRows] = await db.query(
      `SELECT * FROM surat_jalan WHERE id = ?`,
      [id]
    ) as [SuratJalanRow[], any];

    if (existingRows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Surat Jalan tidak ditemukan' },
        { status: 404 }
      );
    }

    // Mulai transaksi
    await db.query('START TRANSACTION');

    try {
      // Ambil detail surat jalan yang lama untuk memulihkan stok
      const [oldDetails] = await db.query(
        `SELECT kode_barang, quantity FROM surat_jalan_detail WHERE surat_jalan_id = ?`,
        [id]
      ) as [RowDataPacket[], any];
      
      console.log('Original items to restore stock:', oldDetails);

      // Kembalikan stok untuk item lama
      for (const item of oldDetails) {
        const [updateResult] = await db.query(
          `
          UPDATE stok 
          SET 
            stok_keluar = stok_keluar - ?, 
            stok_sisa = stok_sisa + ?
          WHERE kode = ?
          `,
          [item.quantity, item.quantity, item.kode_barang]
        ) as [ResultSetHeader, any];

        if (updateResult.affectedRows === 0) {
          console.warn(`Warning: Could not restore stock for item ${item.kode_barang}. Item may have been deleted.`);
        }
      }

      // Update data surat jalan
      await db.query(
        `
        UPDATE surat_jalan 
        SET tujuan = ?, nomor_surat = ?, tanggal = ?, nomor_kendaraan = ?, no_po = ?, keterangan_proyek = ?
        WHERE id = ?
        `,
        [tujuan, nomorSurat, tanggal, nomorKendaraan ?? null, noPo ?? null, keteranganProyek ?? null, id]
      );

      // Hapus detail lama
      await db.query('DELETE FROM surat_jalan_detail WHERE surat_jalan_id = ?', [id]);

      // Simpan data barang baru dan update stok
      let noUrut = 1;
      for (const item of barang) {
        const { jumlah, satuan, berat, kode, nama } = item;

        // Tambahkan detail surat jalan baru
        await db.query(
          `
          INSERT INTO surat_jalan_detail (surat_jalan_id, no_urut, quantity, unit, weight, kode_barang, nama_barang)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          `,
          [id, noUrut++, jumlah, satuan, berat ?? null, kode, nama]
        );

        // Update stok untuk item baru
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

        if (updateResult.affectedRows === 0) {
          throw new Error(`Stok tidak cukup atau kode barang ${kode} tidak ditemukan`);
        }
      }

      await db.query('COMMIT');

      return NextResponse.json({
        success: true,
        message: 'Surat Jalan berhasil diupdate dan stok diperbarui',
      });
    } catch (error) {
      // Rollback jika ada kesalahan
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error updating surat jalan:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan saat memperbarui surat jalan',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
