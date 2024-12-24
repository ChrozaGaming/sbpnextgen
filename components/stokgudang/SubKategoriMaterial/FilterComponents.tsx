import React from 'react';

interface FilterOption {
    value: string;
    label: string;
}

interface FilterComponentsProps {
    onFilterChange: (filters: {
        kategori: string;
        brand: string;
        satuan: string;
        status: string;
    }) => void;
}

const KATEGORI_OPTIONS: FilterOption[] = [
    { value: 'material', label: 'Material' },
    { value: 'alat', label: 'Alat' },
    { value: 'consumable', label: 'Consumable' }
];

const SATUAN_OPTIONS: FilterOption[] = [
    { value: 'kg', label: 'Kilogram (KG)' },
    { value: 'kgset', label: 'Kilogram Set' },
    { value: 'pail', label: 'Pail' },
    { value: 'galon5liter', label: 'Galon 5 Liter' },
    { value: 'galon10liter', label: 'Galon 10 Liter' },
    { value: 'pcs', label: 'Pieces (PCS)' },
    { value: 'lonjor', label: 'Lonjor' },
    { value: 'liter', label: 'Liter' },
    { value: 'literset', label: 'Liter Set' },
    { value: 'sak', label: 'Sak' },
    { value: 'unit', label: 'Unit' }
];

const STATUS_OPTIONS: FilterOption[] = [
    { value: 'aman', label: 'Aman' },
    { value: 'rusak', label: 'Rusak' },
    { value: 'cacat', label: 'Cacat' },
    { value: 'sisa', label: 'Sisa' }
];

export const FilterComponents: React.FC<FilterComponentsProps> = ({ onFilterChange }) => {
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [brands, setBrands] = React.useState<string[]>([]);

    const [filters, setFilters] = React.useState({
        kategori: '',
        brand: '',
        satuan: '',
        status: ''
    });

    const [activeFilter, setActiveFilter] = React.useState<'kategori' | 'brand' | 'satuan' | 'status' | null>(null);

    React.useEffect(() => {
        const fetchBrands = async () => {
            try {
                const response = await fetch('/api/brands');

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setBrands(data.brands || []);

            } catch (err) {
                console.error('Error fetching brands:', err);
                setError('Failed to load brands');
            } finally {
                setLoading(false);
            }
        };

        fetchBrands();
    }, []);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;

        const newFilters = {
            ...filters,
            [name]: value
        };

        if (name === 'kategori' && value !== '') {
            newFilters.brand = '';
            newFilters.satuan = '';
            newFilters.status = '';
        } else if (name === 'brand' && value !== '') {
            newFilters.kategori = '';
            newFilters.satuan = '';
            newFilters.status = '';
        } else if (name === 'satuan' && value !== '') {
            newFilters.kategori = '';
            newFilters.brand = '';
            newFilters.status = '';
        } else if (name === 'status' && value !== '') {
            newFilters.kategori = '';
            newFilters.brand = '';
            newFilters.satuan = '';
        }

        setFilters(newFilters);
        setActiveFilter(value ? (name as 'kategori' | 'brand' | 'satuan' | 'status') : null);
        onFilterChange(newFilters);
    };

    const handleReset = () => {
        const resetFilters = {
            kategori: '',
            brand: '',
            satuan: '',
            status: ''
        };
        setFilters(resetFilters);
        setActiveFilter(null);
        onFilterChange(resetFilters);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div>
                <label htmlFor="kategori" className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori
                </label>
                <select
                    id="kategori"
                    name="kategori"
                    value={filters.kategori}
                    onChange={handleFilterChange}
                    disabled={activeFilter !== null && activeFilter !== 'kategori'}
                    className={`w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 
                        ${activeFilter !== null && activeFilter !== 'kategori' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                    <option value="">Semua Kategori</option>
                    {KATEGORI_OPTIONS.map((kategori) => (
                        <option key={kategori.value} value={kategori.value}>
                            {kategori.label}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                    Brand
                </label>
                <select
                    id="brand"
                    name="brand"
                    value={filters.brand}
                    onChange={handleFilterChange}
                    disabled={loading || (activeFilter !== null && activeFilter !== 'brand')}
                    className={`w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500
                        ${activeFilter !== null && activeFilter !== 'brand' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                    <option value="">Semua Brand</option>
                    {!loading && !error && brands.map((brand) => (
                        <option key={brand} value={brand}>
                            {brand}
                        </option>
                    ))}
                </select>
                {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            </div>

            <div>
                <label htmlFor="satuan" className="block text-sm font-medium text-gray-700 mb-1">
                    Satuan
                </label>
                <select
                    id="satuan"
                    name="satuan"
                    value={filters.satuan}
                    onChange={handleFilterChange}
                    disabled={activeFilter !== null && activeFilter !== 'satuan'}
                    className={`w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500
                        ${activeFilter !== null && activeFilter !== 'satuan' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                    <option value="">Semua Satuan</option>
                    {SATUAN_OPTIONS.map((satuan) => (
                        <option key={satuan.value} value={satuan.value}>
                            {satuan.label}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                </label>
                <select
                    id="status"
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    disabled={activeFilter !== null && activeFilter !== 'status'}
                    className={`w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500
                        ${activeFilter !== null && activeFilter !== 'status' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                    <option value="">Semua Status</option>
                    {STATUS_OPTIONS.map((status) => (
                        <option key={status.value} value={status.value}>
                            {status.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex items-end">
                <button
                    onClick={handleReset}
                    className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                    Reset Filter
                </button>
            </div>
        </div>
    );
};

export default FilterComponents;
