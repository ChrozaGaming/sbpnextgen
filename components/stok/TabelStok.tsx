// components/stok/TabelStok.tsx
import { ItemStok } from '@/types/stok';

interface TabelStokProps {
    items: ItemStok[];
    onEdit: (item: ItemStok) => void;
    onDelete: (item: ItemStok) => void;
}

export function TabelStok({ items, onEdit, onDelete }: TabelStokProps) {
    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Kode Barang
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Nama Barang
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Stok
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Aksi
                    </th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {item.kode_barang}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {item.nama_barang}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {item.jumlah} {item.satuan}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                                    item.status === 'aktif'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {item.status}
                                </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                                onClick={() => onEdit(item)}
                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => onDelete(item)}
                                className="text-red-600 hover:text-red-900"
                            >
                                Hapus
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
