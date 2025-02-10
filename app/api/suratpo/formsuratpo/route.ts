import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Pastikan koneksi database sudah diatur di `lib/db`

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      po_number,
      date,
      supplier,
      address,
      attention,
      note,
      shipping_address,
      items,
      bank,
      account,
      attentionPayTerm,
      orderBy,
    } = body;

    // Validasi field wajib (misalnya, Order By tidak boleh kosong)
    if (!po_number || !date || !supplier || !address || !shipping_address || !items.length || !orderBy.trim()) {
      return NextResponse.json({ message: 'Missing required fields!' }, { status: 400 });
    }

    const subtotal = items.reduce((total: number, item: any) => total + item.amount, 0);
    const tax = subtotal * 0.11;
    const grand_total = subtotal + tax;
    // Misalnya, total_amount sama dengan subtotal
    const total_amount = subtotal;

    const [result]: any = await db.query(
      `INSERT INTO purchase_orders 
        (po_number, date, supplier, address, attention, note, shipping_address, bank, account, attention_pay_term, order_by, total_amount, subtotal, tax, grand_total)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        po_number,
        date,
        supplier,
        address,
        attention,
        note,
        shipping_address,
        bank,
        account,
        attentionPayTerm,
        orderBy,
        total_amount,
        subtotal,
        tax,
        grand_total,
      ]
    );

    const purchaseOrderId = result.insertId;

    const itemQueries = items.map((item: any) => {
      return db.query(
        `INSERT INTO purchase_order_items (purchase_order_id, item_description, item_code, quantity, unit, unit_price, amount)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          purchaseOrderId,
          item.item_description,
          item.item_code,
          item.quantity,
          item.unit,
          item.unit_price,
          item.amount,
        ]
      );
    });

    await Promise.all(itemQueries);

    return NextResponse.json({ message: 'Purchase Order saved successfully!' }, { status: 201 });
  } catch (error: any) {
    console.error('Error saving Purchase Order:', error);
    return NextResponse.json(
      {
        message: 'Failed to save Purchase Order',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
