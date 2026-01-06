import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import MapContainer from '../Map/MapContainer';
import UserMarker from '../Map/UserMarker';
import RoutePolyline from '../Map/RoutePolyline';

const AcceptRejectRide = () => {
  const [user, setUser] = useState(null);
  const [rideRequest, setRideRequest] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]);
  const [routePositions, setRoutePositions] = useState([]);
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

    const request = localStorage.getItem('selectedRideRequest');
    if (request) {
      const parsedRequest = JSON.parse(request);
      setRideRequest(parsedRequest);

      // Set map state
      if (parsedRequest.pickupLocation?.coordinates) {
        const [pLon, pLat] = parsedRequest.pickupLocation.coordinates;
        const [dLon, dLat] = parsedRequest.dropLocation.coordinates;
        setMapCenter([pLat, pLon]);
        setRoutePositions([[pLat, pLon], [dLat, dLon]]);
      }
    } else {
      toast.error('No ride request selected');
      navigate('/incoming-ride-request');
    }
  }, [navigate]);

  const handleAccept = async () => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/rides/${rideRequest._id}/accept`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Ride accepted! Navigate to pickup location.');
          localStorage.removeItem('selectedRideRequest');
          localStorage.setItem('activeRide', JSON.stringify(data.data));
          navigate('/active-ride');
        }
      } else {
        toast.error('Failed to accept ride. It may have been taken by another driver.');
        navigate('/incoming-ride-request');
      }
    } catch (error) {
      console.error('Error accepting ride:', error);
      toast.error('Connection error');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/rides/${rideRequest._id}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Ride rejected');
      }
      localStorage.removeItem('selectedRideRequest');
      navigate('/incoming-ride-request');
    } catch (error) {
      console.error('Error rejecting ride:', error);
      localStorage.removeItem('selectedRideRequest');
      navigate('/incoming-ride-request');
    } finally {
      setProcessing(false);
    }
  };

  if (!user || !rideRequest) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  const [pLon, pLat] = rideRequest.pickupLocation?.coordinates || [];
  const [dLon, dLat] = rideRequest.dropLocation?.coordinates || [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/incoming-ride-request')}
                className="mr-4 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-gray-900">New Ride Request</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full py-6 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-6">
        {/* Map Section */}
        <div className="w-full md:w-3/5 h-96 md:h-auto min-h-[400px] rounded-lg overflow-hidden shadow-md">
          <MapContainer center={mapCenter} zoom={14} className="h-full w-full">
            {pLat && pLon && <UserMarker position={[pLat, pLon]} popupContent="Pickup" />}
            {dLat && dLon && <UserMarker position={[dLat, dLon]} popupContent="Drop" />}
            {routePositions.length > 0 && <RoutePolyline positions={routePositions} />}
          </MapContainer>
        </div>

        {/* Details Section */}
        <div className="w-full md:w-2/5 flex flex-col gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {rideRequest.rider.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{rideRequest.rider.name}</h3>
                  <div className="flex items-center">
                    <span className="text-yellow-500">⭐</span>
                    <span className="ml-1 text-sm font-medium text-gray-700">{rideRequest.rider.rating}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-extrabold text-black">₹{rideRequest.fare}</p>
                <p className="text-sm text-gray-500">{rideRequest.distance} km trip</p>
              </div>
            </div>

            <div className="space-y-4 border-t pt-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-3 h-3 bg-green-500 rounded-full mt-1.5"></div>
                <div className="ml-3 flex-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase">Pickup Location</p>
                  <p className="text-sm text-gray-900 font-medium">{rideRequest.pickupLocation?.address || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-3 h-3 bg-red-500 rounded-full mt-1.5"></div>
                <div className="ml-3 flex-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase">Drop Location</p>
                  <p className="text-sm text-gray-900 font-medium">{rideRequest.dropLocation?.address || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={handleReject}
                disabled={processing}
                className="flex-1 bg-gray-100 text-gray-800 px-4 py-4 rounded-xl font-bold hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                disabled={processing}
                className="flex-1 bg-black text-white px-4 py-4 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 transition-colors shadow-lg"
              >
                {processing ? 'Accepting...' : 'Accept Ride'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AcceptRejectRide;
