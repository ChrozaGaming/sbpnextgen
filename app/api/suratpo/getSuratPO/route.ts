import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Pastikan koneksi database diatur di lib/db

export async function GET() {
  try {
    // Query untuk mendapatkan data dari tabel `purchase_orders` dengan relasi ke tabel `purchase_order_items`
    const [orders]: any = await db.query(`
      SELECT
        po.id AS purchase_order_id,
        po.po_number,
        po.date,
        po.supplier,
        po.address,
        po.attention,
        po.note,
        po.shipping_address,
        po.bank,
        po.account,
        po.attention_pay_term,
        po.order_by,
        po.total_amount,
        po.subtotal,
        po.tax,
        po.grand_total,
        po.created_at,
        po.updated_at,
        poi.id AS item_id,
        poi.item_description,
        poi.item_code,
        poi.quantity,
        poi.unit,
        poi.unit_price,
        poi.amount
      FROM
        purchase_orders AS po
        LEFT JOIN purchase_order_items AS poi
          ON po.id = poi.purchase_order_id
      ORDER BY
        po.id ASC, poi.id ASC
    `);

    // Transformasi data untuk grup relasi
    const groupedOrders = orders.reduce((acc: any, row: any) => {
      const orderId = row.purchase_order_id;
      if (!acc[orderId]) {
        acc[orderId] = {
          purchase_order_id: row.purchase_order_id,
          po_number: row.po_number,
          date: row.date,
          supplier: row.supplier,
          address: row.address,
          attention: row.attention,
          note: row.note,
          shipping_address: row.shipping_address,
          bank: row.bank,
          account: row.account,
          attention_pay_term: row.attention_pay_term,
          order_by: row.order_by,
          total_amount: row.total_amount,
          subtotal: row.subtotal,
          tax: row.tax,
          grand_total: row.grand_total,
          created_at: row.created_at,
          updated_at: row.updated_at,
          items: [],
        };
      }

      if (row.item_id) {
        acc[orderId].items.push({
          item_id: row.item_id,
          item_description: row.item_description,
          item_code: row.item_code,
          quantity: row.quantity,
          unit: row.unit,
          unit_price: row.unit_price,
          amount: row.amount,
        });
      }

      return acc;
    }, {});

    // Mengubah hasil grup menjadi array
    const result = Object.values(groupedOrders);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching Purchase Orders:', error);
    return NextResponse.json(
      {
        message: 'Failed to fetch Purchase Orders',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
