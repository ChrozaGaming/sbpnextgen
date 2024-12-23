// app/unauthorized/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function UnauthorizedPage() {
    const router = useRouter()

    useEffect(() => {
        const clearAllCookiesAndRedirect = () => {
            try {
                // Hapus cookies dengan mengatur expired date ke masa lalu
                const cookies = document.cookie.split(';')

                for (let cookie of cookies) {
                    const cookieName = cookie.split('=')[0].trim()
                    // Hapus cookie dengan mengatur berbagai domain dan path
                    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`
                    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname};`
                    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname};`
                }

                // Hapus data dari localStorage
                localStorage.clear()

                // Hapus data dari sessionStorage
                sessionStorage.clear()

                // Delay sebentar sebelum redirect untuk memastikan cookies terhapus
                setTimeout(() => {
                    router.push('/login')
                }, 1500)

            } catch (error) {
                console.error('Error clearing cookies:', error)
                // Redirect ke login meskipun terjadi error
                router.push('/login')
            }
        }

        clearAllCookiesAndRedirect()
    }, [router])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                <div className="mb-6">
                    <svg
                        className="mx-auto h-16 w-16 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                    Akses Ditolak
                </h1>

                <p className="text-gray-600 mb-6">
                    Maaf, Anda tidak memiliki izin untuk mengakses halaman ini.
                    Anda akan dialihkan ke halaman login dalam beberapa detik.
                </p>

                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>

                <div className="mt-6 text-sm text-gray-500">
                    Menghapus sesi dan mengalihkan...
                </div>
            </div>
        </div>
    )
}

// Tambahkan helper function untuk menghapus cookies (opsional)
function deleteAllCookies() {
    const cookies = document.cookie.split(';')

    for (let cookie of cookies) {
        const cookieName = cookie.split('=')[0].trim()
        const domain = window.location.hostname

        // Hapus untuk root path
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`

        // Hapus untuk domain saat ini
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain};`

        // Hapus untuk subdomain
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${domain};`

        // Hapus dengan secure flag
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure;`

        // Hapus dengan httpOnly flag (meskipun JavaScript tidak bisa menghapus httpOnly cookies)
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure; httpOnly;`
    }
}
