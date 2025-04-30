/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { createToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const [rows] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    ) as any[];

    const user = rows[0];
    if (!user || !await bcrypt.compare(password, user.password)) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    const userPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
      name: user.name,
    };

    const token = createToken(userPayload);

    const response = NextResponse.json({ success: true, user: userPayload });
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}