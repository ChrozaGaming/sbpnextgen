/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useRef, useEffect } from 'react';
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

  // Update amount when quantity or unit_price changes
  useEffect(() => {
    const updatedItems = formData.items.map(item => ({
      ...item,
      amount: item.quantity * item.unit_price
    }));
    
    if (JSON.stringify(updatedItems) !== JSON.stringify(formData.items)) {
      setFormData(prev => ({
        ...prev,
        items: updatedItems
      }));
    }
  }, [formData.items]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ): void => {
    const { name, value } = e.target;
    const updatedItems = [...formData.items];
    
    // Convert string values to number where appropriate
    if (name === 'quantity' || name === 'unit_price') {
      updatedItems[index] = {
        ...updatedItems[index],
        [name]: parseFloat(value) || 0,
      };
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        [name]: value,
      };
    }
    
    // Update amount
    if (name === 'quantity' || name === 'unit_price') {
      updatedItems[index].amount = 
        updatedItems[index].quantity * updatedItems[index].unit_price;
    }
    
    setFormData(prev => ({
      ...prev,
      items: updatedItems,
    }));
  };

  const addItem = (): void => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          item_description: '',
          item_code: '',
          quantity: 1,
          unit: 'pcs',
          unit_price: 0,
          amount: 0,
        },
      ],
    }));
  };

  const removeItem = (index: number): void => {
    if (formData.items.length === 1) {
      toast.error('Minimal harus ada 1 item');
      return;
    }
    
    const updatedItems = [...formData.items];
    updatedItems.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      items: updatedItems,
    }));
  };

  const calculateTotal = (): number => {
    return formData.items.reduce((total, item) => total + item.amount, 0);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    // Validasi field wajib di client
    if (
      !formData.po_number ||
      !formData.supplier ||
      !formData.address ||
      !formData.shipping_address ||
      !formData.order_by
    ) {
      toast.error('Harap lengkapi semua field yang diperlukan');
      return;
    }
    
    // Validasi items
    for (const item of formData.items) {
      if (!item.item_description || !item.item_code) {
        toast.error('Harap lengkapi semua detail item');
        return;
      }
      
      if (item.quantity <= 0 || item.unit_price < 0) {
        toast.error('Quantity harus lebih dari 0 dan harga tidak boleh negatif');
        return;
      }
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/suratpo/formsuratpo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Terjadi kesalahan saat menyimpan data');
      }
      
      toast.success('Purchase Order berhasil disimpan');
      
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
      
      // Reset form
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
      
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan saat menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-xl font-semibold mb-6">Form Surat Purchase Order</h2>
      
      <form ref={formRef} onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* PO Number */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="po_number">
              Nomor PO <span className="text-red-500">*</span>
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="po_number"
              name="po_number"
              type="text"
              value={formData.po_number}
              onChange={handleChange}
              required
            />
          </div>
          
          {/* Date */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
              Tanggal <span className="text-red-500">*</span>
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
          
          {/* Supplier */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="supplier">
              Supplier <span className="text-red-500">*</span>
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="supplier"
              name="supplier"
              type="text"
              value={formData.supplier}
              onChange={handleChange}
              required
            />
          </div>
          
          {/* Address */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
              Alamat Supplier <span className="text-red-500">*</span>
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={2}
              required
            />
          </div>
          
          {/* Attention */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="attention">
              Attention
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="attention"
              name="attention"
              type="text"
              value={formData.attention}
              onChange={handleChange}
            />
          </div>
          
          {/* Shipping Address */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="shipping_address">
              Alamat Pengiriman <span className="text-red-500">*</span>
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="shipping_address"
              name="shipping_address"
              value={formData.shipping_address}
              onChange={handleChange}
              rows={2}
              required
            />
          </div>
          
          {/* Bank */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bank">
              Bank
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="bank"
              name="bank"
              type="text"
              value={formData.bank}
              onChange={handleChange}
            />
          </div>
          
          {/* Account */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="account">
              Nomor Rekening
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="account"
              name="account"
              type="text"
              value={formData.account}
              onChange={handleChange}
            />
          </div>
          
          {/* Attention Pay Term */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="attention_pay_term">
              Attention Pay Term
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="attention_pay_term"
              name="attention_pay_term"
              type="text"
              value={formData.attention_pay_term}
              onChange={handleChange}
            />
          </div>
          
          {/* Order By */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="order_by">
              Dipesan Oleh <span className="text-red-500">*</span>
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="order_by"
              name="order_by"
              type="text"
              value={formData.order_by}
              onChange={handleChange}
              required
            />
          </div>
          
          {/* Note */}
          <div className="mb-4 md:col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="note">
              Catatan
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="note"
              name="note"
              value={formData.note}
              onChange={handleChange}
              rows={2}
            />
          </div>
        </div>
        
        {/* Items Table */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Detail Item</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Satuan</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 px-3">
                      <input
                        className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700"
                        name="item_description"
                        value={item.item_description}
                        onChange={(e) => handleItemChange(index, e)}
                        required
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700"
                        name="item_code"
                        value={item.item_code}
                        onChange={(e) => handleItemChange(index, e)}
                        required
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700"
                        type="number"
                        min="1"
                        name="quantity"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, e)}
                        required
                      />
                    </td>
                    <td className="py-2 px-3">
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
                    <td className="py-2 px-3">
                      <input
                        className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700"
                        type="number"
                        min="0"
                        name="unit_price"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(index, e)}
                        required
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 bg-gray-100"
                        type="number"
                        name="amount"
                        value={item.amount}
                        readOnly
                      />
                    </td>
                    <td className="py-2 px-3">
                      <button
                        type="button"
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                        onClick={() => removeItem(index)}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={5} className="py-2 px-3 text-right font-bold">
                    Total:
                  </td>
                  <td className="py-2 px-3 font-bold">
                    {calculateTotal().toLocaleString('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    })}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div className="mt-4">
            <button
              type="button"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={addItem}
            >
              + Tambah Item
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-end">
          <button
            type="submit"
            className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? 'Menyimpan...' : 'Simpan Purchase Order'}
          </button>
        </div>
      </form>
      
      {/* Debug view - comment out in production */}
      {/* <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="text-sm font-bold mb-2">Debug View:</h3>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(formData, null, 2)}
        </pre>
      </div> */}
    </div>
  );
}
