import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car } from '../types/car';
import { getStoredAuth } from '../utils/auth';
import AnalyticsDashboard from './AnalyticsDashboard';
import { Eye, Trash, Edit, BarChart2 } from 'lucide-react';
import Sidebar from './Sidebar';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import DeleteConfirmationModal from './DeleteConfirmation'

const AdminDashboard = ({ children }: { children?: React.ReactNode }) => {
  const navigate = useNavigate();
  const [cars, setCars] = useState<Car[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState<Car | null>(null);
  const { token } = getStoredAuth();

  useEffect(() => {
    if (!token) {
      navigate('/auth/login');
      return;
    }

    fetchCars();
  }, [token, navigate]);

  const fetchCars = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (car: Car) => {
    setCarToDelete(car);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!carToDelete) return;

    try {
      // Use car.slug if available, otherwise fall back to car.id
      const identifier = carToDelete.slug || carToDelete.id;
      
      const response = await fetch(API_ENDPOINTS.CARS.DELETE(identifier), {
        method: 'DELETE',
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (response.ok) {
        setCars(cars.filter(c => c.id !== carToDelete.id));
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
      return `${API_BASE_URL}/api/placeholder/400/300`;
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
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar collapsed={sidebarCollapsed} toggleCollapse={toggleSidebar} />
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
        } ml-0 overflow-auto`}
      >
        <div className="p-4 md:p-6">{content}</div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {carToDelete && (
        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          itemName={`${carToDelete.brand} ${carToDelete.model_name} (${carToDelete.first_registration_year || 'N/A'})`}
          itemType="car"
        />
      )}
    </div>
  );

  // If we have children, render them instead of the default dashboard
  if (children) {
    return contentWrapper(
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Admin Dashboard</h1>
        {children}
      </div>
    );
  }

  return contentWrapper(
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 flex items-center"
          >
            <BarChart2 size={18} className="mr-2" />
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

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white shadow-lg rounded-lg p-6 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 md:px-6 py-3 text-left">Image</th>
                  <th className="px-4 md:px-6 py-3 text-left">Make</th>
                  <th className="px-4 md:px-6 py-3 text-left">Model</th>
                  <th className="px-4 md:px-6 py-3 text-left">Year</th>
                  <th className="px-4 md:px-6 py-3 text-left">Price</th>
                  <th className="px-4 md:px-6 py-3 text-left">Views</th>
                  <th className="hidden md:table-cell px-4 md:px-6 py-3 text-left">Created At</th>
                  <th className="px-4 md:px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((car) => (
                  <tr key={car.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 md:px-6 py-4">
                      <div className="w-16 md:w-20 h-16 md:h-20 overflow-hidden rounded">
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
                    <td className="px-4 md:px-6 py-4">{car.brand}</td>
                    <td className="px-4 md:px-6 py-4">{car.model_name}</td>
                    <td className="px-4 md:px-6 py-4">{car.first_registration_year}</td>
                    <td className="px-4 md:px-6 py-4">
                      {car.discussed_price 
                        ? "Negotiable" 
                        : `€${car.price.toLocaleString()}`
                      }
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center">
                        <Eye className="text-gray-400 mr-2" size={16} />
                        {car.view_count}
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-4 md:px-6 py-4">{formatDate(car.created_at)}</td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(car)}
                          className="bg-blue-500 text-white p-1 md:px-3 md:py-1 rounded hover:bg-blue-600 flex items-center"
                        >
                          <Edit size={16} className="md:mr-1" />
                          <span className="hidden md:inline">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(car)}
                          className="bg-red-500 text-white p-1 md:px-3 md:py-1 rounded hover:bg-red-600 flex items-center"
                        >
                          <Trash size={16} className="md:mr-1" />
                          <span className="hidden md:inline">Delete</span>
                        </button>
                      </div>
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
      )}
    </div>
  );
};

export default AdminDashboard;