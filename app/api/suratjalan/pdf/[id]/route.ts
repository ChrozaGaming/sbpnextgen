import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { generatePDF } from '@/utils/pdfGenerator';
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
    // Pastikan params.id tersedia
    const id = await Promise.resolve(params.id);

    try {
        // Ambil data surat jalan
        const [suratJalan] = await db.query(
            'SELECT sj.*, u.username FROM surat_jalan sj ' +
            'JOIN users u ON sj.user_id = u.id ' +
            'WHERE sj.id = ?',
            [id]
        );

        // Ambil data barang
        const [barangList] = await db.query(
            'SELECT * FROM barang WHERE suratJalan_id = ?',
            [id]
        );

        if (!Array.isArray(suratJalan) || suratJalan.length === 0) {
            return NextResponse.json(
                { error: 'Surat jalan tidak ditemukan' },
                { status: 404 }
            );
        }

        // Buat PDF
        const doc = new PDFDocument();
        const chunks: Buffer[] = [];

        doc.on('data', chunk => chunks.push(chunk));

        // Konten PDF
        doc.fontSize(16).text('SURAT JALAN', { align: 'center' });
        doc.moveDown();

        // Info surat jalan
        doc.fontSize(12);
        doc.text(`No Surat: ${suratJalan[0].noSurat}`);
        doc.text(`Tanggal: ${new Date(suratJalan[0].tanggal).toLocaleDateString('id-ID')}`);
        doc.text(`No PO: ${suratJalan[0].noPO}`);
        doc.text(`No Kendaraan: ${suratJalan[0].noKendaraan}`);
        doc.text(`Ekspedisi: ${suratJalan[0].ekspedisi}`);
        doc.moveDown();

        // Tabel barang
        doc.text('Daftar Barang:', { underline: true });
        doc.moveDown();

        // Header tabel
        const tableTop = doc.y;
        const itemX = 50;
        const columnSpacing = 80;

        doc.text('No', itemX, tableTop);
        doc.text('Kode', itemX + columnSpacing, tableTop);
        doc.text('Nama', itemX + columnSpacing * 2, tableTop);
        doc.text('Jumlah', itemX + columnSpacing * 3, tableTop);
        doc.text('Kemasan', itemX + columnSpacing * 4, tableTop);

        let y = tableTop + 20;

        // Isi tabel
        (barangList as any[]).forEach((item, index) => {
            doc.text(String(index + 1), itemX, y);
            doc.text(item.kode, itemX + columnSpacing, y);
            doc.text(item.nama, itemX + columnSpacing * 2, y);
            doc.text(item.jumlah, itemX + columnSpacing * 3, y);
            doc.text(item.kemasan, itemX + columnSpacing * 4, y);
            y += 20;
        });

        // Tanda tangan
        doc.moveDown(4);
        doc.text('Dibuat oleh:', { align: 'right' });
        doc.moveDown(3);
        doc.text(suratJalan[0].username, { align: 'right' });

        // Finalisasi PDF
        doc.end();

        return new Promise<NextResponse>((resolve) => {
            doc.on('end', () => {
                const buffer = Buffer.concat(chunks);
                resolve(new NextResponse(buffer, {
                    headers: {
                        'Content-Type': 'application/pdf',
                        'Content-Disposition': `inline; filename="surat-jalan-${id}.pdf"`,
                    },
                }));
            });
        });

    } catch (error) {
        console.error('PDF Generation Error:', error);
        return NextResponse.json(
            {
                error: 'Gagal membuat PDF',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
