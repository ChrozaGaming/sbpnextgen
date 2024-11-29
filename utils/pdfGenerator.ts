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
    KANTOR: { r: 75, g: 181, b: 154 },  // Green
    DRIVER: { r: 255, g: 182, b: 193 },  // Pink
    CUSTOMER: { r: 100, g: 149, b: 237 }, // Blue
    WHITE: { r: 255, g: 255, b: 255 },   // White
    BLACK: { r: 0, g: 0, b: 0 }          // Black
};

// Fungsi untuk membuat header dengan warna yang berbeda
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

// Fungsi untuk membuat detail dokumen
const createDocumentDetails = (doc: jsPDFCustom, formData: FormData, color: { r: number, g: number, b: number }): void => {
    // Create colored background
    doc.setDrawColor(color.r, color.g, color.b);
    const lightColor = `rgb(${Math.min(color.r + 180, 255)}, ${Math.min(color.g + 180, 255)}, ${Math.min(color.b + 180, 255)})`;
    doc.setFillColor(lightColor);
    doc.rect(15, 60, 180, 35, 'F');

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
        { label: "Ekspedisi", value: formData.ekspedisi }
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

// Fungsi untuk membuat tanda tangan
const createSignatures = (doc: jsPDFCustom, startY: number): void => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const signatures = [
        {
            title: "Barang Diterima Oleh:",
            x: 20,
            lines: [
                "Tgl: _________________",
                "Nama Jelas / Stempel:",
                "_____________________"
            ]
        },
        {
            title: "Ditandatangani oleh:",
            x: 85,
            lines: [
                "Sopir: _________________",
                "Satpam: ________________",
                "_____________________"
            ]
        },
        {
            title: "Hormat Kami,",
            x: 150,
            lines: [
                "",
                "",
                "_____________________",
                "Pengawas Gudang"
            ]
        }
    ];

    signatures.forEach(sig => {
        doc.text(sig.title, sig.x, startY);
        sig.lines.forEach((line, index) => {
            doc.text(line, sig.x, startY + ((index + 1) * 7));
        });
    });
};

// Fungsi untuk membuat footer dengan info halaman
const createFooter = (
    doc: jsPDFCustom,
    username: string,
    copyText: string,
    color: { r: number, g: number, b: number }
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
        `Dicetak oleh: ${username}`,
        `Copy: ${copyText}`
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


    const copies = [
        { color: COPY_COLORS.KANTOR, text: "KANTOR" },
        { color: COPY_COLORS.DRIVER, text: "DRIVER" },
        { color: COPY_COLORS.CUSTOMER, text: "CUSTOMER" }
    ];

    copies.forEach((copy, copyIndex) => {
        if (copyIndex > 0) {
            doc.addPage();
        }

        createHeader(doc, copy.color, copy.text);
        createDocumentDetails(doc, formData, copy.color);

        // Create table
        doc.autoTable({
            startY: 100,
            head: [["No", "Jumlah", "Kemasan", "Kode", "Nama Barang", "Keterangan"]],
            body: barang.map((item, index) => [
                index + 1,
                item.jumlah,
                item.kemasan,
                item.kode,
                item.nama,
                item.keterangan,
            ]),
            theme: 'grid',
            headStyles: {
                fillColor: [copy.color.r, copy.color.g, copy.color.b],
                textColor: [COPY_COLORS.WHITE.r, COPY_COLORS.WHITE.g, COPY_COLORS.WHITE.b],
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

        const finalY = doc.previousAutoTable.finalY + 10;
        createSignatures(doc, finalY);
        createFooter(doc, username, copy.text, copy.color);
    });

    return doc;
};

// Utility function to save PDF
// export const savePDF = (doc: jsPDFCustom, formData: FormData): void => {
//     const fileName = `SJ_${formData.noSurat}_${formData.tanggal}_MULTI.pdf`;
//     doc.save(fileName);
// };