'use client';

import { useState, useEffect } from 'react';
import { MultiSelect } from 'react-multi-select-component';

interface RekapPO {
    id: number;
    no_po: string;
    judulPO: string;
    tanggal: string;
    status: string;
    nilai_penawaran: number;
    nilai_po: number;
    biaya_pelaksanaan: number;
    profit: number;
    keterangan: string;
    nama_perusahaan: string;
}

interface CetakRekapProps {
    onClose: () => void;
    data?: RekapPO[];
}

const CetakRekap: React.FC<CetakRekapProps> = ({ onClose, data = [] }) => {
    const [companies, setCompanies] = useState<CompanyOption[]>([]);
    const [selected, setSelected] = useState<CompanyOption[]>([]);
    const [selectedRecords, setSelectedRecords] = useState<RekapPO[]>([]);
    const [checkedRecords, setCheckedRecords] = useState<Set<number>>(new Set());
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/rekap-po');
                const data: RekapPO[] = await response.json();

                const groupedData = data.reduce((acc, curr) => {
                    if (!acc[curr.nama_perusahaan]) {
                        acc[curr.nama_perusahaan] = [];
                    }
                    acc[curr.nama_perusahaan].push(curr);
                    return acc;
                }, {} as Record<string, RekapPO[]>);

                const companyOptions = Object.entries(groupedData).map(([name, records]) => ({
                    label: name,
                    value: name,
                    records: records
                }));

                setCompanies(companyOptions);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const handleChange = (selectedOptions: CompanyOption[]) => {
        setSelected(selectedOptions);
        const records = selectedOptions.flatMap(option => option.records);
        setSelectedRecords(records);
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

    const handleCetak = async () => {
        if (checkedRecords.size === 0) {
            alert('Pilih minimal satu record untuk dicetak');
            return;
        }

        setIsLoading(true);

        try {
            const recordsToPrint = selectedRecords.filter(record =>
                checkedRecords.has(record.id)
            );

            const response = await fetch('/api/rekap-po/generate-pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ records: recordsToPrint }),
            });

            if (!response.ok) {
                throw new Error('Gagal generate PDF');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `rekap-po-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            onClose();
        } catch (error) {
            console.error('Error:', error);
            alert('Terjadi kesalahan saat mencetak rekap');
        } finally {
            setIsLoading(false);
        }
    };

    const groupedRecords = selectedRecords.reduce((acc, record) => {
        if (!acc[record.nama_perusahaan]) {
            acc[record.nama_perusahaan] = [];
        }
        acc[record.nama_perusahaan].push(record);
        return acc;
    }, {} as Record<string, RekapPO[]>);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-[1200px] max-h-[90vh] overflow-hidden">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Cetak Rekap PO</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pilih Perusahaan
                        </label>
                        <MultiSelect
                            options={companies}
                            value={selected}
                            onChange={handleChange}
                            labelledBy="Pilih Perusahaan"
                            hasSelectAll={true}
                            overrideStrings={{
                                selectAll: "Pilih Semua",
                                search: "Cari",
                                selectAllFiltered: "Pilih Semua (Terfilter)",
                                noOptions: "Tidak ada data",
                                selectSomeItems: "Pilih perusahaan..."
                            }}
                            className="w-full"
                        />
                    </div>

                    <div className="overflow-y-auto max-h-[calc(90vh-300px)]">
                        {Object.entries(groupedRecords).length > 0 ? (
                            <div className="space-y-6">
                                {Object.entries(groupedRecords).map(([companyName, records]) => (
                                    <div key={companyName}>
                                        <div className="bg-gray-100 p-3 rounded-t-lg">
                                            <label className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={records.every(record => checkedRecords.has(record.id))}
                                                    onChange={() => handleCheckAll(companyName)}
                                                    className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300"
                                                />
                                                <span className="font-medium">{companyName}</span>
                                            </label>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="w-10 px-4 py-3"></th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No PO</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul PO</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nilai PO</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                {records.map((record) => (
                                                    <tr key={record.id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3">
                                                            <input
                                                                type="checkbox"
                                                                checked={checkedRecords.has(record.id)}
                                                                onChange={() => handleCheckRecord(record.id)}
                                                                className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">{record.no_po}</td>
                                                        <td className="px-4 py-3">{record.judulPO}</td>
                                                        <td className="px-4 py-3">
                                                            {new Date(record.tanggal).toLocaleDateString('id-ID')}
                                                        </td>
                                                        <td className="px-4 py-3">{formatRupiah(record.nilai_po)}</td>
                                                        <td className="px-4 py-3">{formatRupiah(record.profit)}</td>
                                                        <td className="px-4 py-3">{record.status}%</td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                Pilih perusahaan untuk melihat data
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleCetak}
                            disabled={checkedRecords.size === 0 || isLoading}
                            className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white 
                                ${checkedRecords.size === 0 || isLoading
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                            }`}
                        >
                            {isLoading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Memproses...
                                </span>
                            ) : (
                                `Cetak Rekap (${checkedRecords.size} item)`
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CetakRekap;
