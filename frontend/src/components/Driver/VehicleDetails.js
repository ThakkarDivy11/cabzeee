import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const VehicleDetails = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    color: '',
    licensePlate: '',
    vehicleType: 'car'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch('http://localhost:5000/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        if (data.success) {
          if (data.data.role !== 'driver') {
            navigate('/login');
            return;
          }
          setUser(data.data);
          if (data.data.vehicleInfo) {
            setFormData({
              make: data.data.vehicleInfo.make || '',
              model: data.data.vehicleInfo.model || '',
              year: data.data.vehicleInfo.year || '',
              color: data.data.vehicleInfo.color || '',
              licensePlate: data.data.vehicleInfo.licensePlate || '',
              vehicleType: data.data.vehicleInfo.vehicleType || 'car'
            });
          }
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to fetch vehicle data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vehicleInfo: {
            make: formData.make,
            model: formData.model,
            year: parseInt(formData.year) || undefined,
            color: formData.color,
            licensePlate: formData.licensePlate,
            vehicleType: formData.vehicleType
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Vehicle details updated successfully!');
        localStorage.setItem('user', JSON.stringify(data.data));
        navigate('/driver-profile');
      } else {
        toast.error(data.message || 'Failed to update vehicle details');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/driver-profile')}
                className="mr-4 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-gray-900">Vehicle Details</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow sm:rounded-lg px-4 py-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="make" className="block text-sm font-medium text-gray-700">
                  Make
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="make"
                    id="make"
                    value={formData.make}
                    onChange={handleChange}
                    placeholder="e.g., Maruti, Honda"
                    required
                    className="shadow-sm focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700">
                  Model
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="model"
                    id="model"
                    value={formData.model}
                    onChange={handleChange}
                    placeholder="e.g., Swift, City"
                    required
                    className="shadow-sm focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                  Year
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="year"
                    id="year"
                    value={formData.year}
                    onChange={handleChange}
                    placeholder="e.g., 2020"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    className="shadow-sm focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-700">
                  Color
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="color"
                    id="color"
                    value={formData.color}
                    onChange={handleChange}
                    placeholder="e.g., White, Black"
                    className="shadow-sm focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700">
                  License Plate
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="licensePlate"
                    id="licensePlate"
                    value={formData.licensePlate}
                    onChange={handleChange}
                    placeholder="e.g., MH01AB1234"
                    required
                    className="shadow-sm focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700">
                  Vehicle Type
                </label>
                <div className="mt-1">
                  <select
                    name="vehicleType"
                    id="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleChange}
                    required
                    className="shadow-sm focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  >
                    <option value="car">Car</option>
                    <option value="bike">Bike</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/driver-profile')}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Vehicle Details'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default VehicleDetails;
