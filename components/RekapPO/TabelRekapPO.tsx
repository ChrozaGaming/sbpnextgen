/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import { RekapPO } from "@/types/RekapPO";

interface TabelRekapPOProps {
  data: RekapPO[];
  onDataLoaded?: (data: RekapPO[]) => void;
}

const formatRupiah = (value: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace("IDR", "Rp")
    .replace(/\s/g, "");

const getStatusColor = (status: number): string => {
  if (status <= -75)
    return "bg-gradient-to-r from-red-900 via-red-800 to-red-700";
  if (status <= -50)
    return "bg-gradient-to-r from-red-800 via-red-700 to-red-600";
  if (status <= -25)
    return "bg-gradient-to-r from-red-700 via-red-600 to-red-500";
  if (status < 0) return "bg-gradient-to-r from-red-600 via-red-500 to-red-400";
  if (status < 25)
    return "bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-300";
  if (status < 50)
    return "bg-gradient-to-r from-lime-500 via-lime-400 to-lime-300";
  if (status < 75)
    return "bg-gradient-to-r from-green-500 via-green-400 to-green-300";
  return "bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400";
};

function TabelRekapPO({ data, onDataLoaded }: TabelRekapPOProps) {
  const [localData, setLocalData] = useState<RekapPO[]>(data);
  const [updateStatus, setUpdateStatus] = useState<
    Record<number, { loading: boolean; error: string | null }>
  >({});

  useEffect(() => {
    setLocalData(data);
    if (onDataLoaded) onDataLoaded(data);
  }, [data, onDataLoaded]);

  // Simple debounce implementation without external libraries
  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  // Handle progress status change
  const handleProgressChange = useCallback(
    async (id: number, newProgress: "onprogress" | "finish") => {
      try {
        // Update UI state first
        setUpdateStatus((prev) => ({
          ...prev,
          [id]: { loading: true, error: null },
        }));

        // Update local data for immediate UI feedback
        setLocalData((currentData) =>
          currentData.map((item) =>
            item.id === id ? { ...item, progress: newProgress } : item
          )
        );

        // Send update to server
        const response = await fetch(`/api/rekap-po/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ progress: newProgress }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update progress");
        }

        // Update success state
        setUpdateStatus((prev) => ({
          ...prev,
          [id]: { loading: false, error: null },
        }));
      } catch (error) {
        console.error("Error updating progress:", error);
        // Revert local data on error
        setLocalData((currentData) =>
          currentData.map((item) =>
            item.id === id
              ? {
                  ...item,
                  progress:
                    data.find((d) => d.id === id)?.progress || item.progress,
                }
              : item
          )
        );

        // Update error state
        setUpdateStatus((prev) => ({
          ...prev,
          [id]: {
            loading: false,
            error:
              error instanceof Error ? error.message : "Unknown error occurred",
          },
        }));
      }
    },
    [data]
  );

  // Debounced version of the progress change handler
  const debouncedProgressChange = useCallback(
    debounce((id: number, newProgress: "onprogress" | "finish") => {
      handleProgressChange(id, newProgress);
    }, 500),
    [handleProgressChange]
  );

  // Function to render the dropdown
  const renderProgressDropdown = (po: RekapPO) => {
    const isLoading = updateStatus[po.id]?.loading;
    const hasError = updateStatus[po.id]?.error;

    return (
      <div className="relative">
        <select
          value={po.progress}
          onChange={(e) => debouncedProgressChange(po.id, e.target.value)}
          className={`
            capitalize w-full px-2 py-1 rounded border text-sm focus:outline-none focus:ring-2 transition-all duration-200
            ${
              hasError
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }
            ${isLoading ? "opacity-60 cursor-wait" : "cursor-pointer"}
            ${
              po.progress === "finish"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }
            dark:border-gray-600
          `}
          disabled={isLoading}
        >
          <option
            value="onprogress"
            className="bg-yellow-100 text-yellow-700 dark:bg-gray-700 dark:text-yellow-300"
          >
            OnProgress
          </option>
          <option
            value="finish"
            className="bg-green-100 text-green-700 dark:bg-gray-700 dark:text-green-300"
          >
            Finish
          </option>
        </select>

        {isLoading && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {hasError && (
          <div className="absolute w-full left-0 mt-1">
            <div className="bg-red-100 text-red-700 text-xs p-1 rounded">
              Failed to update
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full p-4 bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold dark:text-white">
          Rekap Purchase Order
        </h2>
      </div>
      <table className="min-w-full border dark:border-gray-700">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700 text-sm">
            <th className="px-4 py-2 border dark:border-gray-600 dark:text-gray-200">
              No PO
            </th>
            <th className="px-4 py-2 border dark:border-gray-600 dark:text-gray-200">
              Perusahaan
            </th>
            <th className="px-4 py-2 border dark:border-gray-600 dark:text-gray-200">
              Judul PO
            </th>
            <th className="px-4 py-2 border dark:border-gray-600 dark:text-gray-200">
              Tanggal
            </th>
            <th className="px-4 py-2 border dark:border-gray-600 dark:text-gray-200">
              Progress
            </th>
            <th className="px-4 py-2 border dark:border-gray-600 dark:text-gray-200">
              Nilai Penawaran
            </th>
            <th className="px-4 py-2 border dark:border-gray-600 dark:text-gray-200">
              Nilai PO
            </th>
            <th className="px-4 py-2 border dark:border-gray-600 dark:text-gray-200">
              Biaya Pelaksanaan
            </th>
            <th className="px-4 py-2 border dark:border-gray-600 dark:text-gray-200">
              Profit
            </th>
            <th className="px-4 py-2 border dark:border-gray-600 dark:text-gray-200">
              Status Profit
            </th>
            <th className="px-4 py-2 border dark:border-gray-600 dark:text-gray-200">
              Keterangan
            </th>
          </tr>
        </thead>
        <tbody>
          {localData.length === 0 ? (
            <tr>
              <td colSpan={11} className="text-center py-4 dark:text-gray-300">
                Tidak ada data.
              </td>
            </tr>
          ) : (
            localData.map((po) => (
              <tr
                key={po.id}
                className="text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="border px-4 py-2 dark:border-gray-600 dark:text-gray-300">
                  {po.no_po}
                </td>
                <td className="border px-4 py-2 dark:border-gray-600 dark:text-gray-300">
                  {po.nama_perusahaan}
                </td>
                <td className="border px-4 py-2 dark:border-gray-600 dark:text-gray-300">
                  {po.judulPO}
                </td>
                <td className="border px-4 py-2 dark:border-gray-600 dark:text-gray-300">
                  {new Date(po.tanggal).toLocaleDateString("id-ID")}
                </td>
                <td className="border px-4 py-2 dark:border-gray-600">
                  {renderProgressDropdown(po)}
                </td>
                <td className="border px-4 py-2 dark:border-gray-600 dark:text-gray-300">
                  {formatRupiah(po.nilai_penawaran)}
                </td>
                <td className="border px-4 py-2 dark:border-gray-600 dark:text-gray-300">
                  {formatRupiah(po.nilai_po)}
                </td>
                <td className="border px-4 py-2 dark:border-gray-600 dark:text-gray-300">
                  {formatRupiah(po.biaya_pelaksanaan)}
                </td>
                <td
                  className={`border px-4 py-2 dark:border-gray-600 ${
                    po.profit < 0
                      ? "text-red-600 dark:text-red-400"
                      : "text-green-600 dark:text-green-400"
                  }`}
                >
                  {formatRupiah(po.profit)}
                </td>
                <td className="border px-4 py-2 dark:border-gray-600 min-w-[200px]">
                  <div className="flex items-center space-x-2">
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4 overflow-hidden">
                      <div
                        className={`${getStatusColor(
                          Number(po.status)
                        )} h-4 rounded-full shadow-inner`}
                        style={{ width: `${Math.abs(po.status)}%` }}
                      />
                    </div>
                    <span
                      className={`text-xs font-medium min-w-[60px] ${
                        po.status < 0
                          ? "text-red-600 dark:text-red-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {Number(po.status).toFixed(2)}%
                    </span>
                  </div>
                </td>
                <td className="border px-4 py-2 dark:border-gray-600 dark:text-gray-300">
                  {po.keterangan}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TabelRekapPO;
