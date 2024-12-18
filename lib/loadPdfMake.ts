// lib/loadPdfMake.ts
let pdfMakeInstance: any = null;

export async function loadPdfMake() {
    if (pdfMakeInstance) {
        return pdfMakeInstance;
    }

    if (typeof window !== 'undefined') {
        const pdfMakeModule = await import('pdfmake/build/pdfmake');
        const pdfFontsModule = await import('pdfmake/build/vfs_fonts');

        pdfMakeInstance = pdfMakeModule.default;
        pdfMakeInstance.vfs = pdfFontsModule.pdfMake.vfs;

        return pdfMakeInstance;
    }

    return null;
}
