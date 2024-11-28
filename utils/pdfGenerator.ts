import jsPDF from "jspdf";
import 'jspdf-autotable'; // Import ini penting!
import autoTable from 'jspdf-autotable';
import { FormData, BarangItem } from '@/types/suratJalan';
import { formatDate } from './dateFormatter';

// Extend jsPDF dengan tipe yang lebih spesifik
interface jsPDFCustom extends jsPDF {
    autoTable: typeof autoTable;
    previousAutoTable: {
        finalY: number;
    };
}

// Tambahkan tipe untuk jsPDF dengan autoTable
interface jsPDFWithAutoTable extends jsPDF {
    autoTable: (options: any) => void;
}

// Konstanta untuk warna
const RGB_COLOR = {
    primary: { r: 75, g: 181, b: 154 },
    white: { r: 255, g: 255, b: 255 },
    black: { r: 0, g: 0, b: 0 }
};

// Fungsi untuk membuat header
export const createHeader = (doc: jsPDFCustom): void => {
    doc.rect(15, 15, 25, 25);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("PT. SINAR BUANA PRIMA", 45, 25);
    doc.text("SURAT JALAN / DELIVERY ORDER", 105, 16, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("General Contractor, Supplier & Trading", 45, 32);
    doc.text("Jl. Raya Gelam Gg. Kemuning No. 27, Candi - Sidoarjo", 45, 37);
    doc.text("Telp: 031-8967577 | Fax: 031-8970521", 45, 42);
    doc.text("Email: sinarbuanaprima@yahoo.co.id", 45, 47);

    doc.setDrawColor(RGB_COLOR.primary.r, RGB_COLOR.primary.g, RGB_COLOR.primary.b);
    doc.setLineWidth(0.5);
    doc.line(15, 55, 195, 55);
};

// Fungsi untuk membuat detail dokumen
export const createDocumentDetails = (doc: jsPDFCustom, formData: FormData): void => {
    doc.setDrawColor(RGB_COLOR.primary.r, RGB_COLOR.primary.g, RGB_COLOR.primary.b);
    doc.setFillColor(240, 248, 255);
    doc.rect(15, 60, 180, 35, 'F');

    const detailStartY = 68;
    const detailLineHeight = 7;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);

    const leftLabels = [
        { label: "No. Surat", value: formData.noSurat },
        { label: "Tanggal", value: formData.tanggal },
        { label: "No. PO", value: formData.noPO }
    ];

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
export const createSignatures = (doc: jsPDFCustom, yPosition: number): void => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const signatures = [
        {
            x: 20,
            texts: [
                "Barang Diterima Oleh:",
                "Tgl: _________________",
                "Nama Jelas / Stempel:",
                "_____________________"
            ]
        },
        {
            x: 85,
            texts: [
                "Ditandatangani oleh:",
                "Sopir: _________________",
                "Satpam: ________________",
                "_____________________"
            ]
        },
        {
            x: 150,
            texts: [
                "Hormat Kami,",
                "",
                "",
                "_____________________",
                "Pengawas Gudang"
            ]
        }
    ];

    signatures.forEach(({ x, texts }) => {
        texts.forEach((text, index) => {
            doc.text(text, x, yPosition + (index * 15));
        });
    });
};

// Fungsi untuk membuat footer dengan pagination
export const createFooterWithPagination = (
    doc: jsPDFCustom,
    username: string,
    currentPage: number,
    totalPages: number
): void => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setDrawColor(RGB_COLOR.primary.r, RGB_COLOR.primary.g, RGB_COLOR.primary.b);
    doc.setLineWidth(0.5);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

    doc.setTextColor(128);
    doc.setFontSize(8);

    [
        `Dicetak pada: ${formatDate()}`,
        `Dicetak oleh Admin: ${username || 'Unknown'}`,
        `Halaman ${currentPage} dari ${totalPages}`
    ].forEach((text, index) => {
        doc.text(
            text,
            pageWidth - 15,
            pageHeight - (25 - (index * 5)),
            { align: 'right' }
        );
    });

    doc.setTextColor(RGB_COLOR.black.r);
};

// Fungsi utama untuk generate PDF
export const generatePDF = (
    formData: FormData,
    barang: BarangItem[],
    username: string
): jsPDFCustom => {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    }) as jsPDFCustom;

    const ITEMS_PER_PAGE = 10;
    const totalPages = Math.ceil(barang.length / ITEMS_PER_PAGE);

    for (let currentPage = 0; currentPage < totalPages; currentPage++) {
        if (currentPage > 0) {
            doc.addPage();
        }

        createHeader(doc);
        createDocumentDetails(doc, formData);

        const startIdx = currentPage * ITEMS_PER_PAGE;
        const endIdx = Math.min(startIdx + ITEMS_PER_PAGE, barang.length);
        const currentPageItems = barang.slice(startIdx, endIdx);

        doc.autoTable({
            startY: 100,
            head: [["No", "Jumlah", "Kemasan", "Kode", "Nama Barang", "Keterangan"]],
            body: currentPageItems.map((item, index) => [
                startIdx + index + 1,
                item.jumlah,
                item.kemasan,
                item.kode,
                item.nama,
                item.keterangan,
            ]),
            theme: 'grid',
            headStyles: {
                fillColor: [RGB_COLOR.primary.r, RGB_COLOR.primary.g, RGB_COLOR.primary.b],
                textColor: RGB_COLOR.white.r,
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

        if (currentPage === totalPages - 1) {
            createSignatures(doc, finalY);
        }

        createFooterWithPagination(doc, username, currentPage + 1, totalPages);
    }

    return doc;
};

// Fungsi untuk menyimpan PDF
export const savePDF = (doc: jsPDFCustom, formData: FormData): void => {
    const fileName = `SJ_${formData.noSurat}_${formData.tanggal}.pdf`;
    doc.save(fileName);
};