// types/pdfmake.d.ts

declare module 'pdfmake/build/pdfmake' {
    const content: {
        createPdf: (docDefinition: any, tableLayouts?: any, fonts?: any, vfs?: any) => {
            download: (defaultFileName?: string, cb?: () => void, options?: any) => void;
            open: (options?: any) => void;
            print: (options?: any) => void;
            getBlob: (cb: (blob: Blob) => void) => void;
            getBase64: (cb: (base64: string) => void) => void;
            getBuffer: (cb: (buffer: ArrayBuffer) => void) => void;
            getDataUrl: (cb: (dataUrl: string) => void) => void;
        };
        vfs?: any;
    };
    export default content;
}

declare module 'pdfmake/build/vfs_fonts' {
    export const pdfMake: {
        vfs: {
            [key: string]: string;
        };
        [key: string]: any;
    };
    export const vfs: {
        [key: string]: string;
    };
}

declare module 'pdfmake/interfaces' {
    export interface TDocumentDefinitions {
        content: any[];
        styles?: {
            [key: string]: {
                fontSize?: number;
                bold?: boolean;
                italics?: boolean;
                alignment?: 'left' | 'center' | 'right' | 'justify';
                color?: string;
                margin?: number | [number, number, number, number];
                fillColor?: string;
            };
        };
        defaultStyle?: {
            fontSize?: number;
            font?: string;
        };
        pageSize?: string | { width: number; height: number };
        pageOrientation?: 'portrait' | 'landscape';
        pageMargins?: [number, number, number, number];
        info?: {
            title?: string;
            author?: string;
            subject?: string;
            keywords?: string;
        };
        header?: any;
        footer?: any;
        compress?: boolean;
        watermark?: string | { text: string; color: string; opacity: number; bold: boolean };
    }

    export interface TFontDictionary {
        [key: string]: TFontFamilyTypes;
    }

    export interface TFontFamilyTypes {
        normal?: string;
        bold?: string;
        italics?: string;
        bolditalics?: string;
    }

    export interface TDocumentInformation {
        title?: string;
        author?: string;
        subject?: string;
        keywords?: string;
    }

    export interface TTableLayouts {
        [key: string]: {
            hLineWidth?: (i: number, node: any) => number;
            vLineWidth?: (i: number, node: any) => number;
            hLineColor?: (i: number, node: any) => string;
            vLineColor?: (i: number, node: any) => string;
            fillColor?: (i: number, node: any) => string;
            paddingLeft?: (i: number, node: any) => number;
            paddingRight?: (i: number, node: any) => number;
            paddingTop?: (i: number, node: any) => number;
            paddingBottom?: (i: number, node: any) => number;
        };
    }

    export interface CustomTableLayout {
        hLineWidth?: (i: number, node: any) => number;
        vLineWidth?: (i: number, node: any) => number;
        hLineColor?: (i: number, node: any) => string;
        vLineColor?: (i: number, node: any) => string;
        fillColor?: (i: number, node: any) => string;
        paddingLeft?: (i: number, node: any) => number;
        paddingRight?: (i: number, node: any) => number;
        paddingTop?: (i: number, node: any) => number;
        paddingBottom?: (i: number, node: any) => number;
    }

    export interface StyleDictionary {
        [key: string]: {
            fontSize?: number;
            fontFamily?: string;
            bold?: boolean;
            italics?: boolean;
            alignment?: 'left' | 'center' | 'right' | 'justify';
            color?: string;
            columnGap?: number;
            margin?: number | [number, number, number, number];
            fillColor?: string;
        };
    }

    export interface TDocumentNode {
        text?: string | TDocumentNode[];
        style?: string | string[];
        alignment?: 'left' | 'center' | 'right' | 'justify';
        margin?: number | [number, number, number, number];
        ul?: TDocumentNode[];
        ol?: TDocumentNode[];
        table?: {
            body: any[][];
            widths?: string[] | number[] | 'auto' | '*';
            heights?: number[] | ((row: number) => number);
            headerRows?: number;
            dontBreakRows?: boolean;
            keepWithHeaderRows?: number;
            layout?: string | CustomTableLayout;
        };
        columns?: TDocumentNode[];
        image?: string;
        width?: number | 'auto';
        height?: number | 'auto';
        fit?: [number, number];
        pageBreak?: 'before' | 'after';
        pageOrientation?: 'portrait' | 'landscape';
        canvas?: any[];
    }
}

// Tambahan untuk react-multi-select-component jika diperlukan
declare module 'react-multi-select-component' {
    import { FC } from 'react';

    export interface IOption {
        label: string;
        value: string | number;
        [key: string]: any;
    }

    export interface MultiSelectProps {
        options: IOption[];
        value: IOption[];
        onChange: (selected: IOption[]) => void;
        labelledBy?: string;
        hasSelectAll?: boolean;
        isLoading?: boolean;
        shouldToggleOnHover?: boolean;
        overrideStrings?: { [key: string]: string };
        disabled?: boolean;
        className?: string;
        disableSearch?: boolean;
        filterOptions?: (options: IOption[], filter: string) => IOption[];
        [key: string]: any;
    }

    export const MultiSelect: FC<MultiSelectProps>;
}
