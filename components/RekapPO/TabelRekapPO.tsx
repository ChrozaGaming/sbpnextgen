'use client';

import { useEffect } from 'react';
import { RekapPO } from '@/types/RekapPO';

interface TabelRekapPOProps {
  data: RekapPO[];
  onDataLoaded?: (data: RekapPO[]) => void;
}

const formatRupiah = (value: number): string =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace('IDR', 'Rp')
    .replace(/\s/g, '');

const getStatusColor = (status: number): string => {
  if (status <= -75) return 'bg-gradient-to-r from-red-900 via-red-800 to-red-700';
  if (status <= -50) return 'bg-gradient-to-r from-red-800 via-red-700 to-red-600';
  if (status <= -25) return 'bg-gradient-to-r from-red-700 via-red-600 to-red-500';
  if (status < 0) return 'bg-gradient-to-r from-red-600 via-red-500 to-red-400';
  if (status < 25) return 'bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-300';
  if (status < 50) return 'bg-gradient-to-r from-lime-500 via-lime-400 to-lime-300';
  if (status < 75) return 'bg-gradient-to-r from-green-500 via-green-400 to-green-300';
  return 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400';
};

function TabelRekapPO({ data, onDataLoaded }: TabelRekapPOProps) {
  useEffect(() => {
    if (onDataLoaded) onDataLoaded(data);
  }, [data, onDataLoaded]);

  return (
    <div className="w-full p-4 bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold dark:text-white">Rekap Purchase Order</h2>
      </div>
      <table className="min-w-full border dark:border-gray-700">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700 text-sm">
            <th className="px-4 py-2 border dark:border-gray-600 dark:text-gray-200">No PO</th>
            <th className="px-4 py-2 border dark:border-gray-600 dark:text-gray-200">Perusahaan</th>
            <th className="px-4 py-2 border dark:border-gray-600 dark:text-gray-200">Judul PO</th>
            <th className="px-4 py-2 border dark:border-gray-600 dark:text-gray-200">Tanggal</th>
            <th className="px-4 py-2 border dark:border-gray-600 dark:text-gray-200">Progress</th>
            <th className="px-4 py-2 border dark:border-gray-600 dark:text-gray-200">Nilai Penawaran</th>
            <th className="px-4 py-2 border dark:border-gray-600 dark:text-gray-200">Nilai PO</th>
            <th className="px-4 py-2 border dark:border-gray-600 dark:text-gray-200">Biaya Pelaksanaan</th>
            <th className="px-4 py-2 border dark:border-gray-600 dark:text-gray-200">Profit</th>
            <th className="px-4 py-2 border dark:border-gray-600 dark:text-gray-200">Status Profit</th>
            <th className="px-4 py-2 border dark:border-gray-600 dark:text-gray-200">Keterangan</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={11} className="text-center py-4 dark:text-gray-300">
                Tidak ada data.
              </td>
            </tr>
          ) : (
            data.map((po) => (
              <tr key={po.id} className="text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="border px-4 py-2 dark:border-gray-600 dark:text-gray-300">{po.no_po}</td>
                <td className="border px-4 py-2 dark:border-gray-600 dark:text-gray-300">{po.nama_perusahaan}</td>
                <td className="border px-4 py-2 dark:border-gray-600 dark:text-gray-300">{po.judulPO}</td>
                <td className="border px-4 py-2 dark:border-gray-600 dark:text-gray-300">
                  {new Date(po.tanggal).toLocaleDateString('id-ID')}
                </td>
                <td className="border px-4 py-2 dark:border-gray-600">
                  <span className={`capitalize px-2 py-1 rounded ${po.progress === 'finish' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {po.progress}
                  </span>
                </td>
                <td className="border px-4 py-2 dark:border-gray-600 dark:text-gray-300">{formatRupiah(po.nilai_penawaran)}</td>
                <td className="border px-4 py-2 dark:border-gray-600 dark:text-gray-300">{formatRupiah(po.nilai_po)}</td>
                <td className="border px-4 py-2 dark:border-gray-600 dark:text-gray-300">{formatRupiah(po.biaya_pelaksanaan)}</td>
                <td
                  className={`border px-4 py-2 dark:border-gray-600 ${
                    po.profit < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                  }`}
                >
                  {formatRupiah(po.profit)}
                </td>
                <td className="border px-4 py-2 dark:border-gray-600 min-w-[200px]">
                  <div className="flex items-center space-x-2">
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4 overflow-hidden">
                      <div
                        className={`${getStatusColor(Number(po.status))} h-4 rounded-full shadow-inner`}
                        style={{ width: `${Math.abs(po.status)}%` }}
                      />
                    </div>
                    <span
                      className={`text-xs font-medium min-w-[60px] ${
                        po.status < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                      }`}
                    >
                      {Number(po.status).toFixed(2)}%
                    </span>
                  </div>
                </td>
                <td className="border px-4 py-2 dark:border-gray-600 dark:text-gray-300">{po.keterangan}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TabelRekapPO;