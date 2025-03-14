import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car } from '../types/car';
import { getStoredAuth } from '../utils/auth';
import AnalyticsDashboard from './AnalyticsDashboard';
import { Eye } from 'lucide-react';
import Sidebar from './Sidebar';

const AdminDashboard = ({ children }: { children?: React.ReactNode }) => {
  const navigate = useNavigate();
  const [cars, setCars] = useState<Car[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { token } = getStoredAuth();

  useEffect(() => {
    if (!token) {
      navigate('/auth/login');
      return;
    }

    fetchCars();
  }, [token, navigate]);

  const fetchCars = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/cars/', {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      const data = await response.json();

      // Handle both paginated and direct array responses
      if ('results' in data && Array.isArray(data.results)) {
        setCars(data.results);
      } else if (Array.isArray(data)) {
        setCars(data);
      } else {
        setCars([]);
        console.error("Unexpected response format:", data);
      }
    } catch (error) {
      console.error('Error fetching cars:', error);
      setCars([]);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this car?')) return;

    try {
      const response = await fetch(`http://localhost:8000/api/cars/delete/${id}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (response.ok) {
        setCars(cars.filter(car => car.id !== id));
      }
    } catch (error) {
      console.error('Error deleting car:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Function to get the primary image or the first image if no primary is set
  const getDisplayImage = (car: Car) => {
    if (car.images && car.images.length > 0) {
      const primaryImage = car.images.find(img => img.is_primary);
      if (primaryImage) {
        return primaryImage.image;
      }
      return car.images[0].image;
    }
    return undefined;
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Main content wrapper
  const contentWrapper = (content: React.ReactNode) => (
    <div className="flex h-screen bg-gray-100">
      <Sidebar collapsed={sidebarCollapsed} toggleCollapse={toggleSidebar} />
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        } overflow-auto`}
      >
        <div className="p-6">{content}</div>
      </div>
    </div>
  );

  // If we have children, render them instead of the default dashboard
  if (children) {
    return contentWrapper(
      <div>
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        {children}
      </div>
    );
  }

  return contentWrapper(
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700"
          >
            {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
          </button>
        </div>
      </div>

      {/* Analytics Dashboard Section */}
      {showAnalytics && <AnalyticsDashboard />}

      <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left">Image</th>
              <th className="px-6 py-3 text-left">Make</th>
              <th className="px-6 py-3 text-left">Model</th>
              <th className="px-6 py-3 text-left">Year</th>
              <th className="px-6 py-3 text-left">Price</th>
              <th className="px-6 py-3 text-left">Views</th>
              <th className="px-6 py-3 text-left">Created At</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car) => (
              <tr key={car.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4">
                  {getDisplayImage(car) ? (
                    <img
                      src={getDisplayImage(car)?.startsWith('http') ? getDisplayImage(car) : `http://localhost:8000${getDisplayImage(car)}`}
                      alt={`${car.brand} ${car.model_name}`}
                      className="w-20 h-20 object-cover rounded"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">{car.brand}</td>
                <td className="px-6 py-4">{car.model_name}</td>
                <td className="px-6 py-4">{car.first_registration_year}</td>
                <td className="px-6 py-4">€{car.price.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <Eye className="text-gray-400 mr-2" size={16} />
                    {car.view_count}
                  </div>
                </td>
                <td className="px-6 py-4">{formatDate(car.created_at)}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => navigate(`/auth/edit-car/${car.id}`)}
                    className="text-blue-600 hover:text-blue-800 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(car.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;