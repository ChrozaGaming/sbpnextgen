/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/absensipegawai/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyTokenNode } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Dapatkan token dari cookie
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Verifikasi token untuk mendapatkan user
    const user = verifyTokenNode(token);
    if (!user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;
    const { keterangan } = await req.json();

    // Dapatkan tanggal dan waktu hari ini
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const currentTime = now.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // Cek apakah user sudah absen hari ini
    const [existingRows] = await db.query(
      `SELECT * FROM absensipegawai 
       WHERE user_id = ? 
       AND tanggal = ?`,
      [userId, today]
    );

    const existingAbsensi = existingRows as any[];
    if (existingAbsensi && existingAbsensi.length > 0) {
      return NextResponse.json(
        { message: "Anda sudah melakukan absensi hari ini" },
        { status: 400 }
      );
    }

    // Menentukan status absensi berdasarkan waktu
    // Menentukan status absensi berdasarkan waktu
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Cek apakah dalam jam kerja
    if (hours < 7 || hours > 17) {
      return NextResponse.json(
        {
          message: "Absensi hanya dapat dilakukan pada jam kerja (07:00-17:00)",
        },
        { status: 400 }
      );
    }

    let status = "hadir";
    if ((hours === 9 && minutes > 30) || hours > 9) {
      status = "terlambat";
      // Keterangan wajib diisi jika terlambat
      if (!keterangan || keterangan.trim() === "") {
        return NextResponse.json(
          { message: "Keterangan wajib diisi karena Anda terlambat" },
          { status: 400 }
        );
      }
    }

    // Simpan data absensi
    const [result] = await db.query(
      `INSERT INTO absensipegawai 
       (user_id, keterangan, status, tanggal, waktu_absen) 
       VALUES (?, ?, ?, ?, ?)`,
      [userId, keterangan ?? "", status, today, currentTime]
    );

    const insertResult = result as any;

    return NextResponse.json({
      message: "Absensi berhasil dicatat",
      status: status,
      data: {
        id: insertResult.insertId,
        userId: userId,
        keterangan: keterangan ?? "",
        status: status,
        tanggal: today,
        waktuAbsen: currentTime,
      },
    });
  } catch (error) {
    console.error("Error recording absensi:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat mencatat absensi" },
      { status: 500 }
    );
  }
}
