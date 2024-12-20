import { NextRequest, NextResponse } from 'next/server';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface RekapPO {
    id: number;
    no_po: string;
    judulPO: string;
    tanggal: string;
    status: string;
    nilai_penawaran: number;
    nilai_po: number;
    biaya_pelaksanaan: number;
    profit: number;
    keterangan: string;
    nama_perusahaan: string;
}

export async function POST(req: NextRequest) {
    try {
        const { records } = await req.json() as { records: RekapPO[] };

        // Group records by company
        const groupedRecords = records.reduce((acc, curr) => {
            if (!acc[curr.nama_perusahaan]) {
                acc[curr.nama_perusahaan] = [];
            }
            acc[curr.nama_perusahaan].push(curr);
            return acc;
        }, {} as Record<string, RekapPO[]>);

        // Format currency
        const formatRupiah = (amount: number) => {
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
            }).format(amount);
        };

        // Create PDF document
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        // Set the title
        doc.setFontSize(18);
        doc.text('Rekap Purchase Order', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

        // Add print date
        doc.setFontSize(10);
        doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`,
            doc.internal.pageSize.getWidth() - 40, 20,
            { align: 'right' });

        let yPosition = 30;

        // Process each company
        Object.entries(groupedRecords).forEach(([companyName, companyRecords], companyIndex) => {
            if (companyIndex > 0) {
                doc.addPage();
                yPosition = 30;
            }

            // Add company name
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text(companyName, 40, yPosition);

            // Calculate totals
            const totals = companyRecords.reduce((acc, record) => ({
                nilai_po: acc.nilai_po + record.nilai_po,
                profit: acc.profit + record.profit
            }), { nilai_po: 0, profit: 0 });

            // Prepare table data
            const tableData = companyRecords.map(record => [
                record.no_po,
                record.judulPO,
                new Date(record.tanggal).toLocaleDateString('id-ID'),
                formatRupiah(record.nilai_po),
                formatRupiah(record.profit),
                `${record.status}%`
            ]);

            // Add total row
            tableData.push([
                { content: 'Total', colSpan: 3, styles: { fontStyle: 'bold' } },
                { content: formatRupiah(totals.nilai_po), styles: { fontStyle: 'bold' } },
                { content: formatRupiah(totals.profit), styles: { fontStyle: 'bold' } },
                ''
            ]);

            // Add table using autoTable
            (doc as any).autoTable({
                startY: yPosition + 5,
                head: [[
                    'No PO',
                    'Judul PO',
                    'Tanggal',
                    'Nilai PO',
                    'Profit',
                    'Status'
                ]],
                body: tableData,
                theme: 'grid',
                headStyles: {
                    fillColor: [243, 244, 246],
                    textColor: [0, 0, 0],
                    fontStyle: 'bold',
                    fontSize: 10
                },
                styles: {
                    fontSize: 10,
                    cellPadding: 2,
                    lineWidth: 0.1
                },
                columnStyles: {
                    0: { cellWidth: 30 }, // No PO
                    1: { cellWidth: 'auto' }, // Judul PO
                    2: { cellWidth: 25 }, // Tanggal
                    3: { cellWidth: 35 }, // Nilai PO
                    4: { cellWidth: 35 }, // Profit
                    5: { cellWidth: 20 }, // Status
                },
                margin: { top: 40, right: 40, bottom: 40, left: 40 }
            });

            yPosition = (doc as any).lastAutoTable.finalY + 10;
        });

        // Convert PDF to buffer
        const pdfBuffer = doc.output('arraybuffer');

        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename=rekap-po-${new Date().toISOString().split('T')[0]}.pdf`
            }
        });

    } catch (error) {
        console.error('Error generating PDF:', error);
        return NextResponse.json(
            { error: 'Failed to generate PDF' },
            { status: 500 }
        );
    }
}