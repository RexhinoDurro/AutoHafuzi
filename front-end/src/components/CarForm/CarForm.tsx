import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ImageGallery } from './ImageGallery';
import { useCarForm } from './useCarForm';
import { API_BASE_URL } from '../../config/api';
import { CarImage, TempImage } from '../../types/car';
import {
  BODY_TYPES,
  DRIVETRAINS,
  GEARBOX_TYPES,
  FUEL_TYPES,
  EMISSION_CLASSES
} from './constants';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGES = 10;

const CarForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    isLoading,
    isMakesLoading,
    isModelsLoading,
    error,
    makes,
    models,
    formData,
    setFormData,
    newOption,
    setNewOption,
    handleSubmit,
    handleImagesUpload,
    handleImageDelete,
    tempImages
  } = useCarForm(id);

  const currentYear = useMemo(() => new Date().getFullYear(), []);

  const validateImages = (files: FileList, currentImages: (CarImage | TempImage)[]): string | null => {
    const currentImagesLength = currentImages.length;
    if (files.length + currentImagesLength > MAX_IMAGES) {
      return `Maximum ${MAX_IMAGES} images allowed`;
    }
  
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return 'Image size should not exceed 5MB';
      }
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return 'Only JPEG, PNG and WebP images are allowed';
      }
    }
    return null;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
  
    const currentImages = [...(formData.images || []), ...tempImages];
    const error = validateImages(files, currentImages);
    if (error) {
      alert(error);
      e.target.value = '';
      return;
    }
  
    handleImagesUpload(e);
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

  const validateDates = () => {
    const today = new Date();
    const firstReg = new Date(formData.first_registration);
    const inspection = new Date(formData.general_inspection_date);
    const created = new Date(formData.created_at);

    if (firstReg > today) {
      return 'First registration date cannot be in the future';
    }
    if (inspection < today) {
      return 'General inspection date must be in the future';
    }
    if (created > today) {
      return 'Created date cannot be in the future';
    }
    return null;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const dateError = validateDates();
    if (dateError) {
      alert(dateError);
      return;
    }

    await handleSubmit(e);
    const success = true; // Assuming handleSubmit always succeeds, adjust as needed
    if (success) {
      navigate('/admin/dashboard');
    }
  };

  if (isLoading || isMakesLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
        <strong className="font-bold">Error! </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    )}

    <form onSubmit={onSubmit} className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Car Images <span className="text-gray-500">({MAX_IMAGES} max)</span>
          </label>
          <input
            type="file"
            accept={ALLOWED_FILE_TYPES.join(',')}
            multiple
            onChange={handleImageUpload}
            className="w-full border border-gray-300 p-2 rounded"
          />
          <p className="mt-1 text-sm text-gray-500">
            Max file size: 5MB. Supported formats: JPEG, PNG, WebP
          </p>
          {isLoading && <p className="mt-2 text-blue-500">Uploading images...</p>}
          {(formData.images?.length > 0 || tempImages.length > 0) && (
            <ImageGallery
              images={[...(formData.images || []), ...tempImages]}
              onDeleteImage={handleImageDelete}
              isEditing={true}
              baseUrl={API_BASE_URL}
            />
          )}
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Make <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.make}
              onChange={(e) => setFormData({ ...formData, make: e.target.value, model: '' })}
              className="w-full p-2 border rounded-lg"
              required
              disabled={isMakesLoading}
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
              Model <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="w-full p-2 border rounded-lg"
              required
              disabled={!formData.make || isModelsLoading}
            >
              <option value="">Select Model</option>
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
            {isModelsLoading && <span className="text-sm text-gray-500">Loading models...</span>}
          </div>
        </div>

        {/* Year, Color, Price */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1900"
              max={currentYear + 1}
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color <span className="text-red-500">*</span>
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
              Price (€) <span className="text-red-500">*</span>
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
}

export default CarForm;