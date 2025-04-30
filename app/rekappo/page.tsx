'use client';

import { useState, useEffect } from "react";

import TabelRekapPO from "@/components/RekapPO/TabelRekapPO";
import { RekapPO } from "@/types/RekapPO";
import BuatRekapPO from "@/components/RekapPO/BuatRekapPO";
import CetakRekap from "@/components/RekapPO/CetakRekap";

// ...lanjutkan kode seperti sebelumnya...

export default function RekapPOPage() {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [rekapData, setRekapData] = useState<RekapPO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data function
  const fetchRekapData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/rekap-po");
      if (!response.ok) throw new Error("Failed to fetch data");
      const data = await response.json();
      setRekapData(data);
    } catch (error) {
      console.error("Error fetching rekap data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on mount and when refresh counter changes
  useEffect(() => {
    fetchRekapData();
  }, [refreshCounter]);

  const handleOpenFormModal = () => setIsFormModalOpen(true);
  const handleCloseFormModal = () => setIsFormModalOpen(false);
  const handleOpenExportModal = () => setIsExportModalOpen(true);
  const handleCloseExportModal = () => setIsExportModalOpen(false);

  const handleSaveSuccess = () => {
    setIsFormModalOpen(false);
    setRefreshCounter((prev) => prev + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Rekapitulasi Purchase Order
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Informasi lengkap mengenai status dan progress purchase order
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Daftar Purchase Order
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Menampilkan seluruh data PO beserta status terkini
            </p>
          </div>
          <div className="flex gap-3">
            <button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
              onClick={handleOpenExportModal}
              disabled={isLoading || rekapData.length === 0}
            >
              Export Data
            </button>
            <button
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors"
              onClick={handleOpenFormModal}
            >
              Tambah PO Baru
            </button>
          </div>
        </div>
        <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <TabelRekapPO
              key={refreshCounter}
              data={rekapData}
              onDataLoaded={(data: RekapPO[]) => setRekapData(data)}
            />
          )}
        </div>
      </div>

      {isFormModalOpen && (
        <BuatRekapPO
          onSave={handleSaveSuccess}
          onCancel={handleCloseFormModal}
        />
      )}

      {isExportModalOpen && (
        <CetakRekap onClose={handleCloseExportModal} data={rekapData} />
      )}
    </div>
  );
}