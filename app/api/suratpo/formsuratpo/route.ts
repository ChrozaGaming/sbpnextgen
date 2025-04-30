import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    // Parse body request
    const body = await req.json();
    console.log("Body request:", body);

    // Ambil field sesuai frontend (snake_case)
    const {
      po_number,
      date,
      supplier,
      address,
      attention,
      note,
      shipping_address,
      bank,
      account,
      attention_pay_term,
      order_by,
      items,
    } = body;

    // Validasi data
    if (
      !po_number ||
      !date ||
      !supplier ||
      !address ||
      !shipping_address ||
      !order_by ||
      !items ||
      items.length === 0
    ) {
      return NextResponse.json(
        {
          message: "Data tidak lengkap. Harap isi semua field yang diperlukan.",
        },
        { status: 400 }
      );
    }

    // Hitung total
    const total_amount = items.reduce(
      (total: number, item: any) => total + Number(item.amount),
      0
    );
    const subtotal = total_amount;
    const tax = subtotal * 0.11; // PPN 11%
    const grand_total = subtotal + tax;

    // Insert PO header
    const [poResult]: any = await db.execute(
      `INSERT INTO purchase_orders (
        po_number, 
        date, 
        supplier, 
        address, 
        attention, 
        note, 
        shipping_address,
        bank,
        account,
        attention_pay_term,
        order_by,
        total_amount,
        subtotal, 
        tax, 
        grand_total
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        po_number,
        date,
        supplier,
        address,
        attention || null,
        note || null,
        shipping_address,
        bank || null,
        account || null,
        attention_pay_term || null,
        order_by,
        total_amount,
        subtotal,
        tax,
        grand_total,
      ]
    );

    // Dapatkan ID yang baru dimasukkan
    const purchaseOrderId = poResult.insertId;

    // Insert PO items
    for (const item of items) {
      // Validasi unit berada dalam enum yang valid
      const validUnits = [
        "kg",
        "kgset",
        "pail",
        "galon5liter",
        "galon10liter",
        "pcs",
        "lonjor",
        "liter",
        "literset",
        "sak",
        "unit",
      ];
      if (!validUnits.includes(item.unit)) {
        throw new Error(
          `Unit tidak valid: ${item.unit}. Nilai yang diizinkan: ${validUnits.join(", ")}`
        );
      }

      await db.execute(
        `INSERT INTO purchase_order_items (
          purchase_order_id,
          item_description,
          item_code,
          quantity,
          unit,
          unit_price,
          amount
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          purchaseOrderId,
          item.item_description,
          item.item_code,
          Number(item.quantity),
          item.unit,
          Number(item.unit_price),
          Number(item.amount),
        ]
      );
    }

    return NextResponse.json(
      {
        message: "Purchase Order berhasil disimpan",
        id: purchaseOrderId,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error membuat purchase order:", error);
    return NextResponse.json(
      {
        message: "Gagal menyimpan Purchase Order",
        error: error?.message || "Error tidak diketahui",
      },
      { status: 500 }
    );
  }
}
