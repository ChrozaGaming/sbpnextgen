import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { generateMultiCopyPDF } from '@/utils/pdfGenerator';
import { FormData, BarangItem } from '@/types/suratJalan';
import { NextResponse } from 'next/server';

interface SuratJalan extends RowDataPacket {
    id: number;
    noSurat: string;
    tanggal: string;
    noPO: string;
    noKendaraan: string;
    ekspedisi: string;
    username: string;
}

interface Barang extends RowDataPacket {
    id: number;
    surat_jalan_id: number;
    jumlah: string;
    kemasan: string;
    kode: string;
    nama: string;
    keterangan: string;
}

function formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const conn = await db.getConnection();

    try {
        // Validasi ID
        if (!params.id) {
            return NextResponse.json(
                { success: false, error: 'ID tidak valid' },
                { status: 400 }
            );
        }

        // Ambil data surat jalan
        const [suratJalanRows] = await conn.query<SuratJalan[]>(
            `SELECT sj.*, u.username
             FROM surat_jalan sj
             LEFT JOIN users u ON sj.user_id = u.id
             WHERE sj.id = ?`,
            [params.id]
        );

        if (!suratJalanRows || suratJalanRows.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Surat jalan tidak ditemukan' },
                { status: 404 }
            );
        }

        // Ambil data barang
        const [barangRows] = await conn.query<Barang[]>(
            'SELECT * FROM barang WHERE suratJalan_id = ?',
            [params.id]
        );

        const suratJalan = suratJalanRows[0];

        // Konversi data ke format yang dibutuhkan oleh generateMultiCopyPDF
        const formData: FormData = {
            noSurat: suratJalan.noSurat,
            tanggal: formatDate(suratJalan.tanggal),
            noPO: suratJalan.noPO,
            noKendaraan: suratJalan.noKendaraan,
            ekspedisi: suratJalan.ekspedisi
        };

        const barangList: BarangItem[] = barangRows.map((item, index) => ({
            no: (index + 1).toString(),
            jumlah: item.jumlah,
            kemasan: item.kemasan,
            kode: item.kode,
            nama: item.nama,
            keterangan: item.keterangan || ''
        }));

        try {
            // Generate PDF dengan 3 copy (Kantor, Driver, Customer)
            const doc = generateMultiCopyPDF(formData, barangList, suratJalan.username);
            const pdfBuffer = await doc.output('arraybuffer');

            // Return PDF dengan filename yang sesuai
            return new Response(pdfBuffer, {
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `inline; filename="SJ_${suratJalan.noSurat}_${formatDate(suratJalan.tanggal)}_MULTI.pdf"`,
                    'Cache-Control': 'no-cache'
                },
            });

        } catch (pdfError) {
            console.error('PDF Generation Error:', pdfError);
            return NextResponse.json(
                {
                    success: false,
                    error: 'Gagal generate PDF',
                    details: pdfError instanceof Error ? pdfError.message : 'Unknown error'
                },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Gagal mengambil data',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    } finally {
        conn.release();
    }
}