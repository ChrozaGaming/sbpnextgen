import { NextRequest, NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2';
import { db } from '@/lib/db';

// Interface untuk data absensi
interface AttendanceRecord extends RowDataPacket {
  user_id: number;
  tanggal: string;
  waktu_absen: string | null;
  status: string;
  keterangan: string | null;
}

// Interface untuk request data (filter berdasarkan bulan/tahun)
interface MonthYearRequest {
  month: number;
  year: number;
}

// Interface untuk request data (filter berdasarkan rentang tanggal)
interface DateRangeRequest {
  startDate: string;
  endDate: string;
}

// Interface untuk data user - sesuai dengan struktur tabel users
interface User extends RowDataPacket {
  userId: number;
  username: string;
  name: string;
  role: string;
}

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    let startDate: string, endDate: string;

    // Mengambil rentang tanggal berdasarkan bulan/tahun atau tanggal spesifik
    if ('month' in requestData && 'year' in requestData) {
      const { month, year } = requestData as MonthYearRequest;
      // Membuat rentang tanggal untuk bulan dan tahun yang dipilih
      const lastDay = new Date(year, month, 0).getDate();
      startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;
      console.log(`Menggunakan filter bulan: ${month}/${year}, rentang: ${startDate} - ${endDate}`);
    } else if ('startDate' in requestData && 'endDate' in requestData) {
      const dateRange = requestData as DateRangeRequest;
      startDate = dateRange.startDate;
      endDate = dateRange.endDate;
      console.log(`Menggunakan filter rentang tanggal: ${startDate} - ${endDate}`);
    } else {
      return NextResponse.json({ error: 'Parameter tidak valid' }, { status: 400 });
    }

    // 1. Ambil semua tanggal dalam rentang yang ditentukan
    const dates: string[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    while (current <= end) {
      // Hanya tambahkan hari kerja (Senin-Jumat)
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 = Minggu, 6 = Sabtu
        dates.push(current.toISOString().split('T')[0]);
      }
      current.setDate(current.getDate() + 1);
    }

    // 2. Ambil data absensi
    const [attendanceRecords] = await db.query<AttendanceRecord[]>(
      `SELECT a.user_id, a.tanggal, a.status, a.waktu_absen, a.keterangan
       FROM absensipegawai a
       WHERE a.tanggal BETWEEN ? AND ?`,
      [startDate, endDate]
    );
    if (attendanceRecords.length > 0) {
      console.log("Raw attendance data dari DB (sample):", 
        attendanceRecords.slice(0, 5).map(r => ({
          user_id: r.user_id,
          tanggal: r.tanggal,
          status: r.status,
          waktu_absen: r.waktu_absen
        }))
      );
    }

    // 3. Ambil data user - menggunakan kolom role langsung
    const [users] = await db.query<User[]>(
      `SELECT u.id as userId, u.username, u.name, u.role
       FROM users u
       WHERE u.username != ''
       ORDER BY u.name ASC`
    );

    // 4. Format data
    const attendanceData = users.map((user) => {
      // Buat template attendance untuk semua tanggal
      const attendance = dates.map(date => {
        // Cari record absensi untuk user dan tanggal ini
        const record = attendanceRecords.find(
          (r) => 
            r.user_id === user.userId && 
            new Date(r.tanggal).toISOString().split('T')[0] === date
        );

        // Jika ada record, gunakan datanya. Jika tidak, set sebagai 'alpha'
        return {
          date,
          status: record ? record.status : 'alpha',
          waktuAbsen: record ? record.waktu_absen : null,
          keterangan: record ? record.keterangan : null
        };
      });

      return {
        userId: user.userId,
        username: user.username,
        name: user.name,
        role: user.role || 'User', // Default jika role kosong
        attendance
      };
    });

    // Log sample dari data yang akan dikirim untuk debugging
    if (attendanceData.length > 0) {
      console.log("Sample formatted data untuk user pertama:", {
        name: attendanceData[0].name,
        sampleAttendance: attendanceData[0].attendance.slice(0, 3)
      });
    }

    return NextResponse.json({ dates, attendanceData });
  } catch (error) {
    console.error('Error in attendance recap API:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memproses data absensi' },
      { status: 500 }
    );
  }
}
