// components/stok/FormInput.tsx
interface FormInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    required?: boolean;
}

export const FormInput = ({ label, value, onChange, type = 'text', required = false }: FormInputProps) => {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <input
                type={type}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
            />
        </div>
    );
};
