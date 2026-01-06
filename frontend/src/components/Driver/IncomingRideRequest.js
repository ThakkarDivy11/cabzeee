import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const IncomingRideRequest = () => {
  const [user, setUser] = useState(null);
  const [rideRequests, setRideRequests] = useState([]);
  const [loading, setLoading] = useState(true);
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
    } else {
      navigate('/login');
    }

    fetchRideRequests();
    const interval = setInterval(fetchRideRequests, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchRideRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/rides/pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRideRequests(data.data || []);
          if (data.data && data.data.length > 0) {
            console.log(`✅ Found ${data.data.length} pending ride request(s)`);
          }
        } else {
          setRideRequests([]);
          toast.error(data.message || 'Failed to fetch requests');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch ride requests:', errorData);
        setRideRequests([]);
        if (response.status === 401) {
          toast.error('Session expired. Please login again.');
          navigate('/login');
        } else {
          toast.error(errorData.message || 'Could not fetch ride requests');
        }
      }
    } catch (error) {
      console.error('Error fetching ride requests:', error);
      setRideRequests([]);
      toast.error('Network error. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  const handleViewRequest = (request) => {
    localStorage.setItem('selectedRideRequest', JSON.stringify(request));
    navigate('/accept-reject-ride');
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
                onClick={() => navigate('/driver')}
                className="mr-4 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Incoming Ride Requests</h1>
            </div>
            <button
              onClick={fetchRideRequests}
              className="bg-black text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading ride requests...</p>
          </div>
        ) : rideRequests.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No ride requests</h3>
            <p className="mt-2 text-sm text-gray-500">You'll see incoming ride requests here when passengers book rides.</p>
            <p className="mt-2 text-xs text-gray-400">Make sure you're online to receive requests!</p>
            <button
              onClick={() => navigate('/driver')}
              className="mt-4 bg-black text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white shadow rounded-lg p-4">
              <h2 className="text-lg font-medium text-gray-900">New Requests</h2>
              <p className="text-sm text-gray-600 mt-1">{rideRequests.length} pending request{rideRequests.length !== 1 ? 's' : ''}</p>
            </div>

            {rideRequests.map((request) => (
              <div key={request._id} className="bg-white shadow rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {request.rider.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{request.rider.name}</h3>
                      <div className="flex items-center mt-1">
                        <span className="text-yellow-500 text-xs">⭐</span>
                        <span className="ml-1 text-sm text-gray-600">{request.rider.rating}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{request.rider.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-black">₹{request.fare}</p>
                    {request.distance && <p className="text-sm text-gray-500 mt-1">{typeof request.distance === 'number' ? `${request.distance} km` : request.distance}</p>}
                    {request.estimatedTime && <p className="text-sm text-gray-500">{typeof request.estimatedTime === 'number' ? `${request.estimatedTime} min` : request.estimatedTime}</p>}
                  </div>
                </div>

                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">Pickup</p>
                      <p className="text-sm text-gray-600">{request.pickupLocation?.address || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-3 h-3 bg-red-500 rounded-full mt-2"></div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">Drop</p>
                      <p className="text-sm text-gray-600">{request.dropLocation?.address || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t flex space-x-3">
                  <button
                    onClick={() => handleViewRequest(request)}
                    className="flex-1 bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default IncomingRideRequest;
