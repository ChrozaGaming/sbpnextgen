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
            // Validate that progress value matches enum
            if (!['onprogress', 'finish'].includes(data.progress)) {
                return NextResponse.json(
                    { error: 'Invalid progress value. Must be either "onprogress" or "finish"' },
                    { status: 400 }
                );
            }

            const [result] = await db.execute(
                'UPDATE rekap_po SET progress = ? WHERE id = ?',
                [data.progress, id]
            );
            return NextResponse.json({ success: true, data: result });
        }

        // Add console.log for debugging
        console.log('Update result:', result);

        return NextResponse.json({
            success: true,
            data: { id, progress }
        });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json(
            { error: 'Failed to update progress' },
            { status: 500 }
        );
    }
}