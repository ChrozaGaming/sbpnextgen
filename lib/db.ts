// lib/db.ts

import mysql from 'mysql2/promise';

export const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


// Test koneksi
const testConnection = async () => {
    try {
        const connection = await db.getConnection();
        console.log('Database connected successfully!');
        connection.release();
        return true;
    } catch (error) {
        console.error('Database connection error:', error);
        return false;
    }
};

// Export fungsi test koneksi untuk digunakan di API
export { db, testConnection };
