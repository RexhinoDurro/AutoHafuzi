import React, { useEffect, useState } from 'react';
import { getStoredAuth } from '../utils/auth';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Eye, Users, Car as CarIcon, TrendingUp, ArrowUpRight } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api'; // Import API endpoints

// Define types for analytics data
interface MostViewedCar {
  id: number;
  name: string;
  views: number;
}

interface DailyVisit {
  date: string;
  views: number;
}

interface AnalyticsData {
  unique_visitors: number;
  total_page_views: number;
  car_views: number;
  most_viewed_cars: MostViewedCar[];
  daily_visits: DailyVisit[];
}

const AnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<number>(30); // Default to 30 days
  const { token } = getStoredAuth();

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Use API_ENDPOINTS instead of hardcoded URL
      const response = await fetch(`${API_ENDPOINTS.ANALYTICS}?days=${timeRange}`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAnalytics();
    }
  }, [token, timeRange]);

  if (loading) {
    return <div className="flex justify-center items-center p-8">Loading analytics data...</div>;
  }

  if (error) {
    return <div className="text-red-600 p-8">Error: {error}</div>;
  }

  if (!analyticsData) {
    return <div className="p-8">No analytics data available</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-2xl font-bold mb-6">Website Analytics</h2>
      
      {/* Time range selector */}
      <div className="flex justify-end mb-6">
        <select 
          className="border border-gray-300 rounded p-2"
          value={timeRange}
          onChange={(e) => setTimeRange(Number(e.target.value))}
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={365}>Last year</option>
        </select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 rounded-lg p-4 flex items-center">
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <Users className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Unique Visitors</p>
            <p className="text-2xl font-bold">{analyticsData.unique_visitors}</p>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 flex items-center">
          <div className="bg-green-100 p-3 rounded-full mr-4">
            <Eye className="text-green-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Page Views</p>
            <p className="text-2xl font-bold">{analyticsData.total_page_views}</p>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 flex items-center">
          <div className="bg-purple-100 p-3 rounded-full mr-4">
            <CarIcon className="text-purple-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Car Detail Views</p>
            <p className="text-2xl font-bold">{analyticsData.car_views}</p>
          </div>
        </div>
      </div>

      {/* Daily Visits Chart */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Daily Page Views</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={analyticsData.daily_visits}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="views"
                stroke="#3B82F6"
                activeDot={{ r: 8 }}
                name="Page Views"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Most Viewed Cars */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Most Viewed Cars</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={analyticsData.most_viewed_cars}
              margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                tick={{ fontSize: 12 }}
                height={70}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="views" 
                fill="#8884d8" 
                name="Views" 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table view of most viewed cars */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Most Viewed Cars (Detailed)</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Car
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analyticsData.most_viewed_cars.map((car) => (
                <tr key={car.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {car.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Eye className="text-gray-400 mr-2" size={16} />
                      {car.views}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <a 
                      href={`/auth/edit-car/${car.id}`} 
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      Edit
                    </a>
                    <a 
                      href={`/car/${car.id}`} 
                      className="text-green-600 hover:text-green-800"
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;