import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const DriverDashboard = () => {
  const [user, setUser] = useState(null);
  const [driverStatus, setDriverStatus] = useState('offline');
  const [stats, setStats] = useState({
    todayEarnings: 0,
    totalRides: 0,
    rating: 5.0,
    onlineHours: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'driver') {
        navigate('/login');
        return;
      }
      setUser(parsedUser);
      setDriverStatus(parsedUser.driverStatus || 'offline');
      setStats({
        todayEarnings: parsedUser.todayEarnings || 0,
        totalRides: parsedUser.totalRides || 0,
        rating: parsedUser.rating || 5.0,
        onlineHours: parsedUser.onlineHours || 0
      });
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const toggleAvailability = async () => {
    const newStatus = driverStatus === 'online' ? 'offline' : 'online';
    setDriverStatus(newStatus);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ driverStatus: newStatus })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          localStorage.setItem('user', JSON.stringify(data.data));
          toast.success(newStatus === 'online' ? 'You are now online!' : 'You are now offline');
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.success(newStatus === 'online' ? 'You are now online!' : 'You are now offline');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center mr-3 overflow-hidden border-2 border-gray-100">
                {user.profilePicture ? (
                  <img src={user.profilePicture.startsWith('http') ? user.profilePicture : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${user.profilePicture}`} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-sm">{user.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <h1 className="text-xl font-bold text-gray-900">CabZee - Driver</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.name}</span>
              <button
                onClick={() => navigate('/driver-profile')}
                className="bg-black text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 transition-colors"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Driver Dashboard</h2>
            <p className="text-gray-600">Manage rides, track earnings, and grow your business</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Today's Earnings</dt>
                      <dd className="text-lg font-medium text-gray-900">₹{stats.todayEarnings}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Rides</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalRides}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Rating</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.rating} ⭐</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Status</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${driverStatus === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                          {driverStatus === 'online' ? 'Online' : 'Offline'}
                        </span>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              onClick={toggleAvailability}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 ${driverStatus === 'online' ? 'bg-red-500' : 'bg-green-500'} rounded-lg flex items-center justify-center`}>
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {driverStatus === 'online' ? 'Go Offline' : 'Go Online'}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {driverStatus === 'online' ? 'Stop accepting rides' : 'Start accepting rides'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              onClick={() => navigate('/incoming-ride-request')}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-gray-900">Ride Requests</h3>
                    <p className="text-gray-500 text-sm">View incoming requests</p>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-xs text-blue-600 font-bold">Check New Requests →</span>
                </div>
              </div>
            </div>

            <div
              onClick={() => navigate('/driver/documents')}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-gray-900">Driver Documents</h3>
                    <p className="text-gray-500 text-sm">Upload License/RC/Insurance</p>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-xs text-indigo-600 font-bold">Manage Documents →</span>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg opacity-60 cursor-not-allowed">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-medium text-gray-900">Trip History</h3>
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">Soon</span>
                    </div>
                    <p className="text-gray-500 text-sm">View completed rides</p>
                  </div>
                </div>
              </div>
            </div>

            <div
              onClick={() => navigate('/driver-earnings')}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Earnings</h3>
                    <p className="text-gray-500 text-sm">View daily earnings</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg mt-8">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Driver Status</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${driverStatus === 'online' ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                  <span className="text-sm font-medium text-gray-900">
                    {driverStatus === 'online' ? 'Online - Ready to accept rides' : 'Offline - Not accepting rides'}
                  </span>
                </div>
                <button
                  onClick={toggleAvailability}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${driverStatus === 'online'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                >
                  {driverStatus === 'online' ? 'Go Offline' : 'Go Online'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DriverDashboard;
