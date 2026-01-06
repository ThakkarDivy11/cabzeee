import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const DocumentUpload = () => {
    const [user, setUser] = useState(null);
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/users/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setUser(data.data);
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    };

    const handleUpload = async (e, type) => {
        e.preventDefault();
        const formData = new FormData();
        const fileInput = e.target.elements.namedItem('document');
        const numberInput = e.target.elements.namedItem('number');
        const dateInput = e.target.elements.namedItem('expiryDate');

        if (!fileInput.files[0]) {
            return toast.error('Please select a file');
        }

        formData.append('document', fileInput.files[0]);
        formData.append('type', type);
        if (numberInput) formData.append('number', numberInput.value);
        if (dateInput) formData.append('expiryDate', dateInput.value);

        setUploading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/users/documents/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                toast.success(`${type} uploaded successfully`);
                fetchUserData();
                e.target.reset();
            } else {
                toast.error(data.message || 'Upload failed');
            }
        } catch (error) {
            toast.error('Error uploading document');
        } finally {
            setUploading(false);
        }
    };

    const getStatusBadge = (doc) => {
        if (!doc || !doc.fileUrl) return <span className="text-gray-500">Not Uploaded</span>;
        if (doc.verified) return <span className="text-green-600 font-bold">Verified ✅</span>;
        return <span className="text-yellow-600 font-bold">Pending Verification ⏳</span>;
    };

    if (!user) return <div>Loading...</div>;

    const docTypes = [
        { key: 'license', label: 'Driving License', placeholder: 'License Number' },
        { key: 'insurance', label: 'Vehicle Insurance', placeholder: 'Policy Number' },
        { key: 'registration', label: 'Vehicle Registration (RC)', placeholder: 'RC Number' }
    ];

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">Driver Documents</h1>

            <div className="grid gap-8">
                {docTypes.map(({ key, label, placeholder }) => (
                    <div key={key} className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-semibold">{label}</h2>
                            <div>{getStatusBadge(user.documents?.[key])}</div>
                        </div>

                        <div className="mb-4">
                            {user.documents?.[key]?.fileUrl && (
                                <div className="mb-4 p-2 bg-gray-50 rounded text-sm">
                                    <p className="font-medium text-gray-700">Current Document:</p>
                                    <a
                                        href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${user.documents[key].fileUrl}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-blue-600 hover:underline break-all"
                                    >
                                        View Attached File
                                    </a>
                                </div>
                            )}
                        </div>

                        <form onSubmit={(e) => handleUpload(e, key)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{placeholder}</label>
                                    <input
                                        type="text"
                                        name="number"
                                        defaultValue={user.documents?.[key]?.number || ''}
                                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder={
                                            key === 'license' ? 'e.g. MH1420110062821' :
                                                key === 'insurance' ? 'e.g. ABC123456789' :
                                                    key === 'registration' ? 'e.g. MH01AB1234' :
                                                        placeholder
                                        }
                                        pattern={
                                            key === 'license' ? "^[A-Z]{2}[0-9]{13,14}$" :
                                                key === 'insurance' ? "^[A-Z0-9]{8,13}$" :
                                                    key === 'registration' ? "^[A-Z]{2}[0-9]{2}[A-Z]{1,3}[0-9]{4}$" :
                                                        undefined
                                        }
                                        title={
                                            key === 'license' ? "Please enter a valid Driving License number (e.g., MH1420110062821)" :
                                                key === 'insurance' ? "Please enter a valid Policy Number (8-13 alphanumeric characters)" :
                                                    key === 'registration' ? "Please enter a valid RC Number (e.g., MH01AB1234)" :
                                                        undefined
                                        }
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                    <input
                                        type="date"
                                        name="expiryDate"
                                        defaultValue={user.documents?.[key]?.expiryDate ? new Date(user.documents[key].expiryDate).toISOString().split('T')[0] : ''}
                                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Upload File (Image/PDF)</label>
                                <input
                                    type="file"
                                    name="document"
                                    accept="image/*,.pdf"
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="bg-black text-white px-6 py-2 rounded-md font-medium hover:bg-gray-800 disabled:opacity-50"
                                >
                                    {uploading ? 'Uploading...' : 'Upload Document'}
                                </button>
                            </div>
                        </form>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DocumentUpload;
