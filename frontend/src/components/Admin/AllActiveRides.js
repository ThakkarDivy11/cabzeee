import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AllActiveRides = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [activeRides, setActiveRides] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsed = JSON.parse(userData);
            if (parsed.role !== 'admin') {
                navigate('/login');
                return;
            }
            setUser(parsed);
        } else {
            navigate('/login');
            return;
        }

        fetchActiveRides();
        const interval = setInterval(fetchActiveRides, 10000); // Refresh every 10 seconds

        return () => clearInterval(interval);
    }, [navigate]);

    const fetchActiveRides = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/rides/my-rides', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                const active = data.data.filter(r =>
                    ['accepted', 'started', 'picked-up'].includes(r.status)
                );
                setActiveRides(active);
            }
        } catch (error) {
            console.error('Error fetching rides:', error);
            toast.error('Failed to load rides');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'accepted':
                return 'bg-blue-100 text-blue-800';
            case 'started':
                return 'bg-yellow-100 text-yellow-800';
            case 'picked-up':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <button
                                onClick={() => navigate('/admin')}
                                className="mr-4 text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <h1 className="text-xl font-bold text-gray-900">Active Rides Monitor</h1>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-sm text-gray-600">Live</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Active Rides ({activeRides.length})
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Monitoring all ongoing rides in real-time
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="text-lg text-gray-600">Loading rides...</div>
                    </div>
                ) : activeRides.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No active rides</h3>
                        <p className="mt-1 text-sm text-gray-500">There are currently no ongoing rides to monitor.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {activeRides.map((ride) => (
                            <div
                                key={ride._id}
                                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => navigate(`/live-ride/${ride._id}`)}
                            >
                                {/* Status Badge */}
                                <div className="flex items-center justify-between mb-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ride.status)}`}>
                                        {ride.status.toUpperCase().replace('-', ' ')}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(ride.createdAt).toLocaleTimeString()}
                                    </span>
                                </div>

                                {/* Rider Info */}
                                <div className="mb-4">
                                    <p className="text-xs text-gray-500 mb-1">Rider</p>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                            {ride.rider?.name?.charAt(0) || 'R'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{ride.rider?.name || 'Unknown'}</p>
                                            <p className="text-xs text-gray-500">{ride.rider?.phone}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Driver Info */}
                                {ride.driver && (
                                    <div className="mb-4">
                                        <p className="text-xs text-gray-500 mb-1">Driver</p>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-sm font-bold">
                                                {ride.driver.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{ride.driver.name}</p>
                                                <p className="text-xs text-gray-500">{ride.driver.phone}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Route Info */}
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-start">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 mr-2"></div>
                                        <p className="text-xs text-gray-600 flex-1 line-clamp-1">{ride.pickupLocation?.address}</p>
                                    </div>
                                    <div className="flex items-start">
                                        <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 mr-2"></div>
                                        <p className="text-xs text-gray-600 flex-1 line-clamp-1">{ride.dropLocation?.address}</p>
                                    </div>
                                </div>

                                {/* Fare & OTP Status */}
                                <div className="flex items-center justify-between pt-4 border-t">
                                    <div>
                                        <p className="text-xs text-gray-500">Fare</p>
                                        <p className="text-lg font-bold text-gray-900">₹{ride.fare}</p>
                                    </div>
                                    {ride.otpVerified ? (
                                        <div className="flex items-center text-green-600 text-xs">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            OTP Verified
                                        </div>
                                    ) : (
                                        <div className="flex items-center text-yellow-600 text-xs">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                            Pending OTP
                                        </div>
                                    )}
                                </div>

                                {/* View Details Button */}
                                <button className="w-full mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                                    View Live Tracking →
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AllActiveRides;
