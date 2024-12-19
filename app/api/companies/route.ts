import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Menggunakan connection pool dari lib/db.ts
        const [companies] = await db.query<any[]>(
            'SELECT DISTINCT nama_perusahaan FROM rekap_po WHERE nama_perusahaan IS NOT NULL ORDER BY nama_perusahaan'
        );

        // Log untuk debugging
        console.log('Successfully fetched companies:', companies);

        return NextResponse.json(companies, {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                // CORS headers jika diperlukan
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        });

    } catch (error) {
        // Log error untuk debugging
        console.error('Error fetching companies:', error);

        // Return error response
        return NextResponse.json(
            {
                error: 'Failed to fetch companies',
                message: error instanceof Error ? error.message : 'Unknown error occurred',
            },
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            }
        );
    }
}

// Handle OPTIONS request jika diperlukan untuk CORS
export async function OPTIONS() {
    return NextResponse.json(
        {},
        {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        }
    );
}

// Tipe data untuk memastikan type safety
interface Company {
    nama_perusahaan: string;
}

// Rate limiting configurations (opsional)
const RATE_LIMIT = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
};

// Tambahkan validasi dan sanitasi jika diperlukan
const validateResponse = (companies: Company[]) => {
    return companies.filter(company =>
        company.nama_perusahaan &&
        typeof company.nama_perusahaan === 'string' &&
        company.nama_perusahaan.length > 0
    );
};

// Export type untuk digunakan di komponen React
export type { Company };