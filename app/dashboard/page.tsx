'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: number;
    username: string;
    email: string;
    role?: string;
}

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fungsi untuk membersihkan semua data autentikasi
    const clearAuthDataAndRedirect = () => {
        try {
            // Hapus localStorage items
            localStorage.clear();

            // Hapus semua cookies
            const cookies = document.cookie.split(';');
            for (let cookie of cookies) {
                const cookieName = cookie.split('=')[0].trim();
                // Hapus cookie untuk berbagai kemungkinan domain dan path
                document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
                document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname};`;
                document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname};`;
                document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}; secure; samesite=strict;`;
            }

            // Clear sessionStorage juga untuk berjaga-jaga
            sessionStorage.clear();

            // Redirect ke login setelah delay singkat
            setTimeout(() => {
                router.replace('/login');
            }, 100);
        } catch (error) {
            console.error('Error clearing auth data:', error);
            // Fallback: force reload ke login page
            window.location.href = '/login';
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    console.log('No token found');
                    clearAuthDataAndRedirect();
                    return;
                }

                const response = await fetch('/api/user', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.status === 401 || response.status === 403) {
                    console.log('Authentication failed');
                    clearAuthDataAndRedirect();
                    return;
                }

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const responseData = await response.json();

                if (responseData.success && responseData.data) {
                    const userData = responseData.data;
                    if (userData && userData.id && userData.username && userData.email) {
                        setUser(userData);
                        setError(null);
                    } else {
                        throw new Error('Incomplete user data');
                    }
                } else if (responseData.id && responseData.username && responseData.email) {
                    setUser(responseData);
                    setError(null);
                } else {
                    throw new Error('Invalid response format');
                }

            } catch (error) {
                console.error('Authentication error:', error);
                setError(error instanceof Error ? error.message : 'An unknown error occurred');
                clearAuthDataAndRedirect();
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="loader mb-4"></div>
                    <p className="text-gray-600">Memuat data...</p>
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
                            to { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="mb-4">
                        <svg
                            className="mx-auto h-12 w-12 text-red-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Sesi Anda telah berakhir
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Anda akan dialihkan ke halaman login dalam beberapa detik...
                    </p>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
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


                    {/* <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
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
                    </div> */}
                </div>
            </main>
        </div>
    );
}
