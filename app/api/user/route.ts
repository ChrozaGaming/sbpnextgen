// app/api/user/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return NextResponse.json(
                { message: 'Token tidak ditemukan' },
                { status: 401 }
            );
        }

        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        const [userId, userEmail] = decoded.split(':');

        if (!userId || !userEmail) {
            return NextResponse.json(
                { message: 'Token tidak valid' },
                { status: 401 }
            );
        }

        // Update query untuk mengambil role
        const [rows] = await db.execute(
            'SELECT id, username, email, role FROM users WHERE id = ? AND email = ?',
            [userId, userEmail]
        ) as any[];

        const user = rows[0];

        if (!user) {
            return NextResponse.json(
                { message: 'User tidak ditemukan' },
                { status: 404 }
            );
        }

        // Kembalikan data user termasuk role
        return NextResponse.json({
            success: true,
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
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
