import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const data = await request.json();

        // Check if this is a progress update
        if (data.progress) {
            const [result] = await db.execute(
                'UPDATE rekap_po SET progress = ? WHERE id = ?',
                [data.progress, id]
            );
            return NextResponse.json({ success: true, data: result });
        }

        // If not progress update, handle the existing biaya_pelaksanaan update
        const [result] = await db.execute(
            `UPDATE rekap_po 
             SET biaya_pelaksanaan = ?,
                 profit = ?,
                 status = ?
             WHERE id = ?`,
            [data.biaya_pelaksanaan, data.profit, data.status, id]
        );

        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json(
            { error: 'Failed to update data' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        const [result] = await db.execute(
            'DELETE FROM rekap_po WHERE id = ?',
            [id]
        );

        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json(
            { error: 'Failed to delete data' },
            { status: 500 }
        );
    }
}