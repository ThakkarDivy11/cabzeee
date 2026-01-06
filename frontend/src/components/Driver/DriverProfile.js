import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const DriverProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        if (data.success) {
          if (data.data.role !== 'driver') {
            navigate('/login');
            return;
          }
          setUser(data.data);
          localStorage.setItem('user', JSON.stringify(data.data));
        } else {
          toast.error(data.message || 'Failed to fetch profile');
          if (response.status === 401) navigate('/login');
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/driver')}
                className="mr-4 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center mr-3 overflow-hidden border-2 border-gray-200">
                {user.profilePicture ? (
                  <img src={user.profilePicture.startsWith('http') ? user.profilePicture : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${user.profilePicture}`} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-sm">{user.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <h1 className="text-xl font-bold text-gray-900">Driver Profile</h1>
            </div>
            <button
              onClick={() => navigate('/edit-driver-profile')}
              className="bg-black text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 transition-colors"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Driver Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and driver account settings.</p>
          </div>
          <div className="px-4 py-5 sm:p-6 flex flex-col items-center border-b border-gray-200 bg-gray-50">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg mb-4 bg-black flex items-center justify-center">
              {user.profilePicture ? (
                <img src={user.profilePicture.startsWith('http') ? user.profilePicture : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${user.profilePicture}`} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-4xl font-bold">{user.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-sm text-gray-500 capitalize">Driver</p>
            <div className="flex items-center mt-2">
              <span className="text-yellow-500">⭐</span>
              <span className="ml-1 text-sm font-medium text-gray-700">{user.rating || 5.0}</span>
              <span className="ml-2 text-sm text-gray-500">({user.totalRides || 0} rides)</span>
            </div>
          </div>
          <div className="px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Full name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.name}</dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Email address</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.email}</dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Phone number</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.phone}</dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Driver Status</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.driverStatus === 'online' ? 'bg-green-100 text-green-800' : 
                    user.driverStatus === 'busy' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.driverStatus || 'offline'}
                  </span>
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.isVerified ? 'Verified' : 'Unverified'}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {user.vehicleInfo && (
          <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Vehicle Information</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Information about your registered vehicle.</p>
            </div>
            <div className="px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-gray-200">
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Vehicle</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {user.vehicleInfo.make} {user.vehicleInfo.model} {user.vehicleInfo.year && `(${user.vehicleInfo.year})`}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">License Plate</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.vehicleInfo.licensePlate || 'Not set'}</dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Color</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.vehicleInfo.color || 'Not set'}</dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Type</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 capitalize">{user.vehicleInfo.vehicleType || 'Not set'}</dd>
                </div>
              </dl>
            </div>
            <div className="px-4 py-4 sm:px-6 border-t border-gray-200">
              <button
                onClick={() => navigate('/vehicle-details')}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Edit Vehicle Details →
              </button>
            </div>
          </div>
        )}

        {!user.vehicleInfo && (
          <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V7M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No vehicle information</h3>
              <p className="mt-1 text-sm text-gray-500">Add your vehicle details to start accepting rides.</p>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/vehicle-details')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800"
                >
                  Add Vehicle Details
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DriverProfile;
