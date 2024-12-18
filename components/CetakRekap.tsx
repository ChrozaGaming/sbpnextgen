'use client';

import { useState, useEffect } from 'react';
import { MultiSelect } from 'react-multi-select-component';
import { generateDocDefinition, RekapPO } from '@/utils/pdfGenerator';
import dynamic from 'next/dynamic';

const PDFGenerator = dynamic(() => import('./PDFGenerator'), {
    ssr: false,
    loading: () => <p>Loading PDF generator...</p>
});

interface CompanyOption {
    label: string;
    value: string;
    records: RekapPO[];
}

interface CetakRekapProps {
    onClose: () => void;
    data: RekapPO[];
}

const CetakRekap: React.FC<CetakRekapProps> = ({ onClose, data }) => {
    const [companies, setCompanies] = useState<CompanyOption[]>([]);
    const [selected, setSelected] = useState<CompanyOption[]>([]);
    const [selectedRecords, setSelectedRecords] = useState<RekapPO[]>([]);
    const [checkedRecords, setCheckedRecords] = useState<Set<number>>(new Set());
    const [generating, setGenerating] = useState(false);
    const [pdfDoc, setPdfDoc] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [selectedMonth, setSelectedMonth] = useState<string>('');

    const getYears = () => {
        const years = new Set(data.map(record =>
            new Date(record.tanggal).getFullYear()
        ));
        return Array.from(years).sort((a, b) => b - a);
    };

    const getMonthName = (month: number) => {
        return new Date(2000, month - 1, 1).toLocaleString('id-ID', { month: 'long' });
    };

    useEffect(() => {
        const groupedData = data.reduce((acc, curr) => {
            if (!acc[curr.nama_perusahaan]) {
                acc[curr.nama_perusahaan] = [];
            }
            acc[curr.nama_perusahaan].push(curr);
            return acc;
        }, {} as Record<string, RekapPO[]>);

        const companyOptions = Object.entries(groupedData)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([name, records]) => ({
                label: name,
                value: name,
                records: records
            }));

        setCompanies(companyOptions);
    }, [data]);

    const filterRecords = (records: RekapPO[]) => {
        return records.filter(record => {
            const recordDate = new Date(record.tanggal);
            const recordYear = recordDate.getFullYear().toString();
            const recordMonth = (recordDate.getMonth() + 1).toString();

            const matchesSearch = searchTerm === '' ||
                record.no_po.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.judulPO.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.nama_perusahaan.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesYear = selectedYear === '' || recordYear === selectedYear;
            const matchesMonth = selectedMonth === '' ||
                (recordYear === selectedYear && recordMonth === selectedMonth);

            return matchesSearch && matchesYear && matchesMonth;
        });
    };

    const handleCompanyChange = (selectedOptions: CompanyOption[]) => {
        setSelected(selectedOptions);
        const records = selectedOptions.flatMap(option => option.records);
        setSelectedRecords(filterRecords(records));
        setCheckedRecords(new Set());
    };

    const handleDateRangeChange = () => {
        const records = selected.flatMap(option => option.records);
        setSelectedRecords(filterRecords(records));
        setCheckedRecords(new Set());
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        const records = selected.flatMap(option => option.records);
        setSelectedRecords(filterRecords(records));
        setCheckedRecords(new Set());
    };

    const handleCheckRecord = (recordId: number) => {
        const newCheckedRecords = new Set(checkedRecords);
        if (newCheckedRecords.has(recordId)) {
            newCheckedRecords.delete(recordId);
        } else {
            newCheckedRecords.add(recordId);
        }
        setCheckedRecords(newCheckedRecords);
    };

    const handleCheckAll = (companyName: string) => {
        const companyRecords = selectedRecords.filter(
            record => record.nama_perusahaan === companyName
        );
        const allChecked = companyRecords.every(record => checkedRecords.has(record.id));

        const newCheckedRecords = new Set(checkedRecords);
        companyRecords.forEach(record => {
            if (allChecked) {
                newCheckedRecords.delete(record.id);
            } else {
                newCheckedRecords.add(record.id);
            }
        });

        setCheckedRecords(newCheckedRecords);
    };

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const handleGeneratePDF = async () => {
        if (checkedRecords.size === 0) {
            alert('Pilih minimal satu record untuk dicetak');
            return;
        }

        try {
            setGenerating(true);
            const recordsToPrint = selectedRecords.filter(record =>
                checkedRecords.has(record.id)
            );

            const docDefinition = generateDocDefinition(recordsToPrint);
            setPdfDoc(docDefinition);
        } catch (error) {
            console.error('Error preparing PDF:', error);
            alert('Terjadi kesalahan saat menyiapkan PDF');
            setGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto">
            <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 my-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Cetak Rekap Purchase Order</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pilih Perusahaan
                        </label>
                        <MultiSelect
                            options={companies}
                            value={selected}
                            onChange={handleCompanyChange}
                            labelledBy="Pilih Perusahaan"
                            className="min-w-[200px]"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cari PO
                            </label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                placeholder="Cari no PO, judul, atau perusahaan..."
                                className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tahun
                            </label>
                            <select
                                value={selectedYear}
                                onChange={(e) => {
                                    setSelectedYear(e.target.value);
                                    setSelectedMonth('');
                                    handleDateRangeChange();
                                }}
                                className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2"
                            >
                                <option value="">Semua Tahun</option>
                                {getYears().map(year => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Bulan
                            </label>
                            <select
                                value={selectedMonth}
                                onChange={(e) => {
                                    setSelectedMonth(e.target.value);
                                    handleDateRangeChange();
                                }}
                                disabled={!selectedYear}
                                className={`w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 
                                    ${!selectedYear ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            >
                                <option value="">Semua Bulan</option>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                    <option key={month} value={month}>
                                        {getMonthName(month)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {selected.length > 0 && (
                    <div className="space-y-6 max-h-[50vh] overflow-y-auto">
                        {selected.map(({ label: companyName, records }) => {
                            const filteredRecords = filterRecords(records);

                            if (filteredRecords.length === 0) return null;

                            return (
                                <div key={companyName} className="border rounded-lg p-4">
                                    <div className="mb-2">
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={filteredRecords.every(record =>
                                                    checkedRecords.has(record.id)
                                                )}
                                                onChange={() => handleCheckAll(companyName)}
                                                className="form-checkbox h-4 w-4 text-blue-600"
                                            />
                                            <span className="font-medium">{companyName}</span>
                                        </label>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full bg-white border">
                                            <thead>
                                            <tr className="bg-gray-50">
                                                <th className="px-4 py-2 w-10"></th>
                                                <th className="px-4 py-2">No PO</th>
                                                <th className="px-4 py-2">Judul PO</th>
                                                <th className="px-4 py-2">Tanggal</th>
                                                <th className="px-4 py-2">Nilai PO</th>
                                                <th className="px-4 py-2">Profit</th>
                                                <th className="px-4 py-2">Status</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {filteredRecords.map((record) => (
                                                <tr key={record.id} className="hover:bg-gray-50">
                                                    <td className="border px-4 py-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={checkedRecords.has(record.id)}
                                                            onChange={() => handleCheckRecord(record.id)}
                                                            className="form-checkbox h-4 w-4 text-blue-600"
                                                        />
                                                    </td>
                                                    <td className="border px-4 py-2">{record.no_po}</td>
                                                    <td className="border px-4 py-2">{record.judulPO}</td>
                                                    <td className="border px-4 py-2">
                                                        {new Date(record.tanggal).toLocaleDateString('id-ID')}
                                                    </td>
                                                    <td className="border px-4 py-2">{formatRupiah(record.nilai_po)}</td>
                                                    <td className={`border px-4 py-2 ${
                                                        record.profit < 0 ? 'text-red-600' : 'text-green-600'
                                                    }`}>
                                                        {formatRupiah(record.profit)}
                                                    </td>
                                                    <td className={`border px-4 py-2 ${
                                                        record.status < 0 ? 'text-red-600' : 'text-green-600'
                                                    }`}>
                                                        {record.status}%
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="flex justify-end space-x-2 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleGeneratePDF}
                        disabled={checkedRecords.size === 0 || generating}
                        className={`px-4 py-2 rounded ${
                            checkedRecords.size === 0 || generating
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                    >
                        {generating ? 'Mencetak...' : `Cetak Rekap (${checkedRecords.size} item)`}
                    </button>
                </div>

                {generating && pdfDoc && (
                    <PDFGenerator
                        docDefinition={pdfDoc}
                        onComplete={() => {
                            setTimeout(() => {
                                setGenerating(false);
                                setPdfDoc(null);
                                onClose();
                            }, 100);
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default CetakRekap;
