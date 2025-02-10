'use client';

import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Perbarui interface PurchaseOrder untuk menyertakan data tambahan (bank, account, attention_pay_term, order_by)
interface PurchaseOrderItem {
  item_id: number;
  item_description: string;
  item_code: string;
  quantity: number;
  unit: string;
  unit_price: number;
  amount: number;
}

interface PurchaseOrder {
  id: number;
  po_number: string; // Misalnya: "PO-001", "PO-002", dsb.
  date: string;
  supplier: string;
  address: string;
  attention: string;
  note: string;
  shipping_address: string;
  bank: string;               // Data tambahan
  account: string;            // Data tambahan
  attention_pay_term: string; // Data tambahan
  order_by: string;           // Data tambahan
  total_amount: number;
  subtotal: number;
  tax: number;
  grand_total: number;
  items: PurchaseOrderItem[];
}

interface TabelListSuratPOProps {
  refresh?: boolean;
}

const TabelListSuratPO: React.FC<TabelListSuratPOProps> = ({ refresh }) => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  // Gunakan po_number sebagai identifier unik untuk expanded row (atau string null jika tidak ada)
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Fungsi format tanggal (dd-mm-yyyy) untuk tampilan tabel
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${date.getFullYear()}`;
  };

  // Fungsi format tanggal versi bahasa Indonesia (contoh: "17 Januari 2025")
  const formatDateIndo = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Fungsi untuk mengambil data dari API
  const fetchData = async () => {
    try {
      const response = await fetch('/api/suratpo/getSuratPO');
      if (response.ok) {
        const data = await response.json();
        setPurchaseOrders(data);
      } else {
        console.error('Gagal mengambil data');
      }
    } catch (error) {
      console.error('Error saat mengambil data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Panggil fetchData setelah render selesai
  useEffect(() => {
    setTimeout(() => {
      fetchData();
    }, 0);
  }, [refresh]);

  // Fungsi untuk toggle ekspansi baris
  const toggleRowExpansion = (poNumber: string) => {
    setExpandedRow((prev) => (prev === poNumber ? null : poNumber));
  };

  // Fungsi untuk menghasilkan file PDF menggunakan jsPDF dan jspdf-autotable
  const handlePrintPDF = (po: PurchaseOrder) => {
    // Buat objek jsPDF dengan orientasi portrait dan ukuran A4
    const doc = new jsPDF('p', 'mm', 'a4');
    const margin = 20;
    let y = margin;
    const pageWidth = doc.internal.pageSize.getWidth();

    // --- Header PDF ---
    doc.setFontSize(18);
    doc.text("PT. SINAR BUANA PRIMA", pageWidth / 2, y, { align: 'center' });
    y += 7;
    doc.setFontSize(10);
    doc.text("General Contractor, Supplier & Trading", pageWidth / 2, y, { align: 'center' });
    y += 5;
    doc.text("Jl. Raya Gelam Gg. Kemuning No. 22 Candi - Sidoarjo", pageWidth / 2, y, { align: 'center' });
    y += 5;
    doc.text("Phone: 031-8066777", pageWidth / 2, y, { align: 'center' });
    y += 10;

    // --- Tabel Detail PO ---
    const detailsBody = [
      ["Tanggal", formatDateIndo(po.date), "Supplier / Pemasok", po.supplier],
      ["PO Number", po.po_number, "Address / Alamat", po.address],
      ["Estimate Arrival", "ASAP", "Attention", po.attention || ""]
    ];

    (doc as any).autoTable({
      head: [],
      body: detailsBody,
      startY: y,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 50 },
        2: { cellWidth: 40 },
        3: { cellWidth: pageWidth - margin * 2 - 120 }
      },
      margin: { left: margin, right: margin }
    });
    y = (doc as any).lastAutoTable.finalY + 10;

    // --- Tabel Items ---
    const itemsHead = [["No", "Description", "Code No", "Qty", "Unit", "Price", "Amount"]];
    const itemsBody = po.items.map((item, index) => [
      index + 1,
      item.item_description,
      item.item_code,
      item.quantity,
      item.unit,
      new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.unit_price),
      new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.amount)
    ]);

    (doc as any).autoTable({
      head: itemsHead,
      body: itemsBody,
      startY: y,
      theme: 'striped',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 123, 255], textColor: [255, 255, 255] },
      margin: { left: margin, right: margin }
    });
    y = (doc as any).lastAutoTable.finalY + 10;

    // --- Footer Total ---
    doc.setFontSize(10);
    doc.text(`Sub Total: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(po.subtotal)}`, pageWidth - margin, y, { align: 'right' });
    y += 5;
    doc.text(`PPN 11%: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(po.tax)}`, pageWidth - margin, y, { align: 'right' });
    y += 5;
    doc.text(`Grand Total: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(po.grand_total)}`, pageWidth - margin, y, { align: 'right' });
    y += 10;

    // --- Tabel Notes ---
    // Buat informasi supplier payment dengan data tambahan dari PO
    const paymentInfo = `Payment, please transfer to:
