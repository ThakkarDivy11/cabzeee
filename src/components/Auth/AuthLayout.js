import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Logo Section */}
          <div className="flex justify-center">
            <img src="/cabzee_logo.png" alt="CabZee Logo" className="w-48 mx-auto -mt-8" />
          </div>

          <div className="mt-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900">
              Welcome to CabZee
            </h1>
            <p className="mt-3 text-lg text-gray-600 font-medium">
              Your journey begins here
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Fast, reliable, and affordable rides at your fingertips
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white/80 backdrop-blur-lg py-8 px-6 shadow-2xl sm:rounded-2xl sm:px-10 border border-white/20">
            <Outlet />
          </div>
        </div>

        {/* Features section */}
        <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg border border-white/20 hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-sm text-gray-600">Get picked up within minutes of booking</p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg border border-white/20 hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Safe & Secure</h3>
              <p className="text-sm text-gray-600">Verified drivers and real-time tracking</p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg border border-white/20 hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Affordable</h3>
              <p className="text-sm text-gray-600">Competitive pricing with no hidden fees</p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>&copy; 2025 CabZee. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
