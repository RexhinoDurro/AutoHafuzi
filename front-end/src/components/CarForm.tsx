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

interface CarImage {
  id: number;
  url: string;
}

interface FormData {
  make: string;
  model: string;
  year: number;
  color: string;
  price: number;
  description: string;
  image: File | null;
  created_at: string;
  body_type: string;
  is_used: boolean;
  drivetrain: string;
  seats: number;
  doors: number;
  mileage: number;
  first_registration: string;
  general_inspection_date: string;
  full_service_history: boolean;
  customs_paid: boolean;
  power: number;
  gearbox: string;
  engine_size: number;
  gears: number;
  cylinders: number;
  weight: number;
  emission_class: string;
  fuel_type: string;
  options: string[];
  images?: CarImage[];

}

const BODY_TYPES = ['Sedan', 'SUV', 'Hatchback', 'Wagon', 'Coupe', 'Convertible', 'Van', 'Truck'];
const DRIVETRAINS = ['FWD', 'RWD', 'AWD', '4WD'];
const GEARBOX_TYPES = ['Manual', 'Automatic', 'Semi-Automatic', 'CVT'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid', 'LPG', 'CNG'];
const EMISSION_CLASSES = ['Euro 1', 'Euro 2', 'Euro 3', 'Euro 4', 'Euro 5', 'Euro 6'];

interface ImageGalleryProps {
  images: CarImage[];
  onDeleteImage: (id: number) => void;
  isEditing: boolean;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, onDeleteImage, isEditing }) => {
  return (
    <div className="grid grid-cols-3 gap-4 mt-4">
      {images.map((image) => (
        <div key={image.id} className="relative">
          <img src={image.url} alt="Car" className="w-full h-48 object-cover rounded" />
          {isEditing && (
            <button
              onClick={() => onDeleteImage(image.id)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

const CarForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { token } = getStoredAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  const [makes, setMakes] = useState<Make[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [newOption, setNewOption] = useState<string>('');
  
  const [formData, setFormData] = useState<FormData>({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    price: 0,
    description: '',
    image: null,
    created_at: new Date().toISOString().split('T')[0],
    body_type: 'Sedan',
    is_used: true,
    drivetrain: 'FWD',
    seats: 5,
    doors: 4,
    mileage: 0,
    first_registration: '',
    general_inspection_date: '',
    full_service_history: false,
    customs_paid: false,
    power: 100,
    gearbox: 'Manual',
    engine_size: 1.6,
    gears: 5,
    cylinders: 4,
    weight: 1200,
    emission_class: 'Euro 6',
    fuel_type: 'Petrol',
    options: [],
    images: [],
  });
  
  const [preview, setPreview] = useState<string>('');

  useEffect(() => {
    fetchMakes();
    if (id) {
      fetchCarDetails();
    }
  }, [id]);

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
        make: data.make || '',
        model: data.model || '',
        year: data.year || new Date().getFullYear(),
        color: data.color || '',
        price: data.price || 0,
        description: data.description || '',
        image: null,
        created_at: data.created_at || new Date().toISOString().split('T')[0],
        body_type: data.body_type || 'Sedan',
        is_used: data.is_used ?? true,
        drivetrain: data.drivetrain || 'FWD',
        seats: data.seats ?? 5,
        doors: data.doors ?? 4,
        mileage: data.mileage ?? 0,
        first_registration: data.first_registration || '',
        general_inspection_date: data.general_inspection_date || '',
        full_service_history: data.full_service_history ?? false,
        customs_paid: data.customs_paid ?? false,
        power: data.power ?? 100,
        gearbox: data.gearbox || 'Manual',
        engine_size: data.engine_size ?? 1.6,
        gears: data.gears ?? 5,
        cylinders: data.cylinders ?? 4,
        weight: data.weight ?? 1200,
        emission_class: data.emission_class || 'Euro 6',
        fuel_type: data.fuel_type || 'Petrol',
        options: data.options || [],
        images: data.images || []
      });
      
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
        if (key === 'options' && Array.isArray(value)) {
          form.append(key, JSON.stringify(value));
        } else {
          form.append(key, value);
        }
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

  const handleOptionAdd = () => {
    if (newOption.trim()) {
      setFormData({
        ...formData,
        options: [...formData.options, newOption.trim()]
      });
      setNewOption('');
    }
  };

  const handleOptionRemove = (index: number) => {
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index)
    });
  };

  const handleImagesUpload = async (files: FileList) => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await fetch(`http://localhost:8000/api/cars/${id}/images/`, {
        method: 'POST',
        headers: {
          Authorization: `Token ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload images');
      }

      // Refresh car data to get new images
      await fetchCarDetails();
    } catch (error) {
      setError('Error uploading images. Please try again.');
    }
  };

  const handleImageDelete = async (imageId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/cars/images/${imageId}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      // Refresh car data to update images
      await fetchCarDetails();
    } catch (error) {
      setError('Error deleting image. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
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
       <div className="bg-white rounded-lg shadow p-6 space-y-6">
            {/* Image Upload */}
            <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Car Images
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => e.target.files && handleImagesUpload(e.target.files)}
            className="w-full"
          />
          {formData.images && formData.images.length > 0 && (
            <ImageGallery
              images={formData.images}
              onDeleteImage={handleImageDelete}
              isEditing={true}
            />
          )}
        </div>

          {/* Basic Information */}
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

          {/* Vehicle Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Body Type
              </label>
              <select
                value={formData.body_type}
                onChange={(e) => setFormData({ ...formData, body_type: e.target.value })}
                className="w-full p-2 border rounded-lg"
              >
                {BODY_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Drivetrain
              </label>
              <select
                value={formData.drivetrain}
                onChange={(e) => setFormData({ ...formData, drivetrain: e.target.value })}
                className="w-full p-2 border rounded-lg"
              >
                {DRIVETRAINS.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seats
              </label>
              <input
                type="number"
                min="1"
                max="9"
                value={formData.seats}
                onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) })}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Doors
              </label>
              <input
                type="number"
                min="1"
                max="6"
                value={formData.doors}
                onChange={(e) => setFormData({ ...formData, doors: parseInt(e.target.value) })}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mileage (km)
              </label>
              <input
                type="number"
                min="0"
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Power (HP)
              </label>
              <input
                type="number"
                min="0"
                value={formData.power}
                onChange={(e) => setFormData({ ...formData, power: parseInt(e.target.value) })}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Engine Size (L)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.engine_size}
                onChange={(e) => setFormData({ ...formData, engine_size: parseFloat(e.target.value) })}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                min="0"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gearbox
              </label>
              <select
                value={formData.gearbox}
                onChange={(e) => setFormData({ ...formData, gearbox: e.target.value })}
                className="w-full p-2 border rounded-lg"
              >
                {GEARBOX_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Gears
              </label>
              <input
                type="number"
                min="1"
                max="9"
                value={formData.gears}
                onChange={(e) => setFormData({ ...formData, gears: parseInt(e.target.value) })}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cylinders
              </label>
              <input
                type="number"
                min="1"
                max="16"
                value={formData.cylinders}
                onChange={(e) => setFormData({ ...formData, cylinders: parseInt(e.target.value) })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fuel Type
              </label>
              <select
                value={formData.fuel_type}
                onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                className="w-full p-2 border rounded-lg"
              >
                {FUEL_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Emission Class
              </label>
              <select
                value={formData.emission_class}
                onChange={(e) => setFormData({ ...formData, emission_class: e.target.value })}
                className="w-full p-2 border rounded-lg"
              >
                {EMISSION_CLASSES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Registration
              </label>
              <input
                type="date"
                value={formData.first_registration}
                onChange={(e) => setFormData({ ...formData, first_registration: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                General Inspection Date
              </label>
              <input
                type="date"
                value={formData.general_inspection_date}
                onChange={(e) => setFormData({ ...formData, general_inspection_date: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Created At
              </label>
              <input
                type="date"
                value={formData.created_at}
                onChange={(e) => setFormData({ ...formData, created_at: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_used}
                onChange={(e) => setFormData({ ...formData, is_used: e.target.checked })}
                className="h-4 w-4 text-blue-600"
              />
              <label className="ml-2 text-sm text-gray-700">Used Vehicle</label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.full_service_history}
                onChange={(e) => setFormData({ ...formData, full_service_history: e.target.checked })}
                className="h-4 w-4 text-blue-600"
              />
              <label className="ml-2 text-sm text-gray-700">Full Service History</label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.customs_paid}
                onChange={(e) => setFormData({ ...formData, customs_paid: e.target.checked })}
                className="h-4 w-4 text-blue-600"
              />
              <label className="ml-2 text-sm text-gray-700">Customs Paid</label>
            </div>
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Options
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                className="flex-1 p-2 border rounded-lg"
                placeholder="Enter new option"
              />
              <button
                type="button"
                onClick={handleOptionAdd}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="space-y-2">
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                  <span className="flex-1">{option}</span>
                  <button
                    type="button"
                    onClick={() => handleOptionRemove(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
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