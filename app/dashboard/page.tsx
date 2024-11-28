'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: number;
    username: string;
    email: string;
}

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            console.log('Checking authentication...'); // Debug log

            const token = localStorage.getItem('token');
            console.log('Token found:', !!token); // Debug log (jangan tampilkan token lengkap)

            if (!token) {
                console.log('No token found, redirecting to login...'); // Debug log
                router.replace('/login');
                return;
            }

            try {
                console.log('Fetching user data...'); // Debug log
                const response = await fetch('/api/user', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                console.log('Response status:', response.status); // Debug log

                // Log response headers untuk debugging
                const headers = Object.fromEntries(response.headers.entries());
                console.log('Response headers:', headers);

                if (response.status === 401 || response.status === 403) {
                    console.log('Authentication failed, redirecting to login...'); // Debug log
                    localStorage.removeItem('token');
                    router.replace('/login');
                    return;
                }

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const userData = await response.json();
                console.log('User data received:', userData); // Debug log

                if (!userData || !userData.id) {
                    throw new Error('Invalid user data received');
                }

                setUser(userData);
                setError(null);
            } catch (error) {
                console.error('Error during authentication:', error);
                setError(error instanceof Error ? error.message : 'An unknown error occurred');
                localStorage.removeItem('token');
                router.replace('/login');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    const handleLogout = () => {
        console.log('Logging out...'); // Debug log
        localStorage.removeItem('token');
        router.replace('/login');
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="loader mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                    <style jsx>{`
                        .loader {
                            border: 4px solid rgba(0, 0, 0, 0.1);
                            width: 36px;
                            height: 36px;
                            border-radius: 50%;
                            border-left-color: #4F46E5;
                            animation: spin 1s linear infinite;
                            margin: 0 auto;
                        }
                        @keyframes spin {
                            to {
                                transform: rotate(360deg);
                            }
                        }
                    `}</style>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 font-semibold mb-4">Error: {error}</p>
                    <button
                        onClick={() => router.replace('/login')}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Return to Login
                    </button>
                </div>
            </div>
        );
    }

    // No user state
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl font-semibold mb-4">User tidak ditemukan</p>
                    <button
                        onClick={() => router.replace('/login')}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Login Kembali
                    </button>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    {/*<button*/}
                    {/*    onClick={handleLogout}*/}
                    {/*    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"*/}
                    {/*>*/}
                    {/*    Logout*/}
                    {/*</button>*/}
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">User Information</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Username</p>
                                <p className="mt-1 text-lg font-semibold text-gray-900">{user.username}</p> {/* Tambahkan style */}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Email</p>
                                <p className="mt-1 text-lg font-semibold text-gray-900">{user.email}</p> {/* Tambahkan style */}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">ID</p>
                                <p className="mt-1 text-lg font-semibold text-gray-900">{user.id}</p>
                            </div>
                        </div>
                    </div>


                    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Total Projects
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                12
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Active Tasks
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                5
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Completed Tasks
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                25
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
