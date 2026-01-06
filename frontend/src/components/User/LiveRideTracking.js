import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import MapContainer from '../Map/MapContainer';
import UserMarker from '../Map/UserMarker';
import DriverMarker from '../Map/DriverMarker';
import RoutePolyline from '../Map/RoutePolyline';
import socketService from '../../services/socketService';

const LiveRideTracking = () => {
    const { rideId } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [ride, setRide] = useState(null);
    const [loading, setLoading] = useState(true);
    const [driverLocation, setDriverLocation] = useState(null);
    const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]);
    const [routePositions, setRoutePositions] = useState([]);

    // Fetch ride details
    const fetchRideDetails = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/rides/${rideId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setRide(data.data);

                // Set initial map center to pickup location
                if (data.data.pickupLocation?.coordinates) {
                    const [lon, lat] = data.data.pickupLocation.coordinates;
                    setMapCenter([lat, lon]);
                }

                // Set driver location if available
                if (data.data.currentDriverLocation) {
                    setDriverLocation({
                        lat: data.data.currentDriverLocation.latitude,
                        lon: data.data.currentDriverLocation.longitude
                    });
                }
            } else {
                toast.error('Failed to load ride details');
                navigate('/rider');
            }
        } catch (error) {
            console.error('Error fetching ride:', error);
            toast.error('Failed to load ride details');
        } finally {
            setLoading(false);
        }
    }, [rideId, navigate]);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        } else {
            navigate('/login');
            return;
        }

        fetchRideDetails();

        // Connect to socket
        socketService.connect();
        socketService.joinRide(rideId);

        // Listen for location updates
        socketService.onLocationUpdate((locationData) => {
            console.log('📍 Received location update:', locationData);
            setDriverLocation({
                lat: locationData.latitude,
                lon: locationData.longitude
            });
        });

        // Listen for status updates
        socketService.onStatusUpdate((data) => {
            console.log('📢 Received status update:', data);
            setRide(prev => prev ? { ...prev, status: data.status } : null);
            toast.success(`Ride status: ${data.status}`);
        });

        // Listen for OTP verification
        socketService.onOTPVerified(() => {
            console.log('✅ OTP verified');
            setRide(prev => prev ? { ...prev, otpVerified: true } : null);
            toast.success('OTP verified! Driver can start the ride.');
        });

        return () => {
            socketService.leaveRide(rideId);
            socketService.removeAllListeners();
        };
    }, [rideId, navigate, fetchRideDetails]);

    // Update route when locations change
    useEffect(() => {
        if (!ride) return;

        const positions = [];

        // Add driver location if available
        if (driverLocation) {
            positions.push([driverLocation.lat, driverLocation.lon]);
        }

        const [pLon, pLat] = ride.pickupLocation?.coordinates || [];
        const [dLon, dLat] = ride.dropLocation?.coordinates || [];

        if (ride.status === 'accepted' || ride.status === 'started') {
            // Show route from driver to pickup
            if (pLat && pLon) {
                positions.push([pLat, pLon]);
            }
        }

        if (ride.status === 'picked-up') {
            // Show route from current location to drop
            if (dLat && dLon) {
                positions.push([dLat, dLon]);
            }
        }

        setRoutePositions(positions);
    }, [ride, driverLocation]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-lg">Loading ride details...</div>
            </div>
        );
    }

    if (!ride) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-lg">Ride not found</div>
            </div>
        );
    }

    const [pLon, pLat] = ride.pickupLocation?.coordinates || [];
    const [dLon, dLat] = ride.dropLocation?.coordinates || [];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white shadow-sm border-b z-10">
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
                            <h1 className="text-xl font-bold text-gray-900">Live Ride Tracking</h1>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${socketService.isConnected() ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-sm text-gray-600">
                                {socketService.isConnected() ? 'Connected' : 'Disconnected'}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full py-6 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-6">
                {/* Map Section */}
                <div className="w-full md:w-3/5 h-96 md:h-auto min-h-[400px] rounded-lg overflow-hidden shadow-md">
                    <MapContainer center={mapCenter} zoom={14} className="h-full w-full">
                        {pLat && pLon && <UserMarker position={[pLat, pLon]} popupContent="Pickup Location" />}
                        {dLat && dLon && <UserMarker position={[dLat, dLon]} popupContent="Drop Location" />}
                        {driverLocation && (
                            <DriverMarker
                                position={[driverLocation.lat, driverLocation.lon]}
                                driverName={ride.driver?.name || 'Driver'}
                                vehicleInfo={ride.driver?.vehicleInfo}
                            />
                        )}
                        {routePositions.length > 0 && <RoutePolyline positions={routePositions} />}
                    </MapContainer>
                </div>

                {/* Details Section */}
                <div className="w-full md:w-2/5 space-y-4">
                    {/* OTP Display */}
                    {ride.pickupOTP && !ride.otpVerified && (
                        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg p-6 shadow-lg">
                            <p className="text-sm font-medium mb-2">Pickup Verification Code</p>
                            <div className="flex items-center justify-center space-x-3">
                                {ride.pickupOTP.split('').map((digit, idx) => (
                                    <div key={idx} className="w-14 h-16 bg-white text-indigo-600 rounded-lg flex items-center justify-center text-3xl font-bold shadow-md">
                                        {digit}
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs mt-3 text-center opacity-90">Share this code with your driver at pickup</p>
                        </div>
                    )}

                    {ride.otpVerified && (
                        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                            <div className="flex items-center">
                                <div className="text-green-500 mr-3">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <p className="text-green-700 font-medium">OTP Verified ✓</p>
                            </div>
                        </div>
                    )}

                    {/* Ride Status */}
                    <div className="bg-white rounded-lg p-4 shadow">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Ride Status</h3>
                        <div className="flex items-center">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${ride.status === 'pending' ? 'bg-orange-100 text-orange-800 animate-pulse' :
                                ride.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                                    ride.status === 'started' ? 'bg-yellow-100 text-yellow-800' :
                                        ride.status === 'picked-up' ? 'bg-purple-100 text-purple-800' :
                                            ride.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                'bg-gray-100 text-gray-800'
                                }`}>
                                {ride.status === 'pending' ? 'SEARCHING FOR DRIVER' : ride.status.toUpperCase().replace('-', ' ')}
                            </span>
                        </div>
                    </div>

                    {/* Driver Details */}
                    {ride.driver && (
                        <div className="bg-white rounded-lg p-4 shadow">
                            <h3 className="text-sm font-medium text-gray-500 mb-3">Driver Details</h3>
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white text-lg font-bold">
                                    {ride.driver.name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">{ride.driver.name}</p>
                                    <p className="text-sm text-gray-500">{ride.driver.phone}</p>
                                    {ride.driver.vehicleInfo && (
                                        <p className="text-xs text-gray-400">
                                            {ride.driver.vehicleInfo.make} {ride.driver.vehicleInfo.model}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center">
                                    <span className="text-yellow-500">⭐</span>
                                    <span className="ml-1 text-sm font-medium">{ride.driver.rating || '5.0'}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Trip Details */}
                    <div className="bg-white rounded-lg p-4 shadow">
                        <h3 className="text-sm font-medium text-gray-500 mb-3">Trip Details</h3>
                        <div className="space-y-3">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 w-3 h-3 bg-green-500 rounded-full mt-1"></div>
                                <div className="ml-3 flex-1">
                                    <p className="text-xs font-medium text-gray-500">Pickup</p>
                                    <p className="text-sm text-gray-900">{ride.pickupLocation?.address}</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="flex-shrink-0 w-3 h-3 bg-red-500 rounded-full mt-1"></div>
                                <div className="ml-3 flex-1">
                                    <p className="text-xs font-medium text-gray-500">Drop</p>
                                    <p className="text-sm text-gray-900">{ride.dropLocation?.address}</p>
                                </div>
                            </div>
                            <div className="pt-3 border-t">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Fare</span>
                                    <span className="font-bold text-gray-900">₹{ride.fare}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LiveRideTracking;
