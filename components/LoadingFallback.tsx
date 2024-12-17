// components/LoadingFallback.tsx
import React from 'react';

const LoadingFallback = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-900/5 rounded-lg">
            {/* Spinner Animation */}
            <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-blue-200 animate-spin">
                    <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-t-4 border-blue-500"></div>
                </div>
            </div>

            {/* Loading Text */}
            <div className="mt-4 text-center">
                <p className="text-gray-700 font-medium">Memuat...</p>
                <p className="text-sm text-gray-500 mt-1">Mohon tunggu sebentar</p>
            </div>

            {/* Pulse Effect */}
            <div className="absolute">
                <div className="w-16 h-16 rounded-full bg-blue-500/10 animate-ping"></div>
            </div>
        </div>
    );
};

// Variant dengan custom message
const LoadingFallbackWithMessage = ({
                                        message = "Memuat...",
                                        subMessage = "Mohon tunggu sebentar"
                                    }: {
    message?: string;
    subMessage?: string;
}) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-900/5 rounded-lg">
            {/* Spinner Animation */}
            <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-blue-200 animate-spin">
                    <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-t-4 border-blue-500"></div>
                </div>
            </div>

            {/* Loading Text */}
            <div className="mt-4 text-center">
                <p className="text-gray-700 font-medium">{message}</p>
                <p className="text-sm text-gray-500 mt-1">{subMessage}</p>
            </div>

            {/* Pulse Effect */}
            <div className="absolute">
                <div className="w-16 h-16 rounded-full bg-blue-500/10 animate-ping"></div>
            </div>
        </div>
    );
};

// Variant dengan skeleton loading
const SkeletonLoading = () => {
    return (
        <div className="w-full max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-sm">
            <div className="animate-pulse space-y-4">
                {/* Header */}
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>

                {/* Content */}
                <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>

                {/* Video placeholder */}
                <div className="h-64 bg-gray-200 rounded-lg"></div>

                {/* Controls */}
                <div className="flex space-x-4">
                    <div className="h-10 bg-gray-200 rounded flex-1"></div>
                    <div className="h-10 bg-gray-200 rounded flex-1"></div>
                </div>
            </div>
        </div>
    );
};

// Variant dengan error state
const ErrorFallback = ({
                           error = "Terjadi kesalahan",
                           retry = () => {}
                       }: {
    error?: string;
    retry?: () => void;
}) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-red-50 rounded-lg">
            {/* Error Icon */}
            <div className="text-red-500 mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>

            {/* Error Message */}
            <p className="text-red-700 font-medium mb-4">{error}</p>

            {/* Retry Button */}
            <button
                onClick={retry}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600
                   transition-colors duration-200"
            >
                Coba Lagi
            </button>
        </div>
    );
};

// Export semua variants
export {
    LoadingFallbackWithMessage,
    SkeletonLoading,
    ErrorFallback
};

// Default export
export default LoadingFallback;
