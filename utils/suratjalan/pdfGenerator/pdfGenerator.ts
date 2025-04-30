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
  keterangan_proyek?: string;
}

// Konfigurasi warna untuk 4 kopian berbeda
interface ColorTheme {
  name: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  watermarkText: string;
}

const THEMES: ColorTheme[] = [
  {
    name: "Putih-ACC",
    backgroundColor: "#FFFFFF",
    borderColor: "#000000",
    textColor: "#000000",
    watermarkText: "ACC",
  },
  {
    name: "Pink-AdmGudang",
    backgroundColor: "#FFCCCB", // Pink light
    borderColor: "#000000",
    textColor: "#000000",
    watermarkText: "ADM. GUDANG",
  },
  {
    name: "Hijau-Penerima",
    backgroundColor: "#C6EFC6", // Light green
    borderColor: "#000000",
    textColor: "#000000",
    watermarkText: "PENERIMA",
  },
  {
    name: "Kuning-Arsip",
    backgroundColor: "#FFF9C4", // Light yellow
    borderColor: "#000000",
    textColor: "#000000",
    watermarkText: "ARSIP",
  },
];

const formatTanggal = (tanggal: string): string => {
  const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  const bulan = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
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
    console.error("Data surat jalan tidak valid:", item);
    alert("Data surat jalan tidak valid. Tidak dapat mencetak PDF.");
    return;
  }

  // Buat satu dokumen PDF
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "A5",
  });

  // Buat 4 halaman dengan warna berbeda dalam 1 dokumen PDF
  THEMES.forEach((theme, index) => {
    // Tambahkan halaman baru kecuali untuk halaman pertama
    if (index > 0) {
      doc.addPage("a5", "landscape");
    }

    generatePageWithTheme(doc, item, theme);
  });

  // Simpan satu file PDF dengan 4 halaman
  doc.save(`Surat_Jalan_${item.nomor_surat}_SBP.pdf`);
};

const generatePageWithTheme = (
  doc: any,
  item: SuratJalan,
  theme: ColorTheme
) => {
  const { nomor_surat, tujuan, tanggal, barang, no_po, nomor_kendaraan } = item;
  const keteranganProyek = item.keterangan_proyek || "-";
  const rowsPerPage = 10; // Max rows per page
  const scale = 0.7; // Skala untuk memperkecil ukuran footer

  // Aplikasikan Watermark
  doc.setFontSize(40);
  doc.setTextColor(230, 230, 230); // Light gray watermark
  doc.setFont("helvetica", "bold");
  doc.text(theme.watermarkText, 155, 11, {
    align: "center",
    angle: 0,
  });

  // Header
  const logoUrl = "https://i.imgur.com/AY0XZbq.jpeg";
  doc.addImage(logoUrl, "JPEG", 10, 1.5, 90, 20);

  const titleX = 145;
  const titleY = 15;
  const titleAlign: "left" | "center" | "right" = "center";

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(`SURAT JALAN / DELIVERY ORDER`, titleX, titleY, {
    align: titleAlign,
  });

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

  // Kembali ke font size standar
  doc.setFontSize(8);
  // Posisi nomor surat disesuaikan (dinaikkan)
  doc.text(`No: ${nomor_surat}`, 147, detailStartY - 5); // Nilai negatif untuk menaikkan
  doc.text(`Tgl / Date: ${formatTanggal(tanggal)}`, 147, detailStartY + 4);

  // Baris pertama: "Keterangan Proyek:"
  doc.text("Keterangan Proyek:", 105, detailStartY, { align: "center" });

  // Batasi panjang karakter maksimum untuk keteranganProyek
  const truncatedKeterangan = keteranganProyek.slice(0, 120);

  // Baris kedua: nilai keteranganProyek dengan pembatasan margin
  doc.text(truncatedKeterangan, 105, detailStartY + 5, {
    align: "center",
    maxWidth: 70, // Atur lebar maksimum teks dalam mm
  });

  doc.text(`No. PO: ${no_po || "-"}`, 171, detailStartY + 0, {
    align: "right",
  });
  doc.text(`No. Kendaraan: ${nomor_kendaraan || "-"}`, 180, detailStartY + 8, {
    align: "right",
  });

  // Barang Table
  const tableStartY = detailStartY + 15;
  const tableData = barang
    .slice(0, rowsPerPage)
    .map((barang, index) => [
      index + 1,
      barang.jumlah ?? "",
      barang.satuan ?? "",
      barang.kode ?? "",
      barang.nama ?? "",
      "",
    ]);

  // Menambahkan baris kosong jika data kurang dari rowsPerPage
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
      fillColor: theme.backgroundColor,
    },
    headStyles: {
      fillColor: theme.backgroundColor,
      textColor: 0,
      lineWidth: 0.5,
      lineColor: theme.borderColor,
    },
    bodyStyles: {
      lineColor: theme.borderColor,
    },
    theme: "grid",
    tableLineColor: theme.borderColor,
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
  const drawFooterNote = (
    doc: any,
    xOffset: number,
    yOffset: number,
    scale: number
  ) => {
    const baseFontSize = 8 * scale; // Set font size sekali untuk semua teks
    doc.setFontSize(baseFontSize);

    // Grup teks keterangan
    doc.text("Keterangan:", 10 + xOffset, footerStartY + yOffset); // Geser horizontal/vertikal
    doc.text("Putih: ACC", 50 + xOffset, footerStartY + yOffset);
    doc.text("Pink: Adm. Gudang", 90 + xOffset, footerStartY + yOffset);
    doc.text("Hijau: Penerima", 150 + xOffset, footerStartY + yOffset);
    doc.text("Kuning: Arsip", 190 + xOffset, footerStartY + yOffset);
  };

  // Panggil fungsi dengan offset
  const xOffset = 0; // Geser horizontal (positif = kanan, negatif = kiri)
  const yOffset = 24.5; // Geser vertikal (positif = bawah, negatif = atas)
  drawFooterNote(doc, xOffset, yOffset, scale);
};
