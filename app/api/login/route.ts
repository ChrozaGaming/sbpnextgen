/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/login/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

// Fungsi validasi email sederhana
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Hanya tampilkan log pada lingkungan development
    if (process.env.NODE_ENV === 'development') {
      console.log('Received request body:', body);
    }

    const { email, password } = body;

    // Validasi email dan password
    if (!email || email.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Email tidak boleh kosong' },
        { status: 400 }
      );
    }

    // Validasi format email
    if (!isValidEmail(email.trim())) {
      return NextResponse.json(
        { success: false, message: 'Format email tidak valid' },
        { status: 400 }
      );
    }

    if (!password || password.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Password tidak boleh kosong' },
        { status: 400 }
      );
    }

    // Query menggunakan email
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email.trim()]
    ) as any[];

    // Hanya tampilkan log pada lingkungan development
    if (process.env.NODE_ENV === 'development') {
      console.log('Database response:', rows);
    }

    const user = rows?.[0];

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Email atau password salah' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Email atau password salah' },
        { status: 401 }
      );
    }

    const token = Buffer.from(`${user.id}:${user.email}`).toString('base64');

    // Buat response dengan token
    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil',
      token,
      userId: user.id,
      username: user.username,
      email: user.email
    });

    // Atur cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 7 * 24 * 60 * 60, // 7 hari dalam detik
      path: '/'
    };

    // Atur token dalam cookies - dengan await untuk mengatasi Promise
    const cookieStore = await cookies();
    cookieStore.set('token', token, cookieOptions);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan server',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handler untuk OPTIONS request (mendukung CORS)
export async function OPTIONS() {
  const response = NextResponse.json({}, { status: 200 });
  
  // Atur header CORS
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return response;
}
