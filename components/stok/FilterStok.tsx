// components/stok/FilterStok.tsx
import { FormSelect } from './FormSelect';
import { FormInput } from './FormInput';

interface FilterStokProps {
    filter: {
        kategori: string;
        merek: string;
        pemasok: string;
        rentangTanggal: {
            mulai: string;
            selesai: string;
        };
    };
    onFilterChange: (filter: any) => void;
}

export const FilterStok = ({ filter, onFilterChange }: FilterStokProps) => {
    const kategoriOptions = [
        'Elektronik',
        'Pakaian',
        'Makanan',
        'Minuman',
        'Peralatan',
        'Lainnya'
    ];

    return (
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Filter Stok</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormSelect
                    label="Kategori"
                    value={filter.kategori}
                    onChange={(value) => onFilterChange({
                        ...filter,
                        kategori: value
                    })}
                    options={kategoriOptions}
                    placeholder="Semua Kategori"
                />

                <FormInput
                    label="Merek"
                    value={filter.merek}
                    onChange={(value) => onFilterChange({
                        ...filter,
                        merek: value
                    })}
                    placeholder="Cari merek..."
                />

                <FormInput
                    label="Tanggal Mulai"
                    type="date"
                    value={filter.rentangTanggal.mulai}
                    onChange={(value) => onFilterChange({
                        ...filter,
                        rentangTanggal: {
                            ...filter.rentangTanggal,
                            mulai: value
                        }
                    })}
                />

                <FormInput
                    label="Tanggal Selesai"
                    type="date"
                    value={filter.rentangTanggal.selesai}
                    onChange={(value) => onFilterChange({
                        ...filter,
                        rentangTanggal: {
                            ...filter.rentangTanggal,
                            selesai: value
                        }
                    })}
                />
            </div>

            <div className="mt-4 flex justify-end">
                <button
                    onClick={() => onFilterChange({
                        kategori: '',
                        merek: '',
                        pemasok: '',
                        rentangTanggal: {
                            mulai: '',
                            selesai: ''
                        }
                    })}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 mr-2"
                >
                    Reset Filter
                </button>
            </div>
        </div>
    );
};
