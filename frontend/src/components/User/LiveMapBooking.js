import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMapEvents } from 'react-leaflet';
import toast from 'react-hot-toast';
import MapContainer from '../Map/MapContainer';
import DriverMarker from '../Map/DriverMarker';
import RoutePolyline from '../Map/RoutePolyline';
import Loader from '../Common/Loader';

// Helper component to handle map movement
const MapEventsHandler = ({ onMoveEnd }) => {
    useMapEvents({
        moveend: (e) => {
            const map = e.target;
            const center = map.getCenter();
            onMoveEnd([center.lat, center.lng]);
        }
    });
    return null;
};

const LiveMapBooking = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState('pickup'); // 'pickup', 'drop', 'confirm'
    const [loading, setLoading] = useState(false);
    const [addressFetching, setAddressFetching] = useState(false);

    const [pickup, setPickup] = useState({ address: '', coords: null });
    const [drop, setDrop] = useState({ address: '', coords: null });
    const [drivers, setDrivers] = useState([]);
    const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]);
    const [routePositions, setRoutePositions] = useState([]);
    const [fareEstimate, setFareEstimate] = useState(null);

    // Fetch address from coordinates
    const fetchAddress = async (coords) => {
        setAddressFetching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[0]}&lon=${coords[1]}`
            );
            const data = await response.json();
            const address = data.display_name;

            if (step === 'pickup') {
                setPickup({ address, coords });
            } else if (step === 'drop') {
                setDrop({ address, coords });
            }
        } catch (error) {
            console.error('Error fetching address:', error);
        } finally {
            setAddressFetching(false);
        }
    };

    // Fetch nearby drivers
    const fetchNearbyDrivers = useCallback(async (coords) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/users/drivers?lat=${coords[0]}&lon=${coords[1]}&radius=5000`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setDrivers(data.data);
            }
        } catch (error) {
            console.error('Error fetching drivers:', error);
        }
    }, []);

    // Initial load: get current location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const coords = [pos.coords.latitude, pos.coords.longitude];
                    setMapCenter(coords);
                    fetchAddress(coords);
                    fetchNearbyDrivers(coords);
                },
                () => {
                    toast.error('Location access denied. Using default location.');
                    fetchAddress(mapCenter);
                    fetchNearbyDrivers(mapCenter);
                }
            );
        }
    }, [fetchNearbyDrivers]);

    const handleMapMove = (newCenter) => {
        if (step !== 'confirm') {
            setMapCenter(newCenter);
            fetchAddress(newCenter);
            fetchNearbyDrivers(newCenter);
        }
    };

    const handleConfirmPickup = () => {
        if (!pickup.address) {
            toast.error('Please select a pickup location');
            return;
        }
        setStep('drop');
        localStorage.setItem('pickupLocation', JSON.stringify({
            address: pickup.address,
            lat: pickup.coords[0],
            lon: pickup.coords[1]
        }));
    };

    const handleConfirmDrop = () => {
        if (!drop.address) {
            toast.error('Please select a drop location');
            return;
        }
        setStep('confirm');
        localStorage.setItem('dropLocation', JSON.stringify({
            address: drop.address,
            lat: drop.coords[0],
            lon: drop.coords[1]
        }));

        // Calculate route positions
        setRoutePositions([pickup.coords, drop.coords]);

        // Mock fare estimate (could call an API if available)
        setFareEstimate(Math.floor(Math.random() * 300) + 100);
    };

    const handleRequestRide = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const rideData = {
                pickupLocation: {
                    address: pickup.address,
                    coordinates: [pickup.coords[1], pickup.coords[0]]
                },
                dropLocation: {
                    address: drop.address,
                    coordinates: [drop.coords[1], drop.coords[0]]
                },
                vehicleType: 'car',
                paymentMethod: 'cash',
                fare: fareEstimate
            };

            const response = await fetch('http://localhost:5000/api/rides', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(rideData)
            });

            if (response.ok) {
                const data = await response.json();
                toast.success('Searching for nearby drivers...');
                localStorage.removeItem('pickupLocation');
                localStorage.removeItem('dropLocation');
                localStorage.removeItem('rideRequest');
                navigate(`/live-ride/${data.data._id}`);
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || 'Failed to request ride');
            }
        } catch (error) {
            console.error('Error requesting ride:', error);
            toast.error('Network error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen flex flex-col relative bg-gray-100">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-[1000] p-4 pointer-events-none">
                <div className="flex flex-col gap-2 max-w-md mx-auto">
                    <div className="bg-white rounded-xl shadow-lg p-4 pointer-events-auto flex items-center">
                        <button onClick={() => navigate('/rider')} className="p-2 mr-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h1 className="text-lg font-bold">Book your ride</h1>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-4 pointer-events-auto space-y-3">
                        <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Pickup</p>
                                <p className={`text-sm truncate ${step === 'pickup' ? 'font-bold text-black' : 'text-gray-600'}`}>
                                    {pickup.address || 'Locating...'}
                                </p>
                            </div>
                            {step !== 'pickup' && (
                                <button onClick={() => setStep('pickup')} className="text-blue-500 text-xs font-bold">Edit</button>
                            )}
                        </div>

                        {(step === 'drop' || step === 'confirm') && (
                            <div className="flex items-center space-x-3 border-t pt-3">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Drop-off</p>
                                    <p className={`text-sm truncate ${step === 'drop' ? 'font-bold text-black' : 'text-gray-600'}`}>
                                        {drop.address || 'Select destination on map'}
                                    </p>
                                </div>
                                {step === 'confirm' && (
                                    <button onClick={() => setStep('drop')} className="text-blue-500 text-xs font-bold">Edit</button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Map */}
            <div className="flex-1 relative">
                <MapContainer center={mapCenter} zoom={15} className="h-full w-full">
                    <MapEventsHandler onMoveEnd={handleMapMove} />
                    {drivers.map(driver => (
                        <DriverMarker
                            key={driver._id}
                            position={[driver.currentLocation.coordinates[1], driver.currentLocation.coordinates[0]]}
                            driverName={driver.name}
                            vehicleInfo={driver.vehicleInfo}
                        />
                    ))}
                    {step === 'confirm' && routePositions.length > 0 && (
                        <RoutePolyline positions={routePositions} />
                    )}
                </MapContainer>

                {/* Center Target Pin */}
                {step !== 'confirm' && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full z-[999] pointer-events-none mb-5">
                        <div className="flex flex-col items-center">
                            <div className="bg-black text-white px-3 py-1 rounded shadow-lg text-xs font-bold mb-2 animate-bounce">
                                {addressFetching ? 'Finding address...' : step === 'pickup' ? 'SET PICKUP' : 'SET DROP-OFF'}
                            </div>
                            <svg className="w-10 h-10 text-black drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Actions */}
            <div className="bg-white p-6 shadow-2xl rounded-t-3xl z-[1000]">
                {step === 'pickup' && (
                    <button
                        onClick={handleConfirmPickup}
                        className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors shadow-lg"
                    >
                        Confirm Pickup
                    </button>
                )}
                {step === 'drop' && (
                    <button
                        onClick={handleConfirmDrop}
                        className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors shadow-lg"
                    >
                        Confirm Destination
                    </button>
                )}
                {step === 'confirm' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gray-100 rounded-lg">🚘</div>
                                <div>
                                    <p className="font-bold">Standard Car</p>
                                    <p className="text-xs text-gray-500">Fast and affordable</p>
                                </div>
                            </div>
                            <p className="text-xl font-bold">₹{fareEstimate}</p>
                        </div>
                        <button
                            onClick={handleRequestRide}
                            className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors shadow-lg"
                        >
                            Request Ride
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveMapBooking;
