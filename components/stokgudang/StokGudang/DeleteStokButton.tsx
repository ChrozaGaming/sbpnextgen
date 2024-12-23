// components/stokgudang/StokGudang/DeleteStokButton.tsx
'use client';

import React, { useState } from 'react';

interface DeleteStokButtonProps {
    id: number;
    kode: string;
    nama: string;
    onDelete: () => void;
}

const DeleteStokButton: React.FC<DeleteStokButtonProps> = ({ id, kode, nama, onDelete }) => {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            const response = await fetch(`/api/stokgudang/${id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                onDelete();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error deleting stok:', error);
            alert('Gagal menghapus data');
        } finally {
            setIsDeleting(false);
            setShowConfirmation(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setShowConfirmation(true)}
                className="text-red-600 hover:text-red-900 font-medium"
            >
                Delete (Hapus)
            </button>

            {showConfirmation && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 max-w-sm mx-auto">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Konfirmasi Hapus
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Apakah Anda yakin ingin menghapus stok dengan kode{' '}
                            <span className="font-medium">{kode}</span> -{' '}
                            <span className="font-medium">{nama}</span>?
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowConfirmation(false)}
                                disabled={isDeleting}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 
                                    ${isDeleting
                                    ? 'bg-red-400 cursor-not-allowed'
                                    : 'bg-red-600 hover:bg-red-700'
                                }`}
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
