/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
import React from 'react';

const InstruksiPanduan: React.FC = () => {
    return (
        <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-xl shadow-2xl max-w-4xl mx-auto border border-gray-100">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4">
                Panduan Penggunaan Rekap Purchase Order
            </h2>

            <div className="space-y-8">
                <section className="transform transition-all duration-300 hover:translate-x-2">
                    <h3 className="text-xl font-semibold text-blue-600 mb-4 flex items-center">
                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Fitur Utama
                    </h3>
                    <div className="ml-8 space-y-4">
                        <div className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <span className="text-blue-500 text-xl">•</span>
                            <div className="text-gray-700">
                                <span className="font-semibold">Buat Rekap PO Baru:</span> Tombol untuk membuat entri Purchase Order baru. Klik tombol ini di pojok kanan atas untuk menambahkan data PO baru.
                            </div>
                        </div>
                        <div className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <span className="text-blue-500 text-xl">•</span>
                            <div className="text-gray-700">
                                <span className="font-semibold">Cetak Rekap:</span> Fitur untuk mencetak atau mengekspor laporan rekap Purchase Order ke format PDF.
                            </div>
                        </div>
                    </div>
                </section>

                <section className="transform transition-all duration-300 hover:translate-x-2">
                    <h3 className="text-xl font-semibold text-blue-600 mb-4 flex items-center">
                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Pencarian dan Filter
                    </h3>
                    <div className="ml-8 space-y-4">
                        <div className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <span className="text-blue-500 text-xl">•</span>
                            <div className="text-gray-700">
                                <div className="font-semibold mb-2">Pencarian berdasarkan kategori:</div>
                                <ul className="ml-4 space-y-2 text-sm bg-gray-50 p-3 rounded-md">
                                    {['Nomor PO', 'Perusahaan', 'Judul PO', 'Tanggal', 'Status'].map((item) => (
                                        <li key={item} className="flex items-center space-x-2">
                                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <span className="text-blue-500 text-xl">•</span>
                            <div className="text-gray-700">
                                <span className="font-semibold">Filter Periode:</span> Gunakan filter tahun dan bulan untuk melihat data berdasarkan periode tertentu.
                            </div>
                        </div>
                    </div>
                </section>

                <section className="transform transition-all duration-300 hover:translate-x-2">
                    <h3 className="text-xl font-semibold text-blue-600 mb-4 flex items-center">
                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Detail Informasi
                    </h3>
                    <div className="ml-8 space-y-4">
                        <div className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <span className="text-blue-500 text-xl">•</span>
                            <div className="text-gray-700">
                                <div className="font-semibold mb-2">Informasi yang ditampilkan dalam tabel:</div>
                                <div className="grid grid-cols-2 gap-4 ml-4 text-sm bg-gray-50 p-3 rounded-md">
                                    {[
                                        'No PO', 'Perusahaan', 'Judul PO', 'Tanggal',
                                        'Nilai Penawaran', 'Nilai PO', 'Biaya Pelaksanaan',
                                        'Profit', 'Status Profit'
                                    ].map((item) => (
                                        <div key={item} className="flex items-center space-x-2">
                                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <span className="text-blue-500 text-xl">•</span>
                            <div className="text-gray-700">
                                <div className="font-semibold mb-2">Status Profit ditampilkan dengan indikator warna:</div>
                                <div className="ml-4 space-y-2 text-sm">
                                    <div className="flex items-center space-x-2 bg-red-50 p-2 rounded">
                                        <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                                        <span>Merah: Profit Negatif (Rugi) ({'<'}0%)</span>
                                    </div>
                                    <div className="flex items-center space-x-2 bg-yellow-50 p-2 rounded">
                                        <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                                        <span>Kuning: Profit Rendah (0-25%)</span>
                                    </div>
                                    <div className="flex items-center space-x-2 bg-green-50 p-2 rounded">
                                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                                        <span>Hijau: Profit Baik ({'>'}25%)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="transform transition-all duration-300 hover:translate-x-2">
                    <h3 className="text-xl font-semibold text-blue-600 mb-4 flex items-center">
                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Fitur Edit
                    </h3>
                    <div className="ml-8 space-y-4">
                        <div className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <span className="text-blue-500 text-xl">•</span>
                            <div className="text-gray-700">
                                <span className="font-semibold">Edit Biaya:</span> Klik tombol "Edit Biaya" untuk mengubah biaya pelaksanaan PO. Sistem akan otomatis menghitung ulang profit dan status.
                            </div>
                        </div>
                        <div className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <span className="text-blue-500 text-xl">•</span>
                            <div className="text-gray-700">
                                <span className="font-semibold">Preview Perubahan:</span> Saat melakukan edit, sistem akan menampilkan preview perhitungan profit dan status secara real-time sebelum perubahan disimpan.
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <div className="text-lg text-blue-800 font-semibold mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Tips Penggunaan:
                </div>
                <ul className="space-y-3 text-blue-700">
                    {[
                        'Manfaatkan kombinasi filter untuk pencarian data yang lebih efisien',
                        'Perhatikan indikator warna status profit untuk monitoring kinerja PO',
                        'Selalu cek preview perubahan sebelum menyimpan perubahan biaya',
                        'Gunakan fitur cetak untuk dokumentasi dan pelaporan'
                    ].map((tip, index) => (
                        <li key={tip} className="flex items-center space-x-3 bg-white/50 p-3 rounded-lg">
                            <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{tip}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default InstruksiPanduan;
