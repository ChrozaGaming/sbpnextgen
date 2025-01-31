import jsPDF from "jspdf";
import "jspdf-autotable";

interface BarangDetail {
    kode: string | null;
    nama: string | null;
    jumlah: number | null;
    satuan: string | null;
}

interface SuratJalan {
    nomor_surat: string;
    tujuan: string;
    tanggal: string;
    nomor_kendaraan: string | null;
    no_po: string | null;
    barang: BarangDetail[];
}

const formatTanggal = (tanggal: string): string => {
    const hari = [
        "Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"
    ];
    const bulan = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    const date = new Date(tanggal);
    const namaHari = hari[date.getDay()];
    const tgl = date.getDate().toString().padStart(2, "0");
    const namaBulan = bulan[date.getMonth()];
    const tahun = date.getFullYear();

    return `${namaHari}, ${tgl} ${namaBulan} ${tahun}`;
};

export const generatePDF = (item: SuratJalan) => {
    if (!item || !item.barang || !Array.isArray(item.barang)) {
        console.error('Data surat jalan tidak valid:', item);
        alert('Data surat jalan tidak valid. Tidak dapat mencetak PDF.');
        return;
    }
    const {nomor_surat, tujuan, tanggal, barang, no_po, nomor_kendaraan} = item;
    const keteranganProyek = item.keterangan_proyek || "-";

    const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "A5",
    });

    const rowsPerPage = 10; // Max rows per page
    const scale = 0.7; // Skala untuk memperkecil ukuran footer

    const generatePage = (pageItems: BarangDetail[]) => {
        const currentBackgroundColor = "#FFFFFF";
        const currentBorderColor = "#000000";

        // Header
        const logoUrl = "https://i.imgur.com/AY0XZbq.jpeg";
        doc.addImage(logoUrl, "JPEG", 10, 1.5, 90, 20);

        const titleX = 145;
        const titleY = 15;
        const titleAlign: "left" | "center" | "right" = "center";

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text(`SURAT JALAN / DELIVERY ORDER`, titleX, titleY, {align: titleAlign});

        // **Keterangan Proyek di bawah tanggal**
        const detailStartY = titleY + 10;

// Atur font size untuk tujuan
        doc.setFontSize(8); // Ukuran font lebih kecil untuk tujuan
        doc.setFont("helvetica", "bold");

// Atur margin kiri, kanan, dan batas lebar teks
        const marginLeft = 10;
        const marginRight = 70; // Batas margin kanan
        const maxWidth = marginRight - marginLeft;

// "Kepada Yth" dengan margin dan wrapping otomatis
        doc.text(`Kepada Yth: ${tujuan}`, marginLeft, detailStartY, {
            maxWidth: maxWidth,
        });

// Kembali ke font size 10 untuk elemen lainnya
        doc.setFontSize(8); // Ukuran font standar
        doc.text(`No: ${nomor_surat}`, 147, detailStartY + 5); // Posisi secara manual
        doc.text(`Tgl / Date: ${formatTanggal(tanggal)}`, 147, detailStartY + 9); // Posisi secara manual

// Baris pertama: "Keterangan Proyek:"
        doc.text("Keterangan Proyek:", 105, detailStartY, {align: "center"});

// Batasi panjang karakter maksimum untuk keteranganProyek menjadi 256
        const truncatedKeterangan = keteranganProyek.slice(0, 120);

// Baris kedua: nilai keteranganProyek dengan pembatasan margin
        doc.text(truncatedKeterangan, 105, detailStartY + 5, {
            align: "center",
            maxWidth: 70, // Atur lebar maksimum teks dalam mm
        });

        doc.text(`No. PO: ${no_po || "-"}`, 168, detailStartY + 7, {align: "right"});
        doc.text(`No. Kendaraan: ${nomor_kendaraan || "-"}`, 180, detailStartY + 11, {align: "right"});

        // Barang Table
        const tableStartY = detailStartY + 15;
        const tableData = pageItems.map((barang, index) => [
            index + 1,
            barang.jumlah ?? "",
            barang.satuan ?? "",
            barang.kode ?? "",
            barang.nama ?? "",
            "",
        ]);

        while (tableData.length < rowsPerPage) {
            tableData.push(["", "", "", "", "", ""]);
        }

        doc.autoTable({
            startY: tableStartY,
            head: [["No", "Jumlah", "Satuan", "No. Kode", "Nama Barang", "Keterangan"]],
            body: tableData,
            styles: {
                fontSize: 8,
                halign: "center",
                valign: "middle",
                lineWidth: 0.2,
                cellPadding: 2,
                fillColor: currentBackgroundColor,
            },
            headStyles: {
                fillColor: currentBackgroundColor,
                textColor: 0,
                lineWidth: 0.5,
                lineColor: currentBorderColor,
            },
            bodyStyles: {
                lineColor: currentBorderColor,
            },
            theme: "grid",
            tableLineColor: currentBorderColor,
            tableLineWidth: 0.5,
        });

        // Footer Group
        const footerStartY = doc.lastAutoTable.finalY + 0 * scale;

        // Footer Boxes
        const boxWidth = 26.4;
        const footerBoxHeight = 15; // Unique name
        const boxSpacing = 10; // Unique name

        const drawFooterGroup = (doc: any, startX: number, startY: number) => {
            // Barang Diterima Oleh
            doc.rect(startX, startY, boxWidth + 10, footerBoxHeight + 5);
            doc.setFontSize(6);
            doc.text("Barang Diterima Oleh:", startX + 2, startY + 2.3);
            doc.text("Tgl:", startX + 2, startY + 5);
            doc.text("Nama Jelas / Stempel", startX + 2, startY + 19);

            // Supir
            const supirX = startX + boxWidth + boxSpacing;
            doc.rect(supirX, startY, boxWidth + 10, footerBoxHeight + 5);
            doc.text("Supir", supirX + 15, startY + 19);

            // Satpam
            const satpamX = startX + (boxWidth + boxSpacing) * 2;
            doc.rect(satpamX, startY, boxWidth + 10, footerBoxHeight + 5);
            doc.text("Satpam", satpamX + 14, startY + 19);

            // Pengawas
            const pengawasX = startX + (boxWidth + boxSpacing) * 3;
            doc.rect(pengawasX, startY, boxWidth + 10, footerBoxHeight + 5);
            doc.text("Pengawas", pengawasX + 13.5, startY + 19);

            // Kepala Gudang
            const kepalaGudangX = startX + (boxWidth + boxSpacing) * 4;
            doc.rect(kepalaGudangX, startY, boxWidth + 10, footerBoxHeight + 5);
            doc.text("Hormat Kami", kepalaGudangX + 11.3, startY + 2.4);
            doc.text("Kepala Gudang", kepalaGudangX + 10.5, startY + 19);
        };

        drawFooterGroup(doc, 14, footerStartY);
        // Footer Notes
// Fungsi untuk menggambar grup keterangan
        const drawFooterNote = (doc, xOffset, yOffset, scale) => {
            const baseFontSize = 8 * scale; // Set font size sekali untuk semua teks
            doc.setFontSize(baseFontSize);

            // Grup teks keterangan
            doc.text("Keterangan:", 10 + xOffset, footerStartY + yOffset); // Geser horizontal/vertikal
            doc.text("Putih: ACC", 50 + xOffset, footerStartY + yOffset);
            doc.text("Merah: Adm. Gudang", 90 + xOffset, footerStartY + yOffset);
            doc.text("Hijau: Penerima", 150 + xOffset, footerStartY + yOffset);
            doc.text("Kuning: Arsip", 190 + xOffset, footerStartY + yOffset);
        };

// Panggil fungsi dengan offset
        const xOffset = 0; // Geser horizontal (positif = kanan, negatif = kiri)
        const yOffset = 24.5; // Geser vertikal (positif = bawah, negatif = atas)
        drawFooterNote(doc, xOffset, yOffset, scale);

    };

    generatePage(item.barang.slice(0, rowsPerPage));

    doc.save(`Surat_Jalan_${nomor_surat}.pdf`);
};

