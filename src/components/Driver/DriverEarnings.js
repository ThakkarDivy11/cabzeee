import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const DriverEarnings = () => {
  const [user, setUser] = useState(null);
  const [earnings, setEarnings] = useState({
    today: 0,
    week: 0,
    month: 0,
    total: 0
  });
  const [recentEarnings, setRecentEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('today');
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

    fetchEarnings();
  }, [navigate, period]);

  const fetchEarnings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/rides/earnings?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setEarnings(data.data.earnings || earnings);
          setRecentEarnings(data.data.recentRides || []);
        }
      } else {
        const mockEarnings = {
          today: 1250,
          week: 8750,
          month: 32500,
          total: 125000
        };
        const mockRecent = [
          { fare: 250, date: new Date().toISOString(), rider: 'John Doe' },
          { fare: 180, date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), rider: 'Jane Smith' },
          { fare: 320, date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), rider: 'Mike Johnson' },
          { fare: 150, date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), rider: 'Sarah Williams' },
          { fare: 280, date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), rider: 'David Brown' }
        ];
        setEarnings(mockEarnings);
        setRecentEarnings(mockRecent);
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
      const mockEarnings = {
        today: 1250,
        week: 8750,
        month: 32500,
        total: 125000
      };
      setEarnings(mockEarnings);
      setRecentEarnings([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
              <h1 className="text-xl font-bold text-gray-900">Driver Earnings</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading earnings...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Earnings Overview</h2>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-black focus:border-black"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="all">All Time</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Today</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">₹{earnings.today}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">₹{earnings.week}</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">₹{earnings.month}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">₹{earnings.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Earnings</h2>
              {recentEarnings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No recent earnings</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentEarnings.map((earning, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{earning.rider || 'Ride'}</p>
                        <p className="text-xs text-gray-500">{formatDate(earning.date)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-black">₹{earning.fare}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Earnings Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Rides</span>
                  <span className="font-medium">{user.totalRides || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average per Ride</span>
                  <span className="font-medium">
                    ₹{user.totalRides > 0 ? Math.round(earnings.total / user.totalRides) : 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Driver Rating</span>
                  <span className="font-medium">{user.rating || 5.0} ⭐</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DriverEarnings;
