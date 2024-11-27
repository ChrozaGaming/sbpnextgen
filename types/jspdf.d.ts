// types/jspdf.d.ts
import "jspdf";

interface AutoTableColumnStyles {
    cellWidth?: number;
    halign?: 'left' | 'center' | 'right';
}

interface AutoTableStyles {
    fontSize?: number;
    cellPadding?: number;
    overflow?: 'linebreak' | 'ellipsize' | 'visible' | 'hidden';
    halign?: 'left' | 'center' | 'right';
    lineWidth?: number;
}

interface AutoTableHeadStyles {
    fillColor?: number[];
    textColor?: number;
    fontStyle?: string;
    halign?: 'left' | 'center' | 'right';
    fontSize?: number;
}

interface AutoTableOptions {
    startY?: number;
    margin?: {
        left: number;
        right: number
    };
    head?: string[][];
    body?: (string | number)[][];
    theme?: 'striped' | 'grid' | 'plain';
    headStyles?: AutoTableHeadStyles;
    styles?: AutoTableStyles;
    columnStyles?: {
        [key: number]: AutoTableColumnStyles;
    };
}

declare module "jspdf" {
    interface jsPDF {
        autoTable: (options: AutoTableOptions) => jsPDF;
        previousAutoTable: {
            finalY: number;
        } | undefined;
    }
}
