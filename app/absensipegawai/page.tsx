// app/absensipegawai/page.tsx
'use client';

import React from 'react';
import AbsenPegawai from '@/components/AbsensiPegawai/AbsensiPegawai';

export default function AbsensiPegawaiPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-8 text-gray-800 dark:text-gray-100">
          Sistem Absensi Pegawai
        </h1>
        <AbsenPegawai />
      </div>
    </div>
  );
}
