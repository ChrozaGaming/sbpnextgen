"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  // Function to go back to the previous page
  const goBack = () => {
    router.back();
  };

  // Function to redirect to home page
  const goToHome = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-red-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white">Access Denied</h2>
        </div>

        <div className="p-6">
          <div className="flex justify-center mb-6">
            <div className="h-24 w-24 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-10v2m0 0v2m0-2h2m-2 0H9m9-6h.01M4 19.5h16a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H4A1.5 1.5 0 002.5 6v12A1.5 1.5 0 004 19.5z"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Unauthorized Access
          </h1>

          <p className="text-gray-600 text-center mb-6">
            You do not have permission to access this page. This feature is
            restricted to users with speciality role only.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={goBack}
              className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition duration-200"
            >
              Go Back
            </button>

            <button
              onClick={goToHome}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>

      <p className="mt-8 text-sm text-gray-500">
        If you believe you should have access to this page, please contact your
        system administrator.
      </p>
    </div>
  );
}
