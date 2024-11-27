// app/api/register/route.ts
import { db } from '@/lib/db';  // Ubah import ke db
import bcrypt from 'bcryptjs';
import { RowDataPacket } from 'mysql2';

interface UserRow extends RowDataPacket {
    email: string;
}

export async function POST(req: Request) {
    try {
        const { username, email, password } = await req.json();

        const hashedPassword = await bcrypt.hash(password, 10);

        // Query untuk membuat tabel jika belum ada
        await db.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Cek email yang sudah ada
        const [rows] = await db.execute<UserRow[]>(
            'SELECT email FROM users WHERE email = ?',
            [email]
        );

        if (rows.length > 0) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: 'Email sudah terdaftar'
                }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // Insert user baru
        await db.execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Registrasi berhasil'
            }),
            {
                status: 201,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (error) {
        console.error('Registration error:', error);

        return new Response(
            JSON.stringify({
                success: false,
                message: 'Gagal melakukan registrasi',
                error: error instanceof Error ? error.message : 'Unknown error'
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}
