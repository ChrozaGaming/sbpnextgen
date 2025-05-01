// app/api/user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyTokenNode } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Ambil cookie auth_token
    const authToken = request.cookies.get('auth_token')?.value;

    if (!authToken) {
      return NextResponse.json(
        { success: false, message: 'Tidak terautentikasi' },
        { status: 401 }
      );
    }

    // Verifikasi token
    const userData = verifyTokenNode(authToken);
    
    if (!userData) {
      return NextResponse.json(
        { success: false, message: 'Token tidak valid' },
        { status: 401 }
      );
    }

    // Kembalikan data pengguna
    return NextResponse.json({
      success: true,
      user: userData
    });
  } catch (error) {
    console.error('Error in user API:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
