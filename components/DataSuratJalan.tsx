/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import { generatePDF } from "@/utils/suratjalan/pdfGenerator/pdfGenerator";

interface BarangDetail {
  kode: string | null;
  nama: string | null;
  jumlah: number | null;
  satuan: string | null;
}

interface SuratJalan {
  id: number;
  nomor_surat: string;
  tujuan: string;
  tanggal: string;
  nomor_kendaraan: string | null;
  no_po: string | null;
  keterangan_proyek: string | null;
  barang: BarangDetail[];
  created_at: string;
}

interface ApiResponse {
  data: SuratJalan[];
  pagination?: {
    totalPages: number;
    currentPage: number;
    totalItems?: number;
  };
  success: boolean;
  message?: string;
}

const formatTanggal = (tanggal: string): string => {
  const date = new Date(tanggal);
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "long",
    year: "numeric",
  };
  return date.toLocaleDateString("id-ID", options);
};

// Komponen tabel untuk surat jalan
const SuratJalanTable = ({
  data,
  sortField,
  sortOrder,
  handleSort,
  currentPage,
  ITEMS_PER_PAGE,
  loadingPDF,
  onPrintPDF,
}: {
  data: SuratJalan[];
  sortField: keyof SuratJalan;
  sortOrder: "asc" | "desc";
  handleSort: (field: keyof SuratJalan) => void;
  currentPage: number;
  ITEMS_PER_PAGE: number;
  loadingPDF: number | null;
  onPrintPDF: (item: SuratJalan) => void;
}) => {
  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th
              className="px-4 py-2 border-b cursor-pointer hover:bg-gray-200"
              onClick={() => handleSort("id")}
            >
              No {sortField === "id" && (sortOrder === "asc" ? "▲" : "▼")}
            </th>
            <th
              className="px-4 py-2 border-b cursor-pointer hover:bg-gray-200"
              onClick={() => handleSort("nomor_surat")}
            >
              Nomor Surat{" "}
              {sortField === "nomor_surat" && (sortOrder === "asc" ? "▲" : "▼")}
            </th>
            <th
              className="px-4 py-2 border-b cursor-pointer hover:bg-gray-200"
              onClick={() => handleSort("tujuan")}
            >
              Tujuan{" "}
              {sortField === "tujuan" && (sortOrder === "asc" ? "▲" : "▼")}
            </th>
            <th
              className="px-4 py-2 border-b cursor-pointer hover:bg-gray-200"
              onClick={() => handleSort("tanggal")}
            >
              Tanggal{" "}
              {sortField === "tanggal" && (sortOrder === "asc" ? "▲" : "▼")}
            </th>
            <th
              className="px-4 py-2 border-b cursor-pointer hover:bg-gray-200"
              onClick={() => handleSort("keterangan_proyek")}
            >
              Keterangan Proyek{" "}
              {sortField === "keterangan_proyek" &&
                (sortOrder === "asc" ? "▲" : "▼")}
            </th>
            <th className="px-4 py-2 border-b">Cetak PDF</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={item.id} className="text-center hover:bg-gray-50">
              <td className="px-4 py-2 border-b">
                {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
              </td>
              <td className="px-4 py-2 border-b">{item.nomor_surat}</td>
              <td className="px-4 py-2 border-b">{item.tujuan}</td>
              <td className="px-4 py-2 border-b">
                {formatTanggal(item.tanggal)}
              </td>
              <td className="px-4 py-2 border-b">
                {item.keterangan_proyek ?? "-"}
              </td>
              <td className="px-4 py-2 border-b">
                <button
                  onClick={() => onPrintPDF(item)}
                  disabled={loadingPDF === item.id}
                  className={`px-3 py-1 rounded ${
                    loadingPDF === item.id
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  }`}
                >
                  {loadingPDF === item.id ? "Memuat..." : "Cetak"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Komponen utama
const DataSuratJalan = () => {
  const [suratJalan, setSuratJalan] = useState<SuratJalan[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState<
    "nomor_surat" | "no_po" | "tujuan" | "keterangan_proyek"
  >("nomor_surat");
  const [sortField, setSortField] = useState<keyof SuratJalan>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingPDF, setLoadingPDF] = useState<number | null>(null);

  const ITEMS_PER_PAGE = 10;

  // Menghitung total halaman
  const calculateTotalPages = (data: ApiResponse): number => {
    if (data.pagination && typeof data.pagination.totalPages === "number") {
      return data.pagination.totalPages;
    }
    const totalItems = data.data.length;
    const calculatedTotalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
    console.warn(
      "Data pagination tidak tersedia, menggunakan perhitungan halaman alternatif"
    );
    return calculatedTotalPages;
  };

  // Fungsi untuk mengambil data surat jalan
  const fetchSuratJalan = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/suratjalan?search=${searchQuery}&field=${searchField}&sort=${sortField}&order=${sortOrder}&page=${currentPage}&limit=${ITEMS_PER_PAGE}`
      );
      if (!response.ok) throw new Error("Gagal mengambil data surat jalan");
      const data: ApiResponse = await response.json();
      if (data.success) {
        setSuratJalan(data.data ?? []);
        setTotalPages(calculateTotalPages(data));
      } else {
        throw new Error(data.message ?? "Error pada server");
      }
    } catch (err: any) {
      setError(err.message);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, searchField, sortField, sortOrder, currentPage]);

  // Debounce pencarian
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput, searchField]);

  // Efek untuk mengambil data saat parameter berubah
  useEffect(() => {
    fetchSuratJalan();
  }, [fetchSuratJalan]);

  // Fungsi validasi data barang
  const validateBarangData = (barang: BarangDetail[]): boolean => {
    if (!barang || !Array.isArray(barang) || barang.length === 0) {
      return false;
    }
    return !barang.some((b) => !b.kode || !b.nama || !b.jumlah || !b.satuan);
  };

  // Menangani pengurutan data
  const handleSort = (field: keyof SuratJalan) => {
    const newOrder =
      sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(newOrder);
  };

  // Menangani perubahan halaman
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Menangani cetak PDF
  const handlePrintPDF = async (item: SuratJalan) => {
    try {
      setLoadingPDF(item.id);
      const response = await fetch(`/api/suratjalan/${item.id}`);
      if (!response.ok) throw new Error("Gagal mengambil detail surat jalan");
      const data = await response.json();
      if (!data.success)
        throw new Error(
          data.message ?? "Terjadi kesalahan saat mengambil detail"
        );
      const detailData = data.data;
      if (!validateBarangData(detailData.barang)) {
        throw new Error("Data barang tidak lengkap atau tidak valid");
      }

      // Panggil fungsi generatePDF tanpa mengecek hasilnya
      generatePDF(detailData);
    } catch (err: any) {
      alert(`Gagal mencetak PDF: ${err.message}`);
      console.error("Error printing PDF:", err);
    } finally {
      setLoadingPDF(null);
    }
  };

  // Mengurutkan data surat jalan
  const getSortedSuratJalan = (): SuratJalan[] => {
    return [...suratJalan].sort((a, b) => {
      const fieldA = a[sortField];
      const fieldB = b[sortField];
      if (fieldA === null || fieldB === null) return 0;
      if (typeof fieldA === "string" && typeof fieldB === "string") {
        return sortOrder === "asc"
          ? fieldA.localeCompare(fieldB)
          : fieldB.localeCompare(fieldA);
      }
      if (typeof fieldA === "number" && typeof fieldB === "number") {
        return sortOrder === "asc" ? fieldA - fieldB : fieldB - fieldA;
      }
      return 0;
    });
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-2">Memuat data surat jalan...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md text-center my-4">
        <p className="font-medium">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  const sortedSuratJalan = getSortedSuratJalan();

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-center mb-4">Daftar Surat Jalan</h2>
      <div className="mb-4 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <select
          value={searchField}
          onChange={(e) => {
            setSearchField(e.target.value as any);
            setSearchInput("");
          }}
          className="w-full sm:w-auto border rounded-md p-2"
        >
          <option value="nomor_surat">Nomor Surat</option>
          <option value="no_po">No PO</option>
          <option value="tujuan">Tujuan</option>
          <option value="keterangan_proyek">Keterangan Proyek</option>
        </select>
        <input
          type="text"
          placeholder={`Cari berdasarkan ${searchField.replace("_", " ")}`}
          className="w-full flex-1 border rounded-md p-2"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>
      {sortedSuratJalan.length > 0 ? (
        <SuratJalanTable
          data={sortedSuratJalan}
          sortField={sortField}
          sortOrder={sortOrder}
          handleSort={handleSort}
          currentPage={currentPage}
          ITEMS_PER_PAGE={ITEMS_PER_PAGE}
          loadingPDF={loadingPDF}
          onPrintPDF={handlePrintPDF}
        />
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg border">
          <p>Tidak ada data surat jalan yang ditemukan</p>
        </div>
      )}

      <div className="flex justify-center items-center space-x-4 mt-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 border rounded-md ${
            currentPage === 1
              ? "text-gray-400 cursor-not-allowed"
              : "text-blue-500 hover:bg-blue-50"
          }`}
        >
          Previous
        </button>
        <span className="font-medium">
          Halaman {currentPage} dari {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 border rounded-md ${
            currentPage === totalPages
              ? "text-gray-400 cursor-not-allowed"
              : "text-blue-500 hover:bg-blue-50"
          }`}
        >
          Next
        </button>
      </div>

      <div className="mt-6 flex justify-center">
        <a
          href="/dashboard"
          className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
        >
          Kembali ke Dashboard
        </a>
      </div>
    </div>
  );
};

export default DataSuratJalan;
