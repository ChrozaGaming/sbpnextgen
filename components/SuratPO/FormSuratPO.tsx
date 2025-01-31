'use client';

import React, { useState } from 'react';

const formatRupiah = (value: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
};

interface Item {
    item_description: string;
    item_code: string;
    quantity: number | string;
    unit: string;
    unit_price: number | string;
    amount: number;
}

interface FormData {
    po_number: string;
    date: string;
    supplier: string;
    address: string;
    attention: string;
    note: string;
    shipping_address: string;
    items: Item[];
}

const FormSuratPO: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        po_number: '',
        date: '',
        supplier: '',
        address: '',
        attention: '',
        note: '',
        shipping_address: '',
        items: [{ item_description: '', item_code: '', quantity: '', unit: '', unit_price: '', amount: 0 }],
    });

    const handleFieldChange = (field: keyof FormData, value: string | Item[]) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleItemChange = (index: number, field: keyof Item, value: string | number) => {
        const updatedItems = [...formData.items];
        updatedItems[index][field] = value;

        if (field === 'quantity' || field === 'unit_price') {
            const quantity = Number(updatedItems[index].quantity) || 0;
            const unitPrice = Number(updatedItems[index].unit_price) || 0;
            updatedItems[index].amount = quantity * unitPrice;
        }

        setFormData({ ...formData, items: updatedItems });
    };

    const handleAddItem = () => {
        setFormData({
            ...formData,
            items: [
                ...formData.items,
                { item_description: '', item_code: '', quantity: '', unit: '', unit_price: '', amount: 0 },
            ],
        });
    };

    const handleRemoveItem = (index: number) => {
        const updatedItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: updatedItems });
    };

    const calculateTotal = () => {
        return formData.items.reduce((total, item) => total + item.amount, 0);
    };

    const subTotal = calculateTotal();
    const tax = subTotal * 0.11;
    const grandTotal = subTotal + tax;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/suratpo/formsuratpo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert('Data saved successfully!');
                setFormData({
                    po_number: '',
                    date: '',
                    supplier: '',
                    address: '',
                    attention: '',
                    note: '',
                    shipping_address: '',
                    items: [{ item_description: '', item_code: '', quantity: '', unit: '', unit_price: '', amount: 0 }],
                });
            } else {
                alert('Failed to save data');
            }
        } catch (error) {
            console.error('Error saving data:', error);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg">
            <h1 className="text-2xl font-semibold mb-4">Purchase Order Form</h1>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">PO Number</label>
                        <input
                            type="text"
                            value={formData.po_number}
                            onChange={(e) => handleFieldChange('po_number', e.target.value)}
                            className="w-full border rounded-md p-2"
                            placeholder="PO Number"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Date</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => handleFieldChange('date', e.target.value)}
                            className="w-full border rounded-md p-2"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Supplier</label>
                        <input
                            type="text"
                            value={formData.supplier}
                            onChange={(e) => handleFieldChange('supplier', e.target.value)}
                            className="w-full border rounded-md p-2"
                            placeholder="Supplier"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Address</label>
                        <textarea
                            value={formData.address}
                            onChange={(e) => handleFieldChange('address', e.target.value)}
                            className="w-full border rounded-md p-2"
                            placeholder="Supplier Address"
                            required
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Attention</label>
                        <input
                            type="text"
                            value={formData.attention}
                            onChange={(e) => handleFieldChange('attention', e.target.value)}
                            className="w-full border rounded-md p-2"
                            placeholder="Attention"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Shipping Address</label>
                        <textarea
                            value={formData.shipping_address}
                            onChange={(e) => handleFieldChange('shipping_address', e.target.value)}
                            className="w-full border rounded-md p-2"
                            placeholder="Shipping Address"
                            required
                        ></textarea>
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium mb-2">Note</label>
                        <textarea
                            value={formData.note}
                            onChange={(e) => handleFieldChange('note', e.target.value)}
                            className="w-full border rounded-md p-2"
                            placeholder="Note"
                        ></textarea>
                    </div>
                </div>
                <h2 className="text-lg font-semibold mb-4">Items</h2>
                {formData.items.map((item, index) => (
                    <div key={index} className={`p-4 mb-4 rounded-md shadow-sm ${index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-50'}`}>
                        <h3 className="font-semibold mb-4">Items {index + 1}:</h3>
                        <div className="grid grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Item Description</label>
                                <input
                                    type="text"
                                    value={item.item_description}
                                    onChange={(e) => handleItemChange(index, 'item_description', e.target.value)}
                                    className="w-full border rounded-md p-2"
                                    placeholder="Description"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Item Code</label>
                                <input
                                    type="text"
                                    value={item.item_code}
                                    onChange={(e) => handleItemChange(index, 'item_code', e.target.value)}
                                    className="w-full border rounded-md p-2"
                                    placeholder="Code"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Quantity</label>
                                <input
                                    type="text"
                                    value={item.quantity}
                                    onChange={(e) =>
                                        handleItemChange(index, 'quantity', e.target.value.replace(/[^0-9]/g, ''))
                                    }
                                    onFocus={(e) => e.target.select()}
                                    className="w-full border rounded-md p-2"
                                    placeholder="0"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Unit</label>
                                <select
                                    value={item.unit}
                                    onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                                    className="w-full border rounded-md p-2"
                                    required
                                >
                                    <option value="">Select Unit</option>
                                    <option value="kg">kg</option>
                                    <option value="kgset">kgset</option>
                                    <option value="pail">pail</option>
                                    <option value="galon5liter">galon5liter</option>
                                    <option value="galon10liter">galon10liter</option>
                                    <option value="pcs">pcs</option>
                                    <option value="lonjor">lonjor</option>
                                    <option value="liter">liter</option>
                                    <option value="literset">literset</option>
                                    <option value="sak">sak</option>
                                    <option value="unit">unit</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Unit Price (Rp.)</label>
                                <input
                                    type="text"
                                    value={
                                        item.unit_price === ''
                                            ? ''
                                            : typeof item.unit_price === 'number'
                                                ? formatRupiah(item.unit_price)
                                                : item.unit_price
                                    }
                                    onChange={(e) =>
                                        handleItemChange(index, 'unit_price', Number(e.target.value.replace(/[^0-9]/g, '')))
                                    }
                                    onFocus={(e) => e.target.select()}
                                    className="w-full border rounded-md p-2"
                                    placeholder="Rp."
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Amount</label>
                                <input
                                    type="text"
                                    value={formatRupiah(item.amount)}
                                    readOnly
                                    className="w-full border rounded-md p-2 bg-gray-200 cursor-not-allowed"
                                />
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="mt-4 text-red-500 hover:underline"
                        >
                            Remove Item
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={handleAddItem}
                    className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition mb-4"
                >
                    Add Item
                </button>
                <div className="border-t border-gray-300 pt-4">
                    <h2 className="text-lg font-semibold mb-4">Rincian Perhitungan</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Total Amount</label>
                            <input
                                type="text"
                                value={formatRupiah(subTotal)}
                                readOnly
                                className="w-full border rounded-md p-2 bg-gray-200 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Sub Total</label>
                            <input
                                type="text"
                                value={formatRupiah(subTotal)}
                                readOnly
                                className="w-full border rounded-md p-2 bg-gray-200 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">PPN 11%</label>
                            <input
                                type="text"
                                value={formatRupiah(tax)}
                                readOnly
                                className="w-full border rounded-md p-2 bg-orange-200 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Grand Total</label>
                            <input
                                type="text"
                                value={formatRupiah(grandTotal)}
                                readOnly
                                className="w-full border rounded-md p-2 bg-gray-200 cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>
                <button
                    type="submit"
                    className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition mt-4"
                >
                    Save Purchase Order
                </button>
            </form>
        </div>
    );
};

export default FormSuratPO;
