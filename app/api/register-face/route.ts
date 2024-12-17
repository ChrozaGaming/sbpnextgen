// app/api/register-face/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import mysql from 'mysql2/promise';
import { existsSync } from 'fs';
import { getServerSession } from 'next-auth/next'; // Jika menggunakan NextAuth
import { verifyToken } from '@/lib/auth'; // Custom auth helper

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

async function createDirIfNotExists(dir: string) {
    if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
    }
}

export async function POST(request: NextRequest) {
    let connection;
    try {
        // Validasi authorization
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Verifikasi token
        const token = authHeader.replace('Bearer ', '');
        const userData = await verifyToken(token);
        if (!userData) {
            return NextResponse.json(
                { success: false, message: 'Invalid token' },
                { status: 401 }
            );
        }

        // Parse form data
        const formData = await request.formData();
        const descriptors = formData.get('descriptors');

        if (!descriptors) {
            return NextResponse.json(
                { success: false, message: 'Data wajah tidak ditemukan' },
                { status: 400 }
            );
        }

        // Gunakan data user dari token
        const { username, email } = userData;

        // Buat direktori untuk menyimpan gambar wajah
        const userDir = join(process.cwd(), 'public', 'faces', email.replace('@', '_at_'));
        await createDirIfNotExists(userDir);

        // Proses dan simpan gambar wajah
        const faceImages: string[] = [];
        const savedFiles: Promise<void>[] = [];

        for (const [key, value] of formData.entries()) {
            if (key.startsWith('face_') && value instanceof Blob) {
                const fileName = `${Date.now()}_${key}.jpg`;
                const filePath = join(userDir, fileName);
                const buffer = Buffer.from(await value.arrayBuffer());

                savedFiles.push(writeFile(filePath, buffer));
                faceImages.push(`faces/${email.replace('@', '_at_')}/${fileName}`);
            }
        }

        await Promise.all(savedFiles);

        // Koneksi ke database
        connection = await mysql.createConnection(dbConfig);

        // Cek apakah user sudah terdaftar di sistem face recognition
        const [existingUsers] = await connection.execute(
            'SELECT id FROM deteksiwajah WHERE email = ?',
            [email]
        );

        if (Array.isArray(existingUsers) && existingUsers.length > 0) {
            return NextResponse.json(
                { success: false, message: 'Wajah sudah terdaftar untuk email ini' },
                { status: 409 }
            );
        }

        // Simpan ke database
        await connection.execute(
            `INSERT INTO deteksiwajah (
                nama, 
                email, 
                face_images, 
                face_descriptors,
                training_count,
                confidence_score,
                status,
                created_at,
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())`,
            [
                username,
                email,
                JSON.stringify(faceImages),
                descriptors,
                faceImages.length,
                1.0
            ]
        );

        return NextResponse.json({
            success: true,
            message: 'Registrasi wajah berhasil',
            data: {
                nama: username,
                email,
                imageCount: faceImages.length
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Terjadi kesalahan internal server',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            },
            { status: 500 }
        );

    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

export async function OPTIONS() {
    return NextResponse.json(
        {},
        {
            headers: {
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Origin': '*'
            }
        }
    );
}
