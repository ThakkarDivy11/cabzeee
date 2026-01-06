import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const EditProfile = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    profilePicture: ''
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        if (data.success) {
          setFormData({
            name: data.data.name,
            phone: data.data.phone,
            profilePicture: data.data.profilePicture || ''
          });
          if (data.data.profilePicture) {
            setPreview(data.data.profilePicture);
          }
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    if (e.target.name === 'profilePicture') {
      const file = e.target.files[0];
      if (file) {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
      }
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const token = localStorage.getItem('token');
      const uploadData = new FormData();
      uploadData.append('name', formData.name);
      uploadData.append('phone', formData.phone);
      if (selectedFile) {
        uploadData.append('profilePicture', selectedFile);
      }

      const response = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/users/me', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadData
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Profile updated successfully!');
        localStorage.setItem('user', JSON.stringify(data.data));
        navigate('/user-profile');
      } else {
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Network error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="mr-4 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow sm:rounded-lg px-4 py-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="shadow-sm focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="shadow-sm focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                />
              </div>
            </div>

            <div>
              <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700">
                Profile Picture
              </label>
              <div className="mt-2 flex items-center space-x-5">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                  {preview ? (
                    <img src={preview.startsWith('data:') || preview.startsWith('http') ? preview : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${preview}`} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">
                  <span>Change photo</span>
                  <input
                    type="file"
                    name="profilePicture"
                    id="profilePicture"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleChange}
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditProfile;

