// app/api/user/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
    try {
        // Ambil token dari header
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Ekstrak token
        const token = authHeader.split(' ')[1];

        if (!token) {
            return NextResponse.json(
                { message: 'Token tidak ditemukan' },
                { status: 401 }
            );
        }

        // Decode token (format: base64 dari `${user.id}:${user.email}`)
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        const [userId, userEmail] = decoded.split(':');

        if (!userId || !userEmail) {
            return NextResponse.json(
                { message: 'Token tidak valid' },
                { status: 401 }
            );
        }

        // Query database untuk mendapatkan data user
        const [rows] = await db.execute(
            'SELECT id, username, email FROM users WHERE id = ? AND email = ?',
            [userId, userEmail]
        ) as any[];

        const user = rows[0];

        if (!user) {
            return NextResponse.json(
                { message: 'User tidak ditemukan' },
                { status: 404 }
            );
        }

        // Kembalikan data user (tanpa password)
        return NextResponse.json({
            id: user.id,
            username: user.username,
            email: user.email
        });

    } catch (error) {
        console.error('Error fetching user data:', error);
        return NextResponse.json(
            {
                message: 'Terjadi kesalahan server',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
