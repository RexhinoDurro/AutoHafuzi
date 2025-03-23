import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car } from '../types/car';
import { getStoredAuth } from '../utils/auth';
import AnalyticsDashboard from './AnalyticsDashboard';
import { Eye } from 'lucide-react';
import Sidebar from './Sidebar';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

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
      const response = await fetch(`${API_BASE_URL}/api/cars/`, {
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

  const handleDelete = async (car: Car) => {
    if (!window.confirm('Are you sure you want to delete this car?')) return;

    try {
      // Use car.slug if available, otherwise fall back to car.id
      const identifier = car.slug || car.id;
      
      const response = await fetch(API_ENDPOINTS.CARS.DELETE(identifier), {
        method: 'DELETE',
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (response.ok) {
        setCars(cars.filter(c => c.id !== car.id));
      } else {
        // Handle error response
        const errorText = await response.text();
        console.error('Failed to delete car:', errorText);
        alert(`Failed to delete car: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting car:', error);
      alert('Error deleting car. Please try again.');
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

  // Function to get the image URL from car images with Cloudinary support
  const getDisplayImage = (car: Car) => {
    if (!car.images || car.images.length === 0) {
      return undefined;
    }
    
    // First try to find the primary image
    const primaryImage = car.images.find(img => img.is_primary);
    const imageToUse = primaryImage || car.images[0];
    
    // Check if Cloudinary URL is available
    if (imageToUse.url) {
      return imageToUse.url;
    } else if (imageToUse.image) {
      // Handle legacy image or direct path
      return imageToUse.image.startsWith('http') 
        ? imageToUse.image 
        : `${API_BASE_URL}${imageToUse.image}`;
    }
    
    // Fallback to placeholder
    return `${API_BASE_URL}/api/placeholder/400/300`;
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Function to handle editing a car - use slug if available
  const handleEdit = (car: Car) => {
    const identifier = car.slug || car.id;
    navigate(`/auth/edit-car/${identifier}`);
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
          <button
            onClick={() => navigate('/auth/add-car')}
            className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700"
          >
            Add New Car
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
                  <div className="w-20 h-20 overflow-hidden rounded">
                    <img
                      src={getDisplayImage(car)}
                      alt={`${car.brand} ${car.model_name}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = `${API_BASE_URL}/api/placeholder/400/300`;
                      }}
                    />
                  </div>
                </td>
                <td className="px-6 py-4">{car.brand}</td>
                <td className="px-6 py-4">{car.model_name}</td>
                <td className="px-6 py-4">{car.first_registration_year}</td>
                <td className="px-6 py-4">
                  {car.discussed_price 
                    ? "Negotiable" 
                    : `€${car.price.toLocaleString()}`
                  }
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <Eye className="text-gray-400 mr-2" size={16} />
                    {car.view_count}
                  </div>
                </td>
                <td className="px-6 py-4">{formatDate(car.created_at)}</td>
                <td className="px-6 py-4 space-x-2">
                  <button
                    onClick={() => handleEdit(car)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(car)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {cars.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                  No cars found. Click "Add New Car" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;