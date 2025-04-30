'use client';

import React, { useState } from 'react';

// Definisi interface yang diperlukan oleh StokGudang.tsx
export interface DeleteStokButtonProps {
  id: number;
  kode: string;
  nama: string;
  onDelete: () => void;
}

const DeleteStokButton: React.FC<DeleteStokButtonProps> = ({ id, kode, nama, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/stok/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete stock item');
      }

      onDelete();
      setShowConfirm(false);
    } catch (error) {
      console.error('Error deleting stock:', error);
      alert('Failed to delete stock: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        className="text-red-600 hover:text-red-900"
        onClick={() => setShowConfirm(true)}
      >
        Hapus
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Konfirmasi Hapus</h3>
            <p className="mb-6">
              Apakah Anda yakin ingin menghapus item: <span className="font-semibold">{kode} - {nama}</span>?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
              >
                Batal
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteStokButton;