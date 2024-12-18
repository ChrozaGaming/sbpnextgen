// components/PDFGenerator.tsx
'use client';

import { useEffect } from 'react';
import { fonts } from '../utils/fonts';  // Update import path

interface PDFGeneratorProps {
    docDefinition: any;
    onComplete: () => void;
}

const PDFGenerator: React.FC<PDFGeneratorProps> = ({ docDefinition, onComplete }) => {
    useEffect(() => {
        const loadPdf = async () => {
            try {
                // Dynamically import pdfmake
                const pdfMake = (await import('pdfmake/build/pdfmake')).default;

                // Create PDF with custom fonts
                const pdf = pdfMake.createPdf({
                    ...docDefinition,
                    defaultStyle: {
                        font: 'Roboto',
                        ...docDefinition.defaultStyle
                    }
                }, null, fonts);

                // Download the PDF
                pdf.download(`rekap-po-${new Date().toISOString().slice(0, 10)}.pdf`, () => {
                    if (onComplete) {
                        onComplete();
                    }
                });
            } catch (error) {
                console.error('Error generating PDF:', error);
                alert('Terjadi kesalahan saat mencetak PDF');
                if (onComplete) {
                    onComplete();
                }
            }
        };

        loadPdf();
    }, [docDefinition, onComplete]);

    return null;
};

export default PDFGenerator;
