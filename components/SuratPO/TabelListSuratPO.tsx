'use client';

import React, { useEffect, useState } from 'react';

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
    po_number: string;
    date: string;
    supplier: string;
    address: string;
    attention: string;
    note: string;
    shipping_address: string;
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
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    const itemsPerPage = 10;

    const fetchData = async () => {
        try {
            const response = await fetch('/api/suratpo/getSuratPO');
            if (response.ok) {
                const data = await response.json();
                setPurchaseOrders(data);
            } else {
                console.error('Failed to fetch data');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [refresh]);

    const toggleRowExpansion = (id: number) => {
        setExpandedRows((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1)
            .toString()
            .padStart(2, '0')}-${date.getFullYear()}`;
    };

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
                    <React.Fragment key={po.id}>
                        <tr className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-2">{po.po_number}</td>
                            <td className="border border-gray-300 px-4 py-2">{formatDate(po.date)}</td>
                            <td className="border border-gray-300 px-4 py-2">{po.supplier}</td>
                            <td className="border border-gray-300 px-4 py-2">
                                {new Intl.NumberFormat('id-ID', {
                                    style: 'currency',
                                    currency: 'IDR',
                                }).format(po.subtotal)}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-orange-600 bg-orange-100">
                                {new Intl.NumberFormat('id-ID', {
                                    style: 'currency',
                                    currency: 'IDR',
                                }).format(po.tax)}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                                {new Intl.NumberFormat('id-ID', {
                                    style: 'currency',
                                    currency: 'IDR',
                                }).format(po.grand_total)}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                                <button
                                    onClick={() => toggleRowExpansion(po.id)}
                                    className="text-blue-500 hover:underline"
                                >
                                    {expandedRows.has(po.id) ? 'Hide Items' : 'Show Items'}
                                </button>
                            </td>
                        </tr>
                        {expandedRows.has(po.id) && (
                            <>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-300 px-4 py-2 text-left" colSpan={2}>
                                        Item Description
                                    </th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Code</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Qty Unit</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Price</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Total Price</th>
                                    <th className="border border-gray-300 px-4 py-2"></th>
                                </tr>
                                {po.items.map((item) => (
                                    <tr key={item.item_id} className="bg-gray-50">
                                        <td className="border border-gray-300 px-4 py-2" colSpan={2}>
                                            {item.item_description}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">{item.item_code}</td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            {item.quantity} {item.unit}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            {new Intl.NumberFormat('id-ID', {
                                                style: 'currency',
                                                currency: 'IDR',
                                            }).format(item.unit_price)}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            {new Intl.NumberFormat('id-ID', {
                                                style: 'currency',
                                                currency: 'IDR',
                                            }).format(item.amount)}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2"></td>
                                    </tr>
                                ))}
                            </>
                        )}
                    </React.Fragment>
                ))}
                </tbody>
            </table>
            <div className="flex justify-between items-center mt-4">
                <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
                >
                    Previous
                </button>
                <p>
                    Page {currentPage} of {totalPages}
                </p>
                <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default TabelListSuratPO;
