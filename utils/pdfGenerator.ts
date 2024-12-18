import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { fonts } from './fonts';

export interface RekapPO {
    id: number;
    no_po: string;
    judulPO: string;
    nama_perusahaan: string;
    tanggal: string;
    nilai_po: number;
    biaya_pelaksanaan: number;
    biaya_material: number;
    biaya_jasa: number;
    biaya_overhead: number;
    profit: number;
    status: number;
}

const formatPercentage = (value: any): string => {
    const num = ensureNumber(value);
    return num.toFixed(1).replace('.', ',') + '%';
};

const ensureNumber = (value: any): number => {
    if (typeof value === 'string') {
        value = value.replace(/[^\d.-]/g, '');
    }
    const num = Number(value);
    return isNaN(num) ? 0 : num;
};

const getStatusColor = (status: number): string => {
    if (status <= -75) return '#7f1d1d';
    if (status <= -50) return '#991b1b';
    if (status <= -25) return '#b91c1c';
    if (status < 0) return '#dc2626';
    if (status < 25) return '#eab308';
    if (status < 50) return '#84cc16';
    if (status < 75) return '#22c55e';
    return '#059669';
};

const formatRupiah = (amount: any) => {
    const num = ensureNumber(amount);
    const isNegative = num < 0;
    const absoluteNum = Math.abs(num);
    const formattedNum = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(absoluteNum);
    const numericPart = formattedNum.replace(/^(IDR|Rp)/i, '').trim();
    return isNegative ? `Rp -${numericPart}` : `Rp ${numericPart}`;
};

