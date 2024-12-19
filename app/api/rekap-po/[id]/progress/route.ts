import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const { progress } = await request.json();

        // Add console.log for debugging
        console.log('Updating progress:', { id, progress });

        const [result] = await db.execute(
            'UPDATE rekap_po SET progress = ? WHERE id = ?',
            [progress, id]
        );

        // Verify the update was successful
        if (result.affectedRows === 0) {
            return NextResponse.json(
                { error: 'No record was updated' },
                { status: 400 }
            );
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