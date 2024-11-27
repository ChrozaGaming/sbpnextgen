// lib/db.ts
import mysql from 'mysql2/promise';

// Buat pool connection
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Export pool sebagai named export
export const db = pool;

// Optional: helper function
export async function executeQuery<T>(
    query: string,
    params: any[] = []
): Promise<T> {
    try {
        const [rows] = await pool.execute(query, params);
        return rows as T;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}