export const generateDocDefinition = (selectedRecords: RekapPO[]): TDocumentDefinitions => {
    let totalNilaiPO = 0;
    let totalBiayaPelaksanaan = 0;
    let totalProfit = 0;
    let totalStatusAccumulator = 0;
    let totalCount = 0;

    if (!Array.isArray(selectedRecords) || selectedRecords.length === 0) {
        console.error('No records provided or invalid data format');
        return {
            content: [{
                text: 'Tidak ada data yang dapat ditampilkan',
                style: 'header',
                alignment: 'center'
            }],
            styles: {
                header: {
                    fontSize: 16,
                    bold: true,
                    margin: [0, 150, 0, 0]
                }
            },
            pageSize: 'A4',
            pageOrientation: 'landscape'
        };
    }

    try {
        const headerStyle = {
            fontSize: 10,
            bold: true,
            alignment: 'center' as 'center',
            fillColor: '#f3f4f6'
        };

        // Modifikasi sorting untuk mengurutkan berdasarkan tanggal
        const records = selectedRecords
            .sort((a, b) => {
                // Pertama urutkan berdasarkan nama perusahaan
                const companyComparison = a.nama_perusahaan.localeCompare(b.nama_perusahaan);
                if (companyComparison !== 0) return companyComparison;

                // Jika nama perusahaan sama, urutkan berdasarkan tanggal
                const dateA = new Date(a.tanggal).getTime();
                const dateB = new Date(b.tanggal).getTime();
                return dateA - dateB; // Urutkan dari tanggal lama ke baru
            });

        const companyGroups = records.reduce((groups, record) => {
            const group = groups[record.nama_perusahaan] || [];
            group.push(record);
            groups[record.nama_perusahaan] = group;
            return groups;
        }, {} as { [key: string]: RekapPO[] });

        const mainContent: any[] = [
            {
                text: 'REKAP PURCHASE ORDER',
                style: 'header'
            },
            {
                columns: [
                    {
                        text: `Periode: ${new Date().toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long'
                        })}`,
                        alignment: 'left'
                    },
                    {
                        text: `Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`,
                        alignment: 'right'
                    }
                ],
                margin: [0, 0, 0, 20]
            }
        ];
        Object.entries(companyGroups).forEach(([companyName, companyRecords]) => {
            const companyTotals = companyRecords.reduce((acc, record) => ({
                nilaiPO: acc.nilaiPO + ensureNumber(record.nilai_po),
                biayaPelaksanaan: acc.biayaPelaksanaan + ensureNumber(record.biaya_pelaksanaan),
                profit: acc.profit + ensureNumber(record.profit),
                statusTotal: acc.statusTotal + ensureNumber(record.status),
                count: acc.count + 1
            }), { nilaiPO: 0, biayaPelaksanaan: 0, profit: 0, statusTotal: 0, count: 0 });

            const companyNilaiPO = companyTotals.nilaiPO;
            const companyBiayaPelaksanaan = companyTotals.biayaPelaksanaan;
            const companyProfit = companyTotals.profit;
            const companyStatusAvg = companyTotals.statusTotal / companyTotals.count;

            mainContent.push(
                {
                    text: companyName,
                    style: 'companyName',
                    margin: [0, 10, 0, 5]
                },
                {
                    table: {
                        headerRows: 1,
                        widths: ['10%', '30%', '10%', '15%', '15%', '20%'],
                        body: [
                            [
                                { text: 'No PO', ...headerStyle },
                                { text: 'Judul PO', ...headerStyle },
                                { text: 'Tanggal', ...headerStyle },
                                { text: 'Nilai PO', ...headerStyle },
                                { text: 'Biaya Pelaksanaan', ...headerStyle },
                                { text: 'Profit', ...headerStyle }
                            ],
                            ...companyRecords.map(record => [
                                { text: record.no_po },
                                { text: record.judulPO },
                                {
                                    text: new Date(record.tanggal).toLocaleDateString('id-ID'),
                                    alignment: 'center'
                                },
                                {
                                    text: formatRupiah(record.nilai_po),
                                    alignment: 'right'
                                },
                                {
                                    text: formatRupiah(record.biaya_pelaksanaan),
                                    alignment: 'right'
                                },
                                {
                                    stack: [
                                        {
                                            text: formatRupiah(record.profit),
                                            alignment: 'right',
                                            color: ensureNumber(record.profit) < 0 ? 'red' : 'black'
                                        },
                                        {
                                            text: formatPercentage(record.status),
                                            alignment: 'right',
                                            fontSize: 8,
                                            color: 'white',
                                            background: getStatusColor(ensureNumber(record.status)),
                                            margin: [0, 2, 0, 0]
                                        }
                                    ]
                                }
                            ])
                        ]
                    },
                    layout: {
                        hLineWidth: (i, node) => (i === 0 || i === node.table.body.length) ? 1 : 0.5,
                        vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length) ? 1 : 0.5,
                        hLineColor: (i, node) => (i === 0 || i === node.table.body.length) ? 'black' : '#aaaaaa',
                        vLineColor: (i, node) => (i === 0 || i === node.table.widths.length) ? 'black' : '#aaaaaa',
                        paddingLeft: (i) => 4,
                        paddingRight: (i) => 4,
                        paddingTop: (i) => 3,
                        paddingBottom: (i) => 3,
                    }
                },
                {
                    columns: [
                        { text: 'Subtotal:', alignment: 'right', width: '50%', bold: true },
                        {
                            text: formatRupiah(companyNilaiPO),
                            width: '15%',
                            alignment: 'right',
                            bold: true
                        },
                        {
                            text: formatRupiah(companyBiayaPelaksanaan),
                            width: '15%',
                            alignment: 'right',
                            bold: true
                        },
                        {
                            stack: [
                                {
                                    text: formatRupiah(companyProfit),
                                    alignment: 'right',
                                    bold: true,
                                    color: companyProfit < 0 ? 'red' : 'black'
                                },
                                {
                                    text: formatPercentage(companyStatusAvg),
                                    alignment: 'right',
                                    fontSize: 8,
                                    color: 'white',
                                    background: getStatusColor(companyStatusAvg),
                                    margin: [0, 2, 0, 0]
                                }
                            ],
                            width: '20%'
                        }
                    ],
                    margin: [0, 5, 0, 15]
                }
            );

            totalNilaiPO += companyNilaiPO;
            totalBiayaPelaksanaan += companyBiayaPelaksanaan;
            totalProfit += companyProfit;
            totalStatusAccumulator += companyTotals.statusTotal;
            totalCount += companyTotals.count;
        });

        const finalStatusAvg = totalStatusAccumulator / totalCount;

        mainContent.push(
            { text: '', margin: [0, 10] },
            {
                columns: [
                    { text: 'TOTAL KESELURUHAN:', alignment: 'right', width: '50%', bold: true },
                    {
                        text: formatRupiah(totalNilaiPO),
                        width: '15%',
                        alignment: 'right',
                        bold: true
                    },
                    {
                        text: formatRupiah(totalBiayaPelaksanaan),
                        width: '15%',
                        alignment: 'right',
                        bold: true
                    },
                    {
                        stack: [
                            {
                                text: formatRupiah(totalProfit),
                                alignment: 'right',
                                bold: true,
                                color: totalProfit < 0 ? 'red' : 'black'
                            },
                            {
                                text: formatPercentage(finalStatusAvg),
                                alignment: 'right',
                                fontSize: 8,
                                color: 'white',
                                background: getStatusColor(finalStatusAvg),
                                margin: [0, 2, 0, 0]
                            }
                        ],
                        width: '20%'
                    }
                ]
            }
        );

        return {
            content: mainContent,
            styles: {
                header: {
                    fontSize: 16,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 0, 0, 20]
                },
                companyName: {
                    fontSize: 12,
                    bold: true,
                    decoration: 'underline'
                }
            },
            defaultStyle: {
                fontSize: 10,
                font: 'Roboto'
            },
            pageSize: 'A4',
            pageOrientation: 'landscape',
            pageMargins: [40, 40, 40, 60],
            footer: function(currentPage: number, pageCount: number) {
                return {
                    columns: [
                        {
                            text: `Dicetak pada: ${new Date().toLocaleString('id-ID')}`,
                            alignment: 'left',
                            margin: [40, 0],
                            fontSize: 8
                        },
                        {
                            text: `Halaman ${currentPage} dari ${pageCount}`,
                            alignment: 'right',
                            margin: [0, 0, 40, 0],
                            fontSize: 8
                        }
                    ]
                };
            }
        };
    } catch (error) {
        console.error('Error generating PDF:', error);
        return {
            content: [{
                text: 'Terjadi kesalahan saat memproses data',
                style: 'header',
                alignment: 'center'
            }],
            styles: {
                header: {
                    fontSize: 16,
                    bold: true,
                    margin: [0, 150, 0, 0]
                }
            },
            pageSize: 'A4',
            pageOrientation: 'landscape'
        };
    }
};
