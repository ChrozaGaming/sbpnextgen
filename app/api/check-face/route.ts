import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'face_recognition'
};

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const FACE_MATCH_THRESHOLD = 0.6;
const EXPECTED_DESCRIPTOR_LENGTH = 128;

function createResponse(data: any, status: number = 200) {
    return NextResponse.json(data, { status, headers: corsHeaders });
}

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

function normalizeDescriptor(descriptor: number[]): number[] {
    // Ensure descriptor is of correct length
    if (descriptor.length < EXPECTED_DESCRIPTOR_LENGTH) {
        // Pad with zeros if too short
        return [...descriptor, ...new Array(EXPECTED_DESCRIPTOR_LENGTH - descriptor.length).fill(0)];
    }
    if (descriptor.length > EXPECTED_DESCRIPTOR_LENGTH) {
        // Truncate if too long
        return descriptor.slice(0, EXPECTED_DESCRIPTOR_LENGTH);
    }
    return descriptor;
}

function euclideanDistance(a: number[], b: number[]): number {
    // Normalize descriptors to ensure same length
    const normalizedA = normalizeDescriptor(a);
    const normalizedB = normalizeDescriptor(b);

    return Math.sqrt(
        normalizedA.reduce((sum, _, i) => {
            const diff = normalizedA[i] - normalizedB[i];
            return sum + (diff * diff);
        }, 0)
    );
}

function parseDescriptor(data: any): number[][] {
    try {
        // If it's already the correct format
        if (Array.isArray(data) && data.every(item => Array.isArray(item))) {
            return data.map(desc => normalizeDescriptor(desc));
        }

        // If it's a single array
        if (Array.isArray(data) && typeof data[0] === 'number') {
            return [normalizeDescriptor(data)];
        }

        // If it's a string
        if (typeof data === 'string') {
            const parsed = JSON.parse(data);
            return Array.isArray(parsed[0]) ?
                parsed.map(desc => normalizeDescriptor(desc)) :
                [normalizeDescriptor(parsed)];
        }

        // If it's an object
        if (data && typeof data === 'object') {
            const values = Object.values(data);
            return values.map(desc =>
                Array.isArray(desc) ? normalizeDescriptor(desc) : normalizeDescriptor(Object.values(desc))
            );
        }

        throw new Error('Invalid descriptor format');
    } catch (error) {
        console.error('Descriptor parsing error:', error);
        return [];
    }
}

export async function POST(request: NextRequest) {
    let connection;
    console.log('Starting face verification...');

    try {
        const data = await request.json();
        const { faceDescriptor } = data;

        if (!Array.isArray(faceDescriptor)) {
            return createResponse({
                success: false,
                message: 'Invalid input descriptor format'
            }, 400);
        }

        const normalizedInput = normalizeDescriptor(faceDescriptor);
        console.log('Normalized input descriptor length:', normalizedInput.length);

        connection = await mysql.createConnection(dbConfig);
        console.log('Database connected');

        const [rows] = await connection.execute(
            'SELECT id, nama, email, face_descriptors FROM deteksiwajah WHERE status = "active"'
        );

        if (!Array.isArray(rows) || rows.length === 0) {
            return createResponse({
                success: false,
                message: 'No registered faces found'
            });
        }

        console.log(`Processing ${rows.length} registered faces`);

        for (const row of rows as any[]) {
            try {
                console.log(`Processing face ID: ${row.id}`);

                const storedDescriptors = parseDescriptor(row.face_descriptors);
                if (storedDescriptors.length === 0) {
                    console.log(`Invalid stored descriptor for ID: ${row.id}`);
                    continue;
                }

                for (const storedDescriptor of storedDescriptors) {
                    const distance = euclideanDistance(normalizedInput, storedDescriptor);
                    console.log(`Distance for ID ${row.id}:`, distance);

                    if (distance < FACE_MATCH_THRESHOLD) {
                        console.log(`Match found! ID: ${row.id}, Name: ${row.nama}`);
                        return createResponse({
                            success: true,
                            message: 'Face match found',
                            data: {
                                id: row.id,
                                nama: row.nama,
                                email: row.email,
                                confidence: Math.max(0, 1 - (distance / FACE_MATCH_THRESHOLD))
                            }
                        });
                    }
                }
            } catch (error) {
                console.error(`Error processing face ${row.id}:`, error);
                continue;
            }
        }

        return createResponse({
            success: false,
            message: 'No matching face found'
        });

    } catch (error) {
        console.error('Server error:', error);
        return createResponse({
            success: false,
            message: 'Server error occurred',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, 500);

    } finally {
        if (connection) {
            await connection.end();
            console.log('Database connection closed');
        }
    }
}
