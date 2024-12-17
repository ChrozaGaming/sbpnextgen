import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sbp'
};

export async function GET() {
    try {
        const connection = await mysql.createConnection(dbConfig);

        const [rows] = await connection.execute(
            'SELECT name, email, face_images FROM users'
        );

        await connection.end();

        // Pastikan rows tidak null dan parse face_images
        const users = Array.isArray(rows) ? rows.map((user: any) => ({
            ...user,
            face_images: typeof user.face_images === 'string'
                ? JSON.parse(user.face_images)
                : user.face_images
        })) : [];

        return NextResponse.json({ users });
    } catch (error) {
        console.error('Error fetching registered faces:', error);
        return NextResponse.json({ users: [] }); // Return empty array instead of error
    }
}
