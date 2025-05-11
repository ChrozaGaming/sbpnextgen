import { NextRequest, NextResponse } from 'next/server';
import { createPool } from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';
import { cookies } from 'next/headers';
import { decodeJwt } from '@/lib/jwt';

// Konfigurasi database
const db = createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sbp',
  port: parseInt(process.env.DB_PORT || '3306')
});

export async function GET(request: NextRequest) {
  try {
    // Get user from cookie
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Anda tidak memiliki akses' },
        { status: 401 }
      );
    }

    // Decode token to get user ID
    const userData = decodeJwt(token);

    if (!userData || !userData.userId) {
      return NextResponse.json(
        { error: 'Token tidak valid' },
        { status: 401 }
      );
    }

    const userId = userData.userId;

    // Query to get attendance statistics
    const query = `
      SELECT 
        SUM(CASE WHEN status = 'hadir' THEN 1 ELSE 0 END) as hadir,
        SUM(CASE WHEN status = 'terlambat' THEN 1 ELSE 0 END) as terlambat,
        SUM(CASE WHEN status = 'alpha' THEN 1 ELSE 0 END) as alpha
      FROM absensi
      WHERE user_id = ?
    `;

    const [rows] = await db.query<RowDataPacket[]>(query, [userId]);
    
    if (!rows || rows.length === 0) {
      return NextResponse.json({ hadir: 0, terlambat: 0, alpha: 0 });
    }

    const stats = rows[0];
    
    return NextResponse.json({
      hadir: stats.hadir || 0,
      terlambat: stats.terlambat || 0,
      alpha: stats.alpha || 0
    });
  } catch (error) {
    console.error('Error getting attendance statistics:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil statistik absensi' },
      { status: 500 }
    );
  }
}
