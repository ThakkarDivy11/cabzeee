import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AdminVerification = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async () => {
        try {
            const token = localStorage.getItem('token');
            // We need a route to get ALL drivers, not just online ones.
            // Re-using /api/users for now (filtered by role=driver on client if needed, but better to filter on server)
            const response = await fetch('http://localhost:5000/api/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                const driverList = data.data.filter(u => u.role === 'driver');
                setDrivers(driverList);
            }
        } catch (error) {
            toast.error('Failed to load drivers');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (userId, type, status) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/users/documents/${userId}/verify`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ type, status })
            });
            const data = await response.json();
            if (data.success) {
                toast.success(`Document ${status ? 'verified' : 'rejected'}`);
                fetchDrivers();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Action failed');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">Driver Verification Portal</h1>

            <div className="grid gap-6">
                {drivers.length === 0 && <p>No drivers found.</p>}
                {drivers.map(driver => (
                    <div key={driver._id} className="bg-white p-6 rounded-lg shadow border border-gray-200">
                        <h3 className="text-xl font-bold mb-4 flex items-center">
                            {driver.name}
                            <span className="ml-3 text-sm font-normal text-gray-500">{driver.email}</span>
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {['license', 'insurance', 'registration'].map(type => {
                                const doc = driver.documents?.[type];
                                return (
                                    <div key={type} className="border p-4 rounded bg-gray-100/50 backdrop-blur-sm transition-all hover:bg-gray-100">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="font-bold capitalize text-gray-700">{type}</h4>
                                            {doc?.verified ? (
                                                <span className="bg-green-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">Verified</span>
                                            ) : doc?.fileUrl ? (
                                                <span className="bg-orange-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded animate-pulse shadow-sm">Pending</span>
                                            ) : (
                                                <span className="bg-gray-400 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">Missing</span>
                                            )}
                                        </div>

                                        {doc?.fileUrl ? (
                                            <div className="space-y-3">
                                                <div className="bg-white p-2 rounded border border-gray-200 shadow-inner">
                                                    <p className="text-xs text-gray-500 uppercase font-semibold">Number</p>
                                                    <p className="text-sm font-bold text-gray-900">{doc.number || 'N/A'}</p>
                                                </div>
                                                <div className="bg-white p-2 rounded border border-gray-200 shadow-inner">
                                                    <p className="text-xs text-gray-500 uppercase font-semibold">Expiry Date</p>
                                                    <p className="text-sm font-bold text-gray-900">
                                                        {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : 'N/A'}
                                                    </p>
                                                </div>
                                                <div className="relative group">
                                                    {doc.fileUrl.toLowerCase().endsWith('.pdf') ? (
                                                        <div className="w-full h-32 bg-red-50 rounded border border-red-100 flex flex-col items-center justify-center transition-colors group-hover:bg-red-100">
                                                            <svg className="w-12 h-12 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                                            </svg>
                                                            <span className="text-[10px] font-bold text-red-700 mt-2 uppercase tracking-tighter">PDF Document</span>
                                                        </div>
                                                    ) : (
                                                        <div className="w-full h-32 rounded border border-gray-200 overflow-hidden bg-white shadow-inner">
                                                            <img
                                                                src={`http://localhost:5000${doc.fileUrl}`}
                                                                alt={type}
                                                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                                            />
                                                        </div>
                                                    )}
                                                    <a
                                                        href={`http://localhost:5000${doc.fileUrl}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded"
                                                    >
                                                        <span className="bg-white text-black text-xs font-bold py-1 px-3 rounded-full shadow-lg">
                                                            Open Full View ↗
                                                        </span>
                                                    </a>
                                                </div>

                                                <a
                                                    href={`http://localhost:5000${doc.fileUrl}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="w-full bg-blue-50 text-blue-600 text-center py-2 rounded border border-blue-200 text-sm font-bold hover:bg-blue-100 transition-colors block"
                                                >
                                                    Download / Print 📄
                                                </a>

                                                <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-200">
                                                    <button
                                                        onClick={() => handleVerify(driver._id, type, true)}
                                                        className="flex-1 bg-green-600 text-white py-2 px-2 rounded-lg text-xs font-bold hover:bg-green-700 shadow-md transform active:scale-95 transition-all"
                                                    >
                                                        APPROVE
                                                    </button>
                                                    <button
                                                        onClick={() => handleVerify(driver._id, type, false)}
                                                        className="flex-1 bg-red-600 text-white py-2 px-2 rounded-lg text-xs font-bold hover:bg-red-700 shadow-md transform active:scale-95 transition-all"
                                                    >
                                                        REJECT
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-4 bg-gray-50 rounded border border-dashed border-gray-300">
                                                <p className="text-xs text-gray-400 font-medium italic">No document uploaded</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminVerification;
