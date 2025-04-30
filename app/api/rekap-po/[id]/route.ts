import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        // Await the entire params object first, then access properties
        const paramsData = await context.params;
        const id = paramsData.id;
        
        const data = await request.json();

        // Validate ID
        if (!id || isNaN(Number(id))) {
            return NextResponse.json(
                { error: 'Invalid ID provided' },
                { status: 400 }
            );
        }

        // Handle progress update
        if (data.progress !== undefined) {
            // Validate progress value
            if (!['onprogress', 'finish'].includes(data.progress)) {
                return NextResponse.json(
                    { error: 'Invalid progress value' },
                    { status: 400 }
                );
            }

            const [result] = await db.execute(
                'UPDATE rekap_po SET progress = ? WHERE id = ?',
                [data.progress, id]
            );

            if ((result as any).affectedRows === 0) {
                return NextResponse.json(
                    { error: 'Record not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                success: true,
                data: { id, progress: data.progress }
            });
        }

        // Handle biaya_pelaksanaan update
        if (data.biaya_pelaksanaan !== undefined) {
            // Validate numeric values
            const biaya = Number(data.biaya_pelaksanaan);
            const profit = Number(data.profit);
            const status = Number(data.status);

            if (isNaN(biaya) || isNaN(profit) || isNaN(status)) {
                return NextResponse.json(
                    { error: 'Invalid numeric values provided' },
                    { status: 400 }
                );
            }

            const [result] = await db.execute(
                `UPDATE rekap_po
                SET biaya_pelaksanaan = ?,
                    profit = ?,
                    status = ?
                WHERE id = ?`,
                [biaya, profit, status, id]
            );

            if ((result as any).affectedRows === 0) {
                return NextResponse.json(
                    { error: 'Record not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                success: true,
                data: { id, biaya_pelaksanaan: biaya, profit, status }
            });
        }

        return NextResponse.json(
            { error: 'No valid update parameters provided' },
            { status: 400 }
        );

    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
