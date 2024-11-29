import jsPDF from "jspdf";
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import { FormData, BarangItem } from '@/types/suratJalan';
import { formatDate } from './dateFormatter';

interface jsPDFCustom extends jsPDF {
    autoTable: typeof autoTable;
    previousAutoTable: {
        finalY: number;
    };
}

// Define colors for different copies
const COPY_COLORS = {
    KANTOR: { r: 75, g: 181, b: 154 },    // Green
    DRIVER: { r: 255, g: 182, b: 193 },    // Pink
    CUSTOMER: { r: 100, g: 149, b: 237 },  // Blue
    GUDANG: { r: 255, g: 140, b: 0 },      // Orange
    WHITE: { r: 255, g: 255, b: 255 },     // White
    BLACK: { r: 0, g: 0, b: 0 }            // Black
};

// Function to create header
const createHeader = (doc: jsPDFCustom, color: { r: number, g: number, b: number }, copyText: string): void => {
    // Logo placeholder
    doc.rect(15, 15, 25, 25);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("PT. SINAR BUANA PRIMA", 45, 25);
    doc.text("SURAT JALAN / DELIVERY ORDER", 105, 16, { align: 'center' });

    // Add copy text with color
    doc.setFontSize(8);
    doc.setTextColor(color.r, color.g, color.b);
    doc.text(`[${copyText}]`, 180, 16);
    doc.setTextColor(COPY_COLORS.BLACK.r, COPY_COLORS.BLACK.g, COPY_COLORS.BLACK.b);

    // Company details
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("General Contractor, Supplier & Trading", 45, 32);
    doc.text("Jl. Raya Gelam Gg. Kemuning No. 27, Candi - Sidoarjo", 45, 37);
    doc.text("Telp: 031-8967577 | Fax: 031-8970521", 45, 42);
    doc.text("Email: sinarbuanaprima@yahoo.co.id", 45, 47);

    // Colored line
    doc.setDrawColor(color.r, color.g, color.b);
    doc.setLineWidth(0.5);
    doc.line(15, 55, 195, 55);
};

// Function to create document details
const createDocumentDetails = (doc: jsPDFCustom, formData: FormData, color: { r: number, g: number, b: number }): void => {
    // Create colored background
    doc.setDrawColor(color.r, color.g, color.b);
    const lightColor = `rgb(${Math.min(color.r + 180, 255)}, ${Math.min(color.g + 180, 255)}, ${Math.min(color.b + 180, 255)})`;
    doc.setFillColor(lightColor);
    doc.rect(15, 60, 180, 42, 'F');

    const detailStartY = 68;
    const detailLineHeight = 7;

    // Left side details
    const leftLabels = [
        { label: "No. Surat", value: formData.noSurat },
        { label: "Tanggal", value: formData.tanggal },
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

    // Right side details
    const rightLabels = [
        { label: "No. Kendaraan", value: formData.noKendaraan },
        { label: "Ekspedisi", value: formData.ekspedisi },
        { label: "Tujuan", value: formData.tujuan }
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

// Function to create items table with pagination
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

// Function to create signatures
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

// Function to create footer
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

    // Colored border
    doc.setDrawColor(color.r, color.g, color.b);
    doc.setLineWidth(0.5);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

    // Footer text
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

// Main function to generate multi-copy PDF
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
        { color: COPY_COLORS.KANTOR, text: "KANTOR" },
        { color: COPY_COLORS.DRIVER, text: "DRIVER" },
        { color: COPY_COLORS.CUSTOMER, text: "CUSTOMER" },
        { color: COPY_COLORS.GUDANG, text: "GUDANG" }
    ];

    copies.forEach((copy, copyIndex) => {
        const totalPages = Math.ceil(barang.length / itemsPerPage);

        for (let page = 0; page < totalPages; page++) {
            if (copyIndex > 0 || page > 0) {
                doc.addPage();
            }

            // Only create header and document details on first page of each copy
            if (page === 0) {
                createHeader(doc, copy.color, copy.text);
                createDocumentDetails(doc, formData, copy.color);
            }

            const startIndex = page * itemsPerPage;
            createItemsTable(doc, barang, startIndex, itemsPerPage, copy.color, page === 0);

            // Only create signatures on the last page of each copy
            if (page === totalPages - 1) {
                const finalY = doc.previousAutoTable.finalY + 10;
                createSignatures(doc, finalY);
            }

            createFooter(doc, username, copy.text, copy.color, page + 1, totalPages);
        }
    });

    return doc;
};