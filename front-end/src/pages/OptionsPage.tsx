import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OptionForm from '../components/OptionForm';
import { getStoredAuth } from '../utils/auth';
import { API_ENDPOINTS } from '../config/api'; // Import API endpoints

interface Option {
  id: number;
  name: string;
  category: string;
  category_display: string;
}

interface Category {
  value: string;
  label: string;
}

const OptionsPage = () => {
  const navigate = useNavigate();
  const [options, setOptions] = useState<Option[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = getStoredAuth();

  useEffect(() => {
    if (!token) {
      navigate('/auth/login');
      return;
    }

    fetchOptions();
    fetchCategories();
  }, [token, navigate]);

  const fetchCategories = async () => {
    try {
      // Use API_ENDPOINTS instead of hardcoded URL
      const response = await fetch(API_ENDPOINTS.OPTIONS.CATEGORIES, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error("Categories fetching error:", err);
      // Set default categories in case API fails
      setCategories([
        { value: 'COMFORT', label: 'Comfort & Convenience' },
        { value: 'ENTERTAINMENT', label: 'Entertainment & Media' },
        { value: 'SAFETY', label: 'Safety & Security' },
        { value: 'EXTRAS', label: 'Extras' },
      ]);
    }
  };

  const fetchOptions = async () => {
    try {
      setLoading(true);
      // Use API_ENDPOINTS instead of hardcoded URL
      const response = await fetch(API_ENDPOINTS.OPTIONS.LIST, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch options');
      }
      
      const data = await response.json();
      setOptions(data);
    } catch (err) {
      setError(`Error fetching options: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error("Options fetching error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionAdded = (newOption: Option) => {
    setOptions([...options, newOption]);
  };

  const handleDeleteOption = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this option?')) return;

    try {
      // Use API_ENDPOINTS with parameter function for DELETE
      const response = await fetch(API_ENDPOINTS.OPTIONS.DELETE(id), {
        method: 'DELETE',
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (response.ok) {
        setOptions(options.filter(option => option.id !== id));
      } else {
        throw new Error('Failed to delete option');
      }
    } catch (err) {
      setError(`Error deleting option: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Group options by category
  const getOptionsByCategory = (categoryValue: string) => {
    return options.filter(option => option.category === categoryValue);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Options</h1>
        <button
          onClick={() => navigate('/auth/dashboard')}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <OptionForm onOptionAdded={handleOptionAdded} />
        </div>
        
        <div className="md:col-span-2">
          {error && <p className="text-red-500 mb-4">{error}</p>}
          
          {loading ? (
            <p className="bg-white shadow rounded p-4">Loading options...</p>
          ) : options.length === 0 ? (
            <p className="bg-white shadow rounded p-4">No options found. Add your first option!</p>
          ) : (
            <div className="space-y-6">
              {categories.map(category => (
                <div key={category.value} className="bg-white shadow rounded p-4">
                  <h2 className="text-lg font-semibold mb-4">{category.label}</h2>
                  
                  {getOptionsByCategory(category.value).length === 0 ? (
                    <p className="text-gray-500">No options in this category</p>
                  ) : (
                    <ul className="divide-y">
                      {getOptionsByCategory(category.value).map((option) => (
                        <li key={option.id} className="py-3 flex justify-between items-center">
                          <span>{option.name}</span>
                          <button
                            onClick={() => handleDeleteOption(option.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OptionsPage;