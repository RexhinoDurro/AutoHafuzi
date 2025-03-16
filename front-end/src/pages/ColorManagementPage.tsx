import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getStoredAuth, clearStoredAuth } from '../utils/auth';
import useUpholstery from '../components/useUpholstery';

// Define types
interface ExteriorColor {
  id: number;
  name: string;
  hex_code: string;
}

interface InteriorColor {
  id: number;
  name: string;
  hex_code: string;
}

const ColorManagementPage: React.FC = () => {
  const navigate = useNavigate();
  
  // State for exterior colors
  const [exteriorColors, setExteriorColors] = useState<ExteriorColor[]>([]);
  const [newExteriorColor, setNewExteriorColor] = useState({
    name: '',
    hex_code: '#000000'
  });

  // State for interior colors
  const [interiorColors, setInteriorColors] = useState<InteriorColor[]>([]);
  const [newInteriorColor, setNewInteriorColor] = useState({
    name: '',
    hex_code: '#000000'
  });

  // Use the upholstery hook for upholstery management
  const {
    upholsteryTypes,
    isLoading: upholsteryLoading,
    error: upholsteryError,
    addUpholsteryType,
    deleteUpholsteryType
  } = useUpholstery();

  // State for new upholstery
  const [newUpholstery, setNewUpholstery] = useState('');

  // State for loading and error messages
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { token } = getStoredAuth();

  useEffect(() => {
    if (token) {
      setIsAuthenticated(true);
      // Set default axios auth header for all requests
      axios.defaults.headers.common['Authorization'] = `Token ${token}`;
      
      // Proceed to fetch colors since we have a token
      fetchColors();
    } else {
      console.error('No authentication token found');
      setError('Authentication token not found. Please log in again.');
      setLoading(false);
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate('/auth/login', { state: { returnUrl: '/color-management' } });
      }, 1500);
    }
  }, [navigate]);

  const fetchColors = async () => {
    setLoading(true);
    try {
      // Fetch exterior colors
      const exteriorResponse = await axios.get('http://localhost:8000/api/exterior-colors/');
      console.log("Exterior colors response:", exteriorResponse.data);
      
      // Ensure exteriorColors is always an array
      if (Array.isArray(exteriorResponse.data)) {
        setExteriorColors(exteriorResponse.data);
      } else if (exteriorResponse.data && Array.isArray(exteriorResponse.data.results)) {
        // Handle pagination format
        setExteriorColors(exteriorResponse.data.results);
      } else {
        console.error("Unexpected exterior colors format:", exteriorResponse.data);
        setExteriorColors([]);
      }
      
      // Fetch interior colors
      const interiorResponse = await axios.get('http://localhost:8000/api/interior-colors/');
      console.log("Interior colors response:", interiorResponse.data);
      
      // Ensure interiorColors is always an array
      if (Array.isArray(interiorResponse.data)) {
        setInteriorColors(interiorResponse.data);
      } else if (interiorResponse.data && Array.isArray(interiorResponse.data.results)) {
        // Handle pagination format
        setInteriorColors(interiorResponse.data.results);
      } else {
        console.error("Unexpected interior colors format:", interiorResponse.data);
        setInteriorColors([]);
      }
      
      setError('');
    } catch (err) {
      console.error('Error fetching colors:', err);
      setError('Failed to load colors. Please try again.');
      // Initialize with empty arrays to prevent map errors
      setExteriorColors([]);
      setInteriorColors([]);
      
      // Check if authentication error
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        handleAuthError();
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Handle authentication errors
  const handleAuthError = () => {
    setError('Authentication failed. Please log in again.');
    setIsAuthenticated(false);
    clearStoredAuth();
    navigate('/auth/login', { state: { returnUrl: '/color-management' } });
  };

  // Exterior color handlers
  const handleAddExteriorColor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExteriorColor.name.trim()) {
      setError('Exterior color name is required');
      return;
    }

    if (!token) {
      setError('Not authenticated. Please log in again.');
      navigate('/auth/login', { state: { returnUrl: '/color-management' } });
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:8000/api/exterior-colors/add/', 
        newExteriorColor, 
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setExteriorColors([...exteriorColors, response.data]);
      setNewExteriorColor({ name: '', hex_code: '#000000' });
      setMessage('Exterior color added successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      console.error('Error adding exterior color:', err);
      if (err.response?.status === 401) {
        handleAuthError();
      } else {
        setError(err.response?.data?.error || 'Failed to add exterior color');
      }
    }
  };

  const handleDeleteExteriorColor = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this exterior color?')) {
      return;
    }

    if (!token) {
      setError('Not authenticated. Please log in again.');
      navigate('/auth/login', { state: { returnUrl: '/color-management' } });
      return;
    }

    try {
      await axios.delete(`http://localhost:8000/api/exterior-colors/delete/${id}/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      
      setExteriorColors(exteriorColors.filter(color => color.id !== id));
      setMessage('Exterior color deleted successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      console.error('Error deleting exterior color:', err);
      if (err.response?.status === 401) {
        handleAuthError();
      } else {
        setError(err.response?.data?.error || 'Failed to delete exterior color');
      }
    }
  };

  // Interior color handlers
  const handleAddInteriorColor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInteriorColor.name.trim()) {
      setError('Interior color name is required');
      return;
    }

    if (!token) {
      setError('Not authenticated. Please log in again.');
      navigate('/auth/login', { state: { returnUrl: '/color-management' } });
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:8000/api/interior-colors/add/', 
        newInteriorColor, 
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setInteriorColors([...interiorColors, response.data]);
      setNewInteriorColor({ name: '', hex_code: '#000000' });
      setMessage('Interior color added successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      console.error('Error adding interior color:', err);
      if (err.response?.status === 401) {
        handleAuthError();
      } else {
        setError(err.response?.data?.error || 'Failed to add interior color');
      }
    }
  };

  const handleDeleteInteriorColor = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this interior color?')) {
      return;
    }

    if (!token) {
      setError('Not authenticated. Please log in again.');
      navigate('/auth/login', { state: { returnUrl: '/color-management' } });
      return;
    }

    try {
      await axios.delete(`http://localhost:8000/api/interior-colors/delete/${id}/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      
      setInteriorColors(interiorColors.filter(color => color.id !== id));
      setMessage('Interior color deleted successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      console.error('Error deleting interior color:', err);
      if (err.response?.status === 401) {
        handleAuthError();
      } else {
        setError(err.response?.data?.error || 'Failed to delete interior color');
      }
    }
  };

  // Upholstery management handlers
  const handleAddUpholstery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpholstery.trim()) {
      setError('Upholstery name is required');
      return;
    }

    try {
      await addUpholsteryType(newUpholstery);
      setNewUpholstery('');
      setMessage('Upholstery type added successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error adding upholstery:', err);
      setError('Failed to add upholstery type');
    }
  };

  // Delete an individual upholstery type
  const handleDeleteUpholstery = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the "${name}" upholstery type?`)) {
      return;
    }

    try {
      await deleteUpholsteryType(id);
      setMessage(`Upholstery type "${name}" deleted successfully`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting upholstery:', err);
      setError('Failed to delete upholstery type');
    }
  };

  // If not authenticated, show a redirect message
  if (!isAuthenticated && loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-xl font-bold mb-4">Authentication Required</div>
          <div className="mb-4">You need to be logged in to access this page.</div>
          <div className="text-gray-500">Redirecting to login page...</div>
        </div>
      </div>
    );
  }

  if (loading || upholsteryLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Color Management</h1>
      
      {/* Messages */}
      {(error || upholsteryError) && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || upholsteryError}
          <button className="float-right font-bold" onClick={() => setError('')}>×</button>
        </div>
      )}
      
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {message}
          <button className="float-right font-bold" onClick={() => setMessage('')}>×</button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Exterior Colors Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Exterior Colors</h2>
          
          {/* Add Exterior Color Form */}
          <form onSubmit={handleAddExteriorColor} className="mb-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color Name</label>
                <input
                  type="text"
                  value={newExteriorColor.name}
                  onChange={(e) => setNewExteriorColor({...newExteriorColor, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g. Alpine White"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color Code</label>
                <div className="flex items-center">
                  <input
                    type="color"
                    value={newExteriorColor.hex_code}
                    onChange={(e) => setNewExteriorColor({...newExteriorColor, hex_code: e.target.value})}
                    className="h-10 w-10 mr-2"
                  />
                  <input
                    type="text"
                    value={newExteriorColor.hex_code}
                    onChange={(e) => setNewExteriorColor({...newExteriorColor, hex_code: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="#000000"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition"
              >
                Add Exterior Color
              </button>
            </div>
          </form>
          
          {/* Exterior Colors List */}
          <div className="overflow-auto max-h-96">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-left">Color</th>
                  <th className="py-2 px-4 border-b text-left">Name</th>
                  <th className="py-2 px-4 border-b text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {exteriorColors.map((color) => (
                  <tr key={color.id}>
                    <td className="py-2 px-4 border-b">
                      <div 
                        className="w-6 h-6 rounded" 
                        style={{ backgroundColor: color.hex_code }}
                      ></div>
                    </td>
                    <td className="py-2 px-4 border-b">{color.name}</td>
                    <td className="py-2 px-4 border-b">
                      <button
                        onClick={() => handleDeleteExteriorColor(color.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {exteriorColors.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-gray-500">
                      No exterior colors found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Interior Colors Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Interior Colors</h2>
          
          {/* Add Interior Color Form */}
          <form onSubmit={handleAddInteriorColor} className="mb-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color Name</label>
                <input
                  type="text"
                  value={newInteriorColor.name}
                  onChange={(e) => setNewInteriorColor({...newInteriorColor, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g. Black"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color Code</label>
                <div className="flex items-center">
                  <input
                    type="color"
                    value={newInteriorColor.hex_code}
                    onChange={(e) => setNewInteriorColor({...newInteriorColor, hex_code: e.target.value})}
                    className="h-10 w-10 mr-2"
                  />
                  <input
                    type="text"
                    value={newInteriorColor.hex_code}
                    onChange={(e) => setNewInteriorColor({...newInteriorColor, hex_code: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="#000000"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition"
              >
                Add Interior Color
              </button>
            </div>
          </form>
          
          {/* Interior Colors List */}
          <div className="overflow-auto max-h-96">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-left">Color</th>
                  <th className="py-2 px-4 border-b text-left">Name</th>
                  <th className="py-2 px-4 border-b text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {interiorColors.map((color) => (
                  <tr key={color.id}>
                    <td className="py-2 px-4 border-b">
                      <div 
                        className="w-6 h-6 rounded" 
                        style={{ backgroundColor: color.hex_code }}
                      ></div>
                    </td>
                    <td className="py-2 px-4 border-b">{color.name}</td>
                    <td className="py-2 px-4 border-b">
                      <button
                        onClick={() => handleDeleteInteriorColor(color.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {interiorColors.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-gray-500">
                      No interior colors found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Upholstery Management Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Upholstery Types</h2>
          
          {/* Add Upholstery Form */}
          <form onSubmit={handleAddUpholstery} className="mb-6">
            <div className="flex">
              <input
                type="text"
                value={newUpholstery}
                onChange={(e) => setNewUpholstery(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md"
                placeholder="e.g. Leather"
              />
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-r-md transition"
              >
                Add Upholstery
              </button>
            </div>
          </form>
          
          {/* Upholstery List */}
          <div className="overflow-auto max-h-96">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-left">Name</th>
                  <th className="py-2 px-4 border-b text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {upholsteryTypes.map((type) => (
                  <tr key={type.id}>
                    <td className="py-2 px-4 border-b">{type.name}</td>
                    <td className="py-2 px-4 border-b text-right">
                      <button
                        onClick={() => handleDeleteUpholstery(type.id, type.name)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {upholsteryTypes.length === 0 && (
                  <tr>
                    <td colSpan={2} className="py-4 text-center text-gray-500">
                      No upholstery types found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorManagementPage;