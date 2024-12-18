import { NextRequest, NextResponse } from 'next/server';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Initialize pdfmake with default fonts
pdfMake.vfs = pdfFonts.pdfMake.vfs;

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

        // Create document definition
        const docDefinition = {
            content: [
                { text: 'Rekap Purchase Order', style: 'header' },
                { text: `Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, alignment: 'right', margin: [0, 0, 0, 20] },
                ...Object.entries(groupedRecords).flatMap(([companyName, companyRecords]) => {
                    const tableBody = [
                        [
                            { text: 'No PO', style: 'tableHeader' },
                            { text: 'Judul PO', style: 'tableHeader' },
                            { text: 'Tanggal', style: 'tableHeader' },
                            { text: 'Nilai PO', style: 'tableHeader' },
                            { text: 'Profit', style: 'tableHeader' },
                            { text: 'Status', style: 'tableHeader' }
                        ],
                        ...companyRecords.map(record => [
                            record.no_po,
                            record.judulPO,
                            new Date(record.tanggal).toLocaleDateString('id-ID'),
                            formatRupiah(record.nilai_po),
                            formatRupiah(record.profit),
                            `${record.status}%`
                        ])
                    ];

                    const totals = companyRecords.reduce((acc, record) => ({
                        nilai_po: acc.nilai_po + record.nilai_po,
                        profit: acc.profit + record.profit
                    }), { nilai_po: 0, profit: 0 });

                    tableBody.push([
                        { text: 'Total', colSpan: 3, style: 'tableFooter' },
                        '', '',
                        { text: formatRupiah(totals.nilai_po), style: 'tableFooter' },
                        { text: formatRupiah(totals.profit), style: 'tableFooter' },
                        ''
                    ]);

                    return [
                        { text: companyName, style: 'companyName', margin: [0, 20, 0, 10] },
                        {
                            table: {
                                headerRows: 1,
                                widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
                                body: tableBody
                            },
                            layout: 'lightHorizontalLines'
                        }
                    ];
                })
            ],
            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 0, 0, 20]
                },
                companyName: {
                    fontSize: 14,
                    bold: true
                },
                tableHeader: {
                    bold: true,
                    fontSize: 10,
                    fillColor: '#f3f4f6'
                },
                tableFooter: {
                    bold: true,
                    fontSize: 10
                }
            },
            defaultStyle: {
                fontSize: 10
            },
            pageSize: 'A4',
            pageOrientation: 'landscape',
            pageMargins: [40, 40, 40, 40]
        };

        // Generate PDF
        const pdfDoc = pdfMake.createPdf(docDefinition);

        return new Promise((resolve) => {
            pdfDoc.getBuffer((buffer: Buffer) => {
                resolve(new NextResponse(buffer, {
                    headers: {
                        'Content-Type': 'application/pdf',
                        'Content-Disposition': `attachment; filename=rekap-po-${new Date().toISOString().split('T')[0]}.pdf`
                    }
                }));
            });
        });

    } catch (error) {
        console.error('Error generating PDF:', error);
        return NextResponse.json(
            { error: 'Failed to generate PDF' },
            { status: 500 }
        );
    }
}
