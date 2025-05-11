// app/api/absensipegawai/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyTokenNode } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // Dapatkan token dari cookie
    const token = req.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Verifikasi token untuk mendapatkan user
    const user = verifyTokenNode(token);
    if (!user || !user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = user.id;
    
    // Dapatkan tanggal hari ini dalam format YYYY-MM-DD
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Query untuk memeriksa apakah pengguna sudah absen hari ini
    // Menggunakan kolom tanggal bukan created_at
    const [rows] = await db.query(
      `SELECT * FROM absensipegawai 
       WHERE user_id = ? 
       AND tanggal = ? 
       ORDER BY waktu_absen DESC 
       LIMIT 1`,
      [userId, today]
    );
    
    const absensiList = rows as any[];
    
    if (absensiList && absensiList.length > 0) {
      const absensi = absensiList[0];
      
      // Format waktu absensi
      const waktuAbsen = absensi.waktu_absen 
        ? new Date(`1970-01-01T${absensi.waktu_absen}`).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
          })
        : '';
      
      // Kembalikan respons bahwa sudah absen
      return NextResponse.json({
        sudahAbsen: true,
        tanggal: absensi.tanggal,
        waktu: waktuAbsen,
        status: absensi.status
      });
    } else {
      // Pengguna belum absen hari ini
      return NextResponse.json({
        sudahAbsen: false
      });
    }
    
  } catch (error) {
    console.error('Error checking absensi status:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat memeriksa status absensi' },
      { status: 500 }
    );
  }
}
