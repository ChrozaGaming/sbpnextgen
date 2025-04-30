'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';

// Separate component to handle search params
function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
    setSuccessMessage('');

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
        setSuccessMessage('Login berhasil! Mengalihkan...');

        // Pastikan role tersedia, default ke 'user' jika tidak ada
        const userRole = data.role || 'user';
        
        try {
          // Login dengan data lengkap
          await login(data.token, {
            userId: data.userId,
            username: data.username,
            email: data.email,
            role: userRole
          });
          
          // Berikan waktu untuk cookie disetel
          setTimeout(() => {
            const redirectPath = searchParams.get('redirect');
            if (redirectPath) {
              router.push(redirectPath);
            } else {
              router.push('/dashboard');
            }
          }, 300); // Delay 300ms untuk memastikan cookie disetel

        } catch (loginError) {
          console.error('Error during login process:', loginError);
          throw new Error('Gagal menyimpan sesi login');
        }
      } else {
        throw new Error(data.message || 'Login gagal');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      console.error('Login error:', err);
    } finally {
      // Keep loading true if successful since we're redirecting
      if (!successMessage) {
        setIsLoading(false);
      }
    }
  };

  // Cookie debugging helper
  useEffect(() => {
    const checkCookie = () => {
      const hasCookie = document.cookie.includes('token=');
      console.log('Token cookie present:', hasCookie);
    };

    // Check initial cookie state
    checkCookie();

    // Re-check after login
    if (successMessage) {
      const timer = setTimeout(checkCookie, 200);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Error handling for middleware
  useEffect(() => {
    const error = searchParams.get('error');
    const errorMessage = searchParams.get('errorMessage');

    if (error === 'middleware_error') {
      setError(errorMessage || 'Terjadi kesalahan pada autentikasi');
    }
  }, [searchParams]);

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-md shadow-lg w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-200">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded border border-green-200">
          <p className="font-medium">Sukses</p>
          <p className="text-sm">{successMessage}</p>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
          disabled={isLoading}
          autoComplete="email"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
          disabled={isLoading}
          autoComplete="current-password"
        />
      </div>

      <button
        type="submit"
        className={`w-full ${
          isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
        } text-white py-3 px-4 rounded-md transition-colors font-medium`}
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
            {successMessage ? 'Mengalihkan...' : 'Memproses...'}
          </div>
        ) : (
          'Login'
        )}
      </button>
    </form>
  );
}

// Loading component for Suspense fallback
function LoadingForm() {
  return (
    <div className="bg-white p-8 rounded-md shadow-lg w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Loading...</h2>
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

// Main component wrapped with Suspense
export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Suspense fallback={<LoadingForm />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
