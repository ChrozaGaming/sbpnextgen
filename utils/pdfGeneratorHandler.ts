// utils/pdfGeneratorHandler.ts
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FormData, BarangItem } from "@/types/suratJalan";
import {
    createHeader,
    createDocumentDetails,
    createSignatures,
    createFooter,
    generateTableData
} from './suratjalan/pdfGenerator/pdfGenerator';

export const    generatePDF = (
    formData: FormData,
    barang: BarangItem[],
    username: string
) => {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    });

    const itemsPerPage = 10;
    const totalPages = Math.ceil(barang.length / itemsPerPage);

    for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
            doc.addPage();
            doc.setTextColor(0, 0, 0);
        }

        createHeader(doc);
        createDocumentDetails(doc, formData);

        const startIdx = page * itemsPerPage;
        const endIdx = Math.min((page + 1) * itemsPerPage, barang.length);
        const pageItems = barang.slice(startIdx, endIdx);

        doc.autoTable({
            startY: 100,
            head: [["No", "Jumlah", "Kemasan", "Kode", "Nama Barang", "Keterangan"]],
            body: generateTableData(pageItems, startIdx),
            theme: 'grid',
            headStyles: {
                fillColor: [75, 181, 154],
                textColor: 255,
                fontStyle: 'bold',
                halign: 'center',
                fontSize: 10
            },
            styles: {
                fontSize: 9,
                cellPadding: 5,
                overflow: 'linebreak',
                halign: 'left',
                lineWidth: 0.5,
            },
            columnStyles: {
                0: { cellWidth: 15, halign: 'center' },
                1: { cellWidth: 25 },
                2: { cellWidth: 25 },
                3: { cellWidth: 25 },
                4: { cellWidth: 50 },
                5: { cellWidth: 35 }
            },
            margin: { left: 15, right: 15 }
        });

        const finalY = doc.previousAutoTable?.finalY || 150;

        if (page === totalPages - 1) {
            createSignatures(doc, finalY + 15);
        }

        createFooter(doc, username);
    }

    doc.save("SuratJalan.pdf");
};
