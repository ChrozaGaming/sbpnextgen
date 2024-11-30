import jsPDF from "jspdf";
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import { FormData, BarangItem } from '@/types/suratJalan';
import { formatDate } from './dateFormatter';
const logoPath = '/images/logo.png';

interface jsPDFCustom extends jsPDF {
    autoTable: typeof autoTable;
    previousAutoTable: {
        finalY: number;
    };
}

function formatTanggal(dateString: string): string {
    const days = [
        'Minggu', 'Senin', 'Selasa', 'Rabu',
        'Kamis', 'Jumat', 'Sabtu'
    ];

    const months = [
        'Januari', 'Februari', 'Maret', 'April',
        'Mei', 'Juni', 'Juli', 'Agustus',
        'September', 'Oktober', 'November', 'Desember'
    ];

    const date = new Date(dateString);
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${dayName}, ${day} ${month} ${year}`;
}

const COPY_COLORS = {
    BLACK: { r: 0, g: 0, b: 0 },          // Hitam untuk ACC
    PINK: { r: 255, g: 192, b: 203 },     // Pink untuk Admin Gudang
    GREEN: { r: 144, g: 238, b: 144 },    // Hijau untuk Penerima
    ORANGE: { r: 255, g: 165, b: 0 },     // Orange untuk Arsip
    WHITE: { r: 255, g: 255, b: 255 }
};

const createHeader = (doc: jsPDFCustom, color: { r: number, g: number, b: number }, copyText: string): void => {
    doc.addImage(logoPath, 'PNG', 15, 15, 25, 25);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("PT. SINAR BUANA PRIMA", 45, 25);
    doc.text("SURAT JALAN / DELIVERY ORDER", 105, 16, { align: 'center' });

    doc.setFontSize(7);
    doc.setTextColor(color.r, color.g, color.b);
    doc.text(`[${copyText}]`, 180, 16);
    doc.setTextColor(COPY_COLORS.BLACK.r, COPY_COLORS.BLACK.g, COPY_COLORS.BLACK.b);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("General Contractor, Supplier & Trading", 45, 32);
    doc.text("Jl. Raya Gelam Gg. Kemuning No. 27, Candi - Sidoarjo", 45, 37);
    doc.text("Telp: 031-8967577 | Fax: 031-8970521", 45, 42);
    doc.text("Email: sinarbuanaprima@yahoo.co.id", 45, 47);

    doc.setDrawColor(color.r, color.g, color.b);
    doc.setLineWidth(0.5);
    doc.line(15, 55, 195, 55);
};

const createDocumentDetails = (doc: jsPDFCustom, formData: FormData, color: { r: number, g: number, b: number }): void => {
    doc.setDrawColor(color.r, color.g, color.b);

    // Set warna fill berdasarkan jenis copy
    if (color === COPY_COLORS.BLACK) {
        doc.setFillColor(200, 200, 200); // Abu-abu muda untuk ACC
    } else if (color === COPY_COLORS.PINK) {
        doc.setFillColor(255, 235, 238); // Pink muda untuk ADM.GUDANG
    } else if (color === COPY_COLORS.GREEN) {
        doc.setFillColor(235, 255, 238); // Hijau muda untuk PENERIMA
    } else if (color === COPY_COLORS.ORANGE) {
        doc.setFillColor(255, 245, 230); // Orange muda untuk ARSIP
    }

    doc.rect(15, 60, 180, 42, 'F');

    const detailStartY = 68;
    const detailLineHeight = 7;

    const leftLabels = [
        { label: "No. Surat", value: formData.noSurat },
        { label: "Tanggal", value: formatTanggal(formData.tanggal) },
        { label: "No. PO", value: formData.noPO }
    ];

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);

    leftLabels.forEach((item, index) => {
        const y = detailStartY + (index * detailLineHeight);
        doc.text(item.label, 20, y);
        doc.text(":", 60, y);
        doc.setFont("helvetica", "normal");
        doc.text(item.value, 65, y);
        doc.setFont("helvetica", "bold");
    });

    const rightLabels = [
        { label: "No. Kendaraan", value: formData.noKendaraan },
        { label: "Ekspedisi", value: formData.ekspedisi },
        { label: "Kepada", value: formData.tujuan }
    ];

    rightLabels.forEach((item, index) => {
        const y = detailStartY + (index * detailLineHeight);
        doc.text(item.label, 110, y);
        doc.text(":", 150, y);
        doc.setFont("helvetica", "normal");
        doc.text(item.value, 155, y);
        doc.setFont("helvetica", "bold");
    });
};
const createItemsTable = (
    doc: jsPDFCustom,
    barang: BarangItem[],
    startIndex: number,
    itemsPerPage: number,
    color: { r: number, g: number, b: number },
    isFirstPage: boolean
): void => {
    const endIndex = Math.min(startIndex + itemsPerPage, barang.length);
    const items = barang.slice(startIndex, endIndex);

    doc.autoTable({
        startY: isFirstPage ? 107 : 30,
        head: [["No", "Jumlah", "Kemasan", "Kode", "Nama Barang", "Keterangan"]],
        body: items.map((item, index) => [
            startIndex + index + 1,
            item.jumlah,
            item.kemasan,
            item.kode,
            item.nama,
            item.keterangan,
        ]),
        theme: 'grid',
        headStyles: {
            fillColor: [color.r, color.g, color.b],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center',
            valign: 'middle',
            fontSize: 10,
            cellPadding: 3
        },
        columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 20 },
            2: { cellWidth: 25 },
            3: { cellWidth: 25 },
            4: { cellWidth: 50 },
            5: { cellWidth: 40 }
        },
        margin: { left: 15, right: 15 }
    });
};

const createSignatures = (doc: jsPDFCustom, startY: number): void => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const pageWidth = doc.internal.pageSize.getWidth();
    const leftX = pageWidth * 0.2;
    const centerX = pageWidth * 0.5;
    const rightX = pageWidth * 0.8;

    const signatures = [
        {
            title: "Barang Diterima Oleh:",
            x: leftX,
            lines: [
                "Tgl: _________________",
                "Nama Jelas / Stempel:",
                "",
                "",
                "_____________________"
            ]
        },
        {
            title: "Ditandatangani oleh:",
            x: centerX,
            lines: [
                "Sopir:",
                "",
                "",
                "_____________________",
                "Satpam:",
                "",
                "",
                "_____________________"
            ]
        },
        {
            title: "Hormat Kami,",
            x: rightX,
            lines: [
                "",
                "",
                "_____________________",
                "",
                "Nama Jelas",
                "Pengawas Gudang"
            ]
        }
    ];

    const centerText = (text: string, x: number): number => {
        const textWidth = doc.getTextWidth(text);
        return x - (textWidth / 2);
    };

    signatures.forEach(sig => {
        doc.text(sig.title, centerText(sig.title, sig.x), startY);
        sig.lines.forEach((line, index) => {
            doc.text(line, centerText(line, sig.x), startY + ((index + 1) * 7));
        });
    });
};

const createFooter = (
    doc: jsPDFCustom,
    username: string,
    copyText: string,
    color: { r: number, g: number, b: number },
    currentPage: number,
    totalPages: number
): void => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setDrawColor(color.r, color.g, color.b);
    doc.setLineWidth(0.5);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text([
        `Dicetak pada: ${formatDate()}`,
        `Dicetak oleh: Admin ${username}`,
        `Copy: ${copyText}`,
        `Halaman ${currentPage} dari ${totalPages}`
    ], pageWidth - 15, pageHeight - 25, {
        align: 'right',
        lineHeightFactor: 1.5
    });
};

export const generateMultiCopyPDF = (
    formData: FormData,
    barang: BarangItem[],
    username: string
): jsPDFCustom => {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    }) as jsPDFCustom;

    const itemsPerPage = 10;
    const copies = [
        { color: COPY_COLORS.BLACK, text: "ACC", textColor: COPY_COLORS.WHITE },
        { color: COPY_COLORS.PINK, text: "ADM.GUDANG", textColor: COPY_COLORS.BLACK },
        { color: COPY_COLORS.GREEN, text: "PENERIMA", textColor: COPY_COLORS.BLACK },
        { color: COPY_COLORS.ORANGE, text: "ARSIP", textColor: COPY_COLORS.BLACK }
    ];

    copies.forEach((copy, copyIndex) => {
        const totalPages = Math.ceil(barang.length / itemsPerPage);

        for (let page = 0; page < totalPages; page++) {
            if (copyIndex > 0 || page > 0) {
                doc.addPage();
            }

            if (page === 0) {
                createHeader(doc, copy.color, copy.text);
                createDocumentDetails(doc, formData, copy.color);
            }

            const startIndex = page * itemsPerPage;
            createItemsTable(doc, barang, startIndex, itemsPerPage, copy.color, page === 0);

            if (page === totalPages - 1) {
                const finalY = doc.previousAutoTable.finalY + 10;
                createSignatures(doc, finalY);
            }

            createFooter(doc, username, copy.text, copy.color, page + 1, totalPages);
        }
    });

    return doc;
};