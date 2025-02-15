// src/components/AdminCarForm.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getStoredAuth } from '../utils/auth';

interface Make {
  id: number;
  name: string;
}

interface Model {
  id: number;
  name: string;
  make: number;
}

interface FormData {
  make: string;
  model: string;
  year: number;
  color: string;
  price: number;
  description: string;
  image: File | null;
}

const CarForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { token } = getStoredAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  const [makes, setMakes] = useState<Make[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  
  const [formData, setFormData] = useState<FormData>({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    price: 0,
    description: '',
    image: null,
  });
  
  const [preview, setPreview] = useState<string>('');

  // Fetch makes when component mounts
  useEffect(() => {
    fetchMakes();
    if (id) {
      fetchCarDetails();
    }
  }, [id]);

  // Fetch models when make changes
  useEffect(() => {
    if (formData.make) {
      fetchModels(formData.make);
    } else {
      setModels([]);
    }
  }, [formData.make]);

  const fetchMakes = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/makes/');
      if (!response.ok) throw new Error('Failed to fetch makes');
      const data = await response.json();
      setMakes(data);
    } catch (error) {
      setError('Error loading car makes. Please try again.');
    }
  };

  const fetchModels = async (makeId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/models/${makeId}/`);
      if (!response.ok) throw new Error('Failed to fetch models');
      const data = await response.json();
      setModels(data);
    } catch (error) {
      setError('Error loading car models. Please try again.');
    }
  };

  const fetchCarDetails = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/cars/${id}/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch car details');
      const data = await response.json();
      
      setFormData({
        make: data.make,
        model: data.model,
        year: data.year,
        color: data.color,
        price: data.price,
        description: data.description,
        image: null,
      });
      
      if (data.image) {
        setPreview(`http://localhost:8000${data.image}`);
      }
    } catch (error) {
      setError('Error loading car details. Please try again.');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, image: file });
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null) {
        form.append(key, value);
      }
    });

    try {
      const url = id
        ? `http://localhost:8000/api/cars/update/${id}/`
        : 'http://localhost:8000/api/cars/add/';
      
      const response = await fetch(url, {
        method: id ? 'PUT' : 'POST',
        headers: {
          Authorization: `Token ${token}`,
        },
        body: form,
      });

      if (!response.ok) {
        throw new Error('Failed to save car');
      }

      navigate('/admin/dashboard');
    } catch (error) {
      setError('Error saving car. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{id ? 'Edit' : 'Add'} Car</h2>
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="text-gray-600 hover:text-gray-800"
        >
          Back to Dashboard
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Car Image
            </label>
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full"
              />
              {preview && (
                <div className="mt-2 h-48 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Make and Model */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Make
              </label>
              <select
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value, model: '' })}
                className="w-full p-2 border rounded-lg"
                required
              >
                <option value="">Select Make</option>
                {makes.map((make) => (
                  <option key={make.id} value={make.id}>
                    {make.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model
              </label>
              <select
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
                disabled={!formData.make}
              >
                <option value="">Select Model</option>
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Year, Color, Price */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <input
                type="number"
                min="1900"
                max={new Date().getFullYear() + 1}
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (€)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded-lg h-32"
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Saving...' : id ? 'Update Car' : 'Add Car'}
        </button>
      </form>
    </div>
  );
};

export default CarForm;