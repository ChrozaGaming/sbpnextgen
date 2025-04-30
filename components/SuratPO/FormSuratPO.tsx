/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';

const unitOptions = [
  'kg',
  'kgset',
  'pail',
  'galon5liter',
  'galon10liter',
  'pcs',
  'lonjor',
  'liter',
  'literset',
  'sak',
  'unit',
];

type Item = {
  item_description: string;
  item_code: string;
  quantity: number;
  unit: string;
  unit_price: number;
  amount: number;
};

type FormData = {
  po_number: string;
  date: string;
  supplier: string;
  address: string;
  attention: string;
  note: string;
  shipping_address: string;
  bank: string;
  account: string;
  attention_pay_term: string;
  order_by: string;
  items: Item[];
};

type FormSuratPOProps = {
  readonly onSubmitSuccess?: () => void;
};

export default function FormSuratPO({ onSubmitSuccess }: FormSuratPOProps) {
  const [formData, setFormData] = useState<FormData>({
    po_number: '',
    date: new Date().toISOString().slice(0, 10),
    supplier: '',
    address: '',
    attention: '',
    note: '',
    shipping_address: '',
    bank: '',
    account: '',
    attention_pay_term: '',
    order_by: '',
    items: [
      {
        item_description: '',
        item_code: '',
        quantity: 1,
        unit: 'pcs',
        unit_price: 0,
        amount: 0,
      },
    ],
  });

  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ): void => {
    const { name, value } = e.target;
    const newItems = [...formData.items];

    if (name === 'quantity' || name === 'unit_price') {
      // Jika input dikosongkan, simpan 0 supaya perhitungan tetap aman
      const numeric = value === '' ? 0 : parseFloat(value);
      newItems[index][name as 'quantity' | 'unit_price'] = numeric;
      // Re-hitung amount
      newItems[index].amount = newItems[index].quantity * newItems[index].unit_price;
    } else if (name === 'amount') {
      newItems[index].amount = value === '' ? 0 : parseFloat(value);
    } else {
      newItems[index][name as keyof Item] = value as never;
    }

    setFormData((prev) => ({
      ...prev,
      items: newItems,
    }));
  };

  const addItem = (): void => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { item_description: '', item_code: '', quantity: 1, unit: 'pcs', unit_price: 0, amount: 0 },
      ],
    }));
  };

  const removeItem = (index: number): void => {
    if (formData.items.length === 1) {
      toast.error('Minimal harus ada 1 item');
      return;
    }
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      items: newItems,
    }));
  };

  const getSubtotal = (): number =>
    formData.items.reduce((sum, item) => sum + (item.amount || 0), 0);

  const getTax = (): number => getSubtotal() * 0.11;

  const getGrandTotal = (): number => getSubtotal() + getTax();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/suratpo/formsuratpo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message ?? 'Gagal menyimpan Purchase Order');
      }

      toast.success('Purchase Order berhasil disimpan!');
      if (formRef.current) formRef.current.reset();

      setFormData({
        po_number: '',
        date: new Date().toISOString().slice(0, 10),
        supplier: '',
        address: '',
        attention: '',
        note: '',
        shipping_address: '',
        bank: '',
        account: '',
        attention_pay_term: '',
        order_by: '',
        items: [
          {
            item_description: '',
            item_code: '',
            quantity: 1,
            unit: 'pcs',
            unit_price: 0,
            amount: 0,
          },
        ],
      });

      if (onSubmitSuccess) onSubmitSuccess();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan data';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="bg-white shadow-md rounded p-6">
      {/* --- form header fields dihilangkan untuk ringkas --- */}

      <h3 className="text-lg font-bold mt-6 mb-3">Detail Item</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="w-1/3 py-2 px-4 border">Deskripsi Item</th>
              <th className="w-1/6 py-2 px-4 border">Kode Item</th>
              <th className="w-1/12 py-2 px-4 border">Jumlah</th>
              <th className="w-1/12 py-2 px-4 border">Satuan</th>
              <th className="w-1/6 py-2 px-4 border">Harga Satuan</th>
              <th className="w-1/6 py-2 px-4 border">Total</th>
              <th className="w-1/12 py-2 px-4 border">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {formData.items.map((item, index) => (
              <tr key={`item-${index}`}>
                <td className="py-2 px-4 border">
                  <input
                    className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700"
                    name="item_description"
                    value={item.item_description}
                    onChange={(e) => handleItemChange(index, e)}
                    required
                  />
                </td>
                <td className="py-2 px-4 border">
                  <input
                    className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700"
                    name="item_code"
                    value={item.item_code}
                    onChange={(e) => handleItemChange(index, e)}
                    required
                  />
                </td>
                <td className="py-2 px-4 border">
                  <input
                    className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700"
                    type="number"
                    min="1"
                    name="quantity"
                    value={item.quantity === 0 ? '' : item.quantity}
                    onChange={(e) => handleItemChange(index, e)}
                    required
                  />
                </td>
                <td className="py-2 px-4 border">
                  <select
                    className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700"
                    name="unit"
                    value={item.unit}
                    onChange={(e) => handleItemChange(index, e)}
                    required
                  >
                    {unitOptions.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-2 px-4 border">
                  <input
                    className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700"
                    type="number"
                    min="0"
                    name="unit_price"
                    value={item.unit_price === 0 ? '' : item.unit_price}
                    onChange={(e) => handleItemChange(index, e)}
                    required
                  />
                </td>
                <td className="py-2 px-4 border font-medium">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  }).format(item.amount)}
                </td>
                <td className="py-2 px-4 border">
                  <button
                    type="button"
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                    onClick={() => removeItem(index)}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          {/* footer subtotal/tax/total dihilangkan demi ringkas */}
        </table>
      </div>

      <div className="flex items-center justify-center mt-6">
        <button
          className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          type="submit"
          disabled={loading}
        >
          {loading ? 'Menyimpan...' : 'Simpan Purchase Order'}
        </button>
      </div>
    </form>
  );
}
