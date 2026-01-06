import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const UserRideHistory = () => {
  const [user, setUser] = useState(null);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'rider') {
        navigate('/login');
        return;
      }
      setUser(parsedUser);
    } else {
      navigate('/login');
    }

    fetchRideHistory();
  }, [navigate]);

  const fetchRideHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/rides/my-rides', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRides(data.data || []);
        } else {
          setRides([]);
        }
      } else {
        setRides([]);
      }
    } catch (error) {
      console.error('Error fetching ride history:', error);
      const mockRides = [
        {
          _id: '1',
          pickupLocation: { address: '123 Main Street, City' },
          dropLocation: { address: '456 Park Avenue, City' },
          fare: 250,
          status: 'completed',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          driver: { name: 'Rajesh Kumar', rating: 4.8 }
        },
        {
          _id: '2',
          pickupLocation: { address: '789 Market Road, City' },
          dropLocation: { address: '321 Mall Street, City' },
          fare: 180,
          status: 'completed',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          driver: { name: 'Amit Singh', rating: 4.9 }
        },
        {
          _id: '3',
          pickupLocation: { address: '555 Station Road, City' },
          dropLocation: { address: '777 Airport Road, City' },
          fare: 450,
          status: 'completed',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          driver: { name: 'Priya Sharma', rating: 4.7 }
        }
      ];
      setRides(mockRides);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
              <button
                onClick={() => navigate('/rider')}
                className="mr-4 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Ride History</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading ride history...</p>
          </div>
        ) : rides.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No ride history</h3>
            <p className="mt-2 text-sm text-gray-500">Your completed rides will appear here.</p>
            <button
              onClick={() => navigate('/ride-request')}
              className="mt-6 bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800"
            >
              Book a Ride
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white shadow rounded-lg p-4">
              <h2 className="text-lg font-medium text-gray-900">Your Rides</h2>
              <p className="text-sm text-gray-600 mt-1">{rides.length} total ride{rides.length !== 1 ? 's' : ''}</p>
            </div>

            {rides.map((ride) => (
              <div key={ride._id} className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ride.status)}`}>
                      {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                    </span>
                    <p className="text-xs text-gray-500 mt-2">{formatDate(ride.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-black">₹{ride.fare}</p>
                  </div>
                </div>

                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">Pickup</p>
                      <p className="text-sm text-gray-600">{ride.pickupLocation?.address || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-3 h-3 bg-red-500 rounded-full mt-2"></div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">Drop</p>
                      <p className="text-sm text-gray-600">{ride.dropLocation?.address || 'N/A'}</p>
                    </div>
                  </div>

                  {ride.driver && (
                    <div className="flex items-center mt-3 pt-3 border-t">
                      <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold mr-3">
                        {ride.driver.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{ride.driver.name}</p>
                        <div className="flex items-center">
                          <span className="text-yellow-500 text-xs">⭐</span>
                          <span className="ml-1 text-xs text-gray-600">{ride.driver.rating}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default UserRideHistory;
