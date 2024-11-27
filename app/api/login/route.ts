// app/api/login/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('Received request body:', body); // Debug log

        const { email, password } = body; // Ubah dari username ke email

        // Validasi email dan password
        if (!email || email.trim() === '') {
            return NextResponse.json(
                { message: 'Email tidak boleh kosong' },
                { status: 400 }
            );
        }

        if (!password || password.trim() === '') {
            return NextResponse.json(
                { message: 'Password tidak boleh kosong' },
                { status: 400 }
            );
        }

        // Query menggunakan email
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        ) as any[];

        console.log('Database response:', rows); // Debug log

        const user = rows[0];

        if (!user) {
            return NextResponse.json(
                { message: 'Email atau password salah' },
                { status: 401 }
            );
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { message: 'Email atau password salah' },
                { status: 401 }
            );
        }

        const token = Buffer.from(`${user.id}:${user.email}`).toString('base64');

        return NextResponse.json({
            success: true,
            message: 'Login berhasil',
            token,
            userId: user.id,
            username: user.username,
            email: user.email
        });

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