Bank: ${po.bank || '-'}
A/C: ${po.account || '-'}
Attn: ${po.attention_pay_term || '-'}
Order By: ${po.order_by || '-'}`;

    const notesBody = [
      ["Payment Terms", "Sistem Pembayaran:"],
      ["Note", "From: PT. SINAR BUANA PRIMA\nJl. Raya Gelam Gg. Kemuning No. 22 Candi - Sidoarjo (Blkg. Kantor DISHUB), Phone: 031-8066777\nAlamat Kirim ke PT. KONIMEX - Gedung Farmasi\nJl. Mantung, Dusun II, Manang, Kec. Grogol, Kabupaten Sukoharjo, Jawa Tengah 57552\nUp. Bp. Wasdi"],
      ["Supplier Payment", paymentInfo]
    ];

    (doc as any).autoTable({
      head: [],
      body: notesBody,
      startY: y,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: pageWidth - margin * 2 - 40 }
      },
      margin: { left: margin, right: margin }
    });
    y = (doc as any).lastAutoTable.finalY + 10;

    // Simpan file PDF dengan nama sesuai PO Number
    doc.save(`PurchaseOrder-${po.po_number}.pdf`);
  };

  // Pagination
  const itemsPerPage = 10;
  const paginatedOrders = purchaseOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(purchaseOrders.length / itemsPerPage);
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return <p className="text-center">Loading...</p>;
  }

  if (purchaseOrders.length === 0) {
    return <p className="text-center">No Purchase Orders found</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="table-auto border-collapse w-full border border-gray-300 bg-white shadow-md rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 px-4 py-2 text-left">PO Number</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Supplier</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Subtotal</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Tax (PPN 11%)</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Grand Total</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedOrders.map((po) => (
            <React.Fragment key={po.po_number}>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">{po.po_number}</td>
                <td className="border border-gray-300 px-4 py-2">{formatDate(po.date)}</td>
                <td className="border border-gray-300 px-4 py-2">{po.supplier}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(po.subtotal)}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-orange-600 bg-orange-100">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(po.tax)}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(po.grand_total)}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <button onClick={() => toggleRowExpansion(po.po_number)} className="text-blue-500 hover:underline">
                    {expandedRow === po.po_number ? 'Hide Items' : 'Show Items'}
                  </button>
                  <button onClick={() => handlePrintPDF(po)} className="ml-2 text-green-500 hover:underline">
                    Cetak PDF
                  </button>
                </td>
              </tr>
              {expandedRow === po.po_number && (
                <React.Fragment key={`expanded-${po.po_number}`}>
                  <tr className="bg-gray-100" key={`header-${po.po_number}`}>
                    <th className="border border-gray-300 px-4 py-2 text-left" colSpan={2}>
                      Item Description
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Code</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Qty Unit</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Price</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Total Price</th>
                    <th className="border border-gray-300 px-4 py-2">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                  {po.items.map((item) => (
                    <tr key={`po-${po.po_number}-item-${item.item_id}`} className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2" colSpan={2}>
                        {item.item_description}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">{item.item_code}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.unit_price)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.amount)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2"></td>
                    </tr>
                  ))}
                </React.Fragment>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between items-center mt-4">
        <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50">
          Previous
        </button>
        <p>
          Page {currentPage} of {totalPages}
        </p>
        <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50">
          Next
        </button>
      </div>
    </div>
  );
};

export default TabelListSuratPO;
