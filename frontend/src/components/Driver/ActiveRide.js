import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import MapContainer from '../Map/MapContainer';
import LiveLocationTracker from '../Map/LiveLocationTracker';
import UserMarker from '../Map/UserMarker';
import RoutePolyline from '../Map/RoutePolyline';
import DriverMarker from '../Map/DriverMarker';

const ActiveRide = () => {
  const [user, setUser] = useState(null);
  const [activeRide, setActiveRide] = useState(null);
  const [rideStatus, setRideStatus] = useState('accepted');
  const [loading, setLoading] = useState(true);

  // Map State
  const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropCoords, setDropCoords] = useState(null);
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

    const ride = localStorage.getItem('activeRide');
    if (ride) {
      const parsedRide = JSON.parse(ride);
      setActiveRide(parsedRide);
      setRideStatus('accepted');
      initializeMapData(parsedRide);
    } else {
      const mockRide = {
        _id: '1',
        rider: { name: 'John Doe', phone: '+1234567890', rating: 4.8 },
        pickupLocation: { address: '123 Main Street, City', coordinates: [77.2090, 28.6139] },
        dropLocation: { address: '456 Park Avenue, City', coordinates: [77.2290, 28.6339] },
        fare: 250,
        distance: '5.2 km',
        estimatedTime: '12 min',
        status: 'accepted'
      };
      setActiveRide(mockRide);
      setRideStatus('accepted');
      initializeMapData(mockRide);
    }
    setLoading(false);
  }, [navigate]);

  const initializeMapData = (ride) => {
    // Handle coordinates logic
    // Note: Coordinates in standard GeoJSON are [lon, lat], but Leaflet uses [lat, lon]

    let pCoords = [28.6139, 77.2090]; // Default CP Delhi
    let dCoords = [28.6339, 77.2290];

    if (ride.pickupLocation?.coordinates) {
      // Assume format is [lon, lat] from backend, need [lat, lon]
      pCoords = [ride.pickupLocation.coordinates[1], ride.pickupLocation.coordinates[0]];
    }

    if (ride.dropLocation?.coordinates) {
      dCoords = [ride.dropLocation.coordinates[1], ride.dropLocation.coordinates[0]];
    }

    setPickupCoords(pCoords);
    setDropCoords(dCoords);
    setRoutePositions([pCoords, dCoords]);
    setMapCenter(pCoords);
  };

  const handleLocationUpdate = (newPos) => {
    setCurrentLocation(newPos);
    // Optionally update backend with new driver location here
  };

  const handleStatusChange = async (newStatus) => {
    setRideStatus(newStatus);

    try {
      const token = localStorage.getItem('token');
      if (activeRide._id) {
        // Mock API call in case backend isn't real
        // const response = await fetch(...) 
      }

      if (newStatus === 'completed') {
        toast.success('Ride completed! Earnings added to your account.');
        localStorage.removeItem('activeRide');
        setTimeout(() => {
          navigate('/driver');
        }, 2000);
      } else if (newStatus === 'picked-up') {
        toast.success('Passenger picked up! Navigate to drop location.');
        // Switch map route to Drop location
        if (dropCoords) setMapCenter(dropCoords);
      } else if (newStatus === 'started') {
        toast.success('Ride started!');
      }
    } catch (error) {
      console.error('Error updating ride status:', error);
    }
  };

  if (loading || !user || !activeRide) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b z-10">
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
              <h1 className="text-xl font-bold text-gray-900">Active Ride</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full py-6 px-4 sm:px-6 lg:px-8 flex flex-col gap-6">

        {/* Live Map Section */}
        <div className="w-full h-80 rounded-lg overflow-hidden shadow-md relative z-0">
          <MapContainer center={currentLocation || mapCenter} zoom={15} className="h-full w-full">
            <LiveLocationTracker onLocationUpdate={handleLocationUpdate} track={true} />

            {/* Show Driver (Current Location) */}
            {currentLocation && <DriverMarker position={currentLocation} driverName={user.name} vehicleInfo={{ brand: 'My', model: 'Car' }} />}

            {/* Show Pickup Point if not picked up yet */}
            {rideStatus !== 'picked-up' && rideStatus !== 'completed' && pickupCoords && (
              <UserMarker position={pickupCoords} popupContent="Pickup Passenger Here" />
            )}

            {/* Show Drop Point */}
            {dropCoords && <UserMarker position={dropCoords} popupContent="Drop Passenger Here" />}

            {/* Route Line */}
            {routePositions.length > 0 && <RoutePolyline positions={routePositions} />}
          </MapContainer>
        </div>

        {/* Ride Controls & Info */}
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Passenger</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${rideStatus === 'accepted' ? 'bg-blue-100 text-blue-800' :
                  rideStatus === 'started' ? 'bg-yellow-100 text-yellow-800' :
                    rideStatus === 'picked-up' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                }`}>
                {rideStatus === 'accepted' ? 'Accepted' :
                  rideStatus === 'started' ? 'Started' :
                    rideStatus === 'picked-up' ? 'Picked Up' :
                      'Completed'}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-white text-xl font-bold">
                {activeRide.rider.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{activeRide.rider.name}</h3>
                <div className="flex items-center mt-1">
                  <span className="text-yellow-500 text-xs">⭐</span>
                  <span className="ml-1 text-sm text-gray-600">{activeRide.rider.rating}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{activeRide.rider.phone}</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Pickup</p>
                <p className="font-medium">{activeRide.pickupLocation?.address}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Drop</p>
                <p className="font-medium">{activeRide.dropLocation?.address}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Fare</p>
                <p className="font-medium">₹{activeRide.fare}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Distance</p>
                <p className="font-medium">{activeRide.distance}</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6 sticky bottom-0">
            <div className="flex flex-col gap-3">
              {rideStatus === 'accepted' && (
                <button
                  onClick={() => handleStatusChange('started')}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-md text-lg font-bold hover:bg-blue-700 shadow-md"
                >
                  Start Ride
                </button>
              )}

              {rideStatus === 'started' && (
                <button
                  onClick={() => handleStatusChange('picked-up')}
                  className="w-full bg-green-600 text-white px-4 py-3 rounded-md text-lg font-bold hover:bg-green-700 shadow-md"
                >
                  Passenger Picked Up
                </button>
              )}

              {rideStatus === 'picked-up' && (
                <button
                  onClick={() => handleStatusChange('completed')}
                  className="w-full bg-black text-white px-4 py-3 rounded-md text-lg font-bold hover:bg-gray-800 shadow-md"
                >
                  Complete Ride
                </button>
              )}

              {rideStatus !== 'completed' && (
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to cancel this ride?')) {
                      localStorage.removeItem('activeRide');
                      navigate('/driver');
                    }
                  }}
                  className="w-full bg-red-100 text-red-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-200"
                >
                  Cancel Ride
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ActiveRide;
