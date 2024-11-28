// app/login/page.tsx
'use client';

import { useState, useEffect } from 'react'; // Tambahkan useEffect
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation'; // Tambahkan useSearchParams

export default function Login() {
    const { login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams(); // Tambahkan ini

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login gagal');
            }

            if (data.success) {
                // Hapus penyimpanan token manual karena sudah ditangani di AuthContext
                await login(data.token, {
                    userId: data.userId,
                    username: data.username,
                    email: data.email
                });

                // Redirect akan ditangani oleh fungsi login
                const redirectPath = searchParams.get('redirect');
                if (redirectPath) {
                    router.push(redirectPath);
                } else {
                    router.push('/dashboard');
                }
            } else {
                throw new Error(data.message || 'Login gagal');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
            console.error('Login error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Error handling untuk middleware
    useEffect(() => {
        const error = searchParams.get('error');
        const errorMessage = searchParams.get('errorMessage');

        if (error === 'middleware_error') {
            setError(errorMessage || 'Terjadi kesalahan pada autentikasi');
        }
    }, [searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-md shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

                {error && (
                    <div className="mb-4 p-2 bg-red-100 text-red-600 rounded">
                        {error}
                    </div>
                )}

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 p-2 rounded-md"
                        required
                        disabled={isLoading}
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 p-2 rounded-md"
                        required
                        disabled={isLoading}
                    />
                </div>

                <button
                    type="submit"
                    className={`w-full ${
                        isLoading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
                    } text-white py-2 px-4 rounded-md transition-colors`}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center">
                            <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                            Loading...
                        </div>
                    ) : (
                        'Login'
                    )}
                </button>
            </form>
        </div>
    );
}
