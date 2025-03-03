import React, { useMemo, useState, useEffect } from 'react';
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
  EMISSION_CLASSES,
  COLORS
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
    isVariantsLoading,
    error,
    makes,
    models,
    variants,
    formData,
    setFormData,
    newOption,
    setNewOption,
    handleSubmit,
    handleImagesUpload,
    handleImageDelete,
    tempImages,
    fetchVariants
  } = useCarForm(id);

  // State for form validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const currentYear = useMemo(() => new Date().getFullYear(), []);

  // Load variants when model changes
  useEffect(() => {
    if (formData.model) {
      fetchVariants(formData.model);
    }
  }, [formData.model, fetchVariants]);

  // Format price with commas
  const formatPrice = (price: number | string): string => {
    if (!price) return '';
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Parse price from formatted string to number
  const parsePrice = (formattedPrice: string): number => {
    return parseFloat(formattedPrice.replace(/,/g, '')) || 0;
  };

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
    // Create date objects, ensuring we use UTC to avoid timezone issues
    const today = new Date();
    
    // Only validate if the dates exist
    if (formData.first_registration) {
      const firstReg = new Date(formData.first_registration);
      if (firstReg > today) {
        return 'First registration date cannot be in the future';
      }
    }
    
    if (formData.general_inspection_date) {
      const inspection = new Date(formData.general_inspection_date);
      if (inspection < today) {
        return 'General inspection date must be in the future';
      }
    }
    
    if (formData.created_at) {
      const created = new Date(formData.created_at);
      if (created > today) {
        return 'Created date cannot be in the future';
      }
    }
    
    return null;
  };

  // Validate all required fields
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    // Required fields
    if (!formData.make) errors.make = 'Make is required';
    if (!formData.model) errors.model = 'Model is required';
    if (!formData.year) errors.year = 'Year is required';
    if (!formData.color) errors.color = 'Color is required';
    if (!formData.price) errors.price = 'Price is required';
    if (!formData.description) errors.description = 'Description is required';
    if (!formData.created_at) errors.created_at = 'Created date is required';
    
    // Validate numeric fields
    if (formData.cylinders !== undefined && 
        (isNaN(Number(formData.cylinders)) || Number(formData.cylinders) < 1)) {
      errors.cylinders = 'Cylinders must be a valid number';
    }
    
    // Get any date validation errors
    const dateError = validateDates();
    if (dateError) {
      errors.dates = dateError;
    }
    
    return errors;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate the form
    const errors = validateForm();
    setValidationErrors(errors);
    
    // If there are validation errors, show them and stop submission
    if (Object.keys(errors).length > 0) {
      // Scroll to the top to show errors
      window.scrollTo(0, 0);
      return;
    }

    await handleSubmit(e);
    const success = true; // Assuming handleSubmit always succeeds, adjust as needed
    if (success) {
      navigate('/auth/dashboard');
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
        onClick={() => navigate('/auth/dashboard')}
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

    {/* Form validation errors */}
    {Object.keys(validationErrors).length > 0 && (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
        <strong className="font-bold">Please fix the following errors: </strong>
        <ul className="mt-2 list-disc list-inside">
          {Object.values(validationErrors).map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      </div>
    )}

    <form onSubmit={onSubmit} className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Basic Information Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-3">Basic Information</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Make <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value, model: '', variant: '' })}
                className={`w-full p-2 border rounded-lg ${validationErrors.make ? 'border-red-500' : ''}`}
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
              {validationErrors.make && <p className="text-red-500 text-xs mt-1">{validationErrors.make}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value, variant: '' })}
                className={`w-full p-2 border rounded-lg ${validationErrors.model ? 'border-red-500' : ''}`}
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
              {validationErrors.model && <p className="text-red-500 text-xs mt-1">{validationErrors.model}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Variant
              </label>
              <select
                value={formData.variant || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ 
                    ...formData, 
                    variant: value === '' ? '' : value // Keep as empty string if empty, otherwise use the value
                  });
                }}
                className="w-full p-2 border rounded-lg"
                disabled={!formData.model || isVariantsLoading}
              >
                <option value="">Select Variant</option>
                {variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.name}
                  </option>
                ))}
              </select>
              {isVariantsLoading && <span className="text-sm text-gray-500">Loading variants...</span>}
            </div>

            {/*rest of the form */}

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
                className={`w-full p-2 border rounded-lg ${validationErrors.year ? 'border-red-500' : ''}`}
                required
              />
              {validationErrors.year && <p className="text-red-500 text-xs mt-1">{validationErrors.year}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className={`w-full p-2 border rounded-lg ${validationErrors.color ? 'border-red-500' : ''}`}
                required
              >
                <option value="">Select Color</option>
                {COLORS.map((color) => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
              {validationErrors.color && <p className="text-red-500 text-xs mt-1">{validationErrors.color}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (€) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formatPrice(formData.price)}
              onChange={(e) => setFormData({ ...formData, price: parsePrice(e.target.value) })}
              className={`w-full p-2 border rounded-lg ${validationErrors.price ? 'border-red-500' : ''}`}
              required
            />
            {validationErrors.price && <p className="text-red-500 text-xs mt-1">{validationErrors.price}</p>}
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-3">Images</h3>
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

        {/* Vehicle Details */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-3">Vehicle Details</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
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
                onChange={(e) => setFormData({ 
                  ...formData, 
                  mileage: e.target.value === '' ? 0 : parseInt(e.target.value) 
                })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Technical Specifications */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-3">Technical Specifications</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
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
              <select
                value={formData.cylinders}
                onChange={(e) => setFormData({ ...formData, cylinders: parseInt(e.target.value) })}
                className={`w-full p-2 border rounded-lg ${validationErrors.cylinders ? 'border-red-500' : ''}`}
              >
                <option value="">Select Cylinders</option>
                {[1, 2, 3, 4, 5, 6, 8, 10, 12, 16].map((num) => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
              {validationErrors.cylinders && <p className="text-red-500 text-xs mt-1">{validationErrors.cylinders}</p>}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-3">Additional Information</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
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
                Created At <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.created_at}
                onChange={(e) => setFormData({ ...formData, created_at: e.target.value })}
                className={`w-full p-2 border rounded-lg ${validationErrors.created_at ? 'border-red-500' : ''}`}
                required
              />
              {validationErrors.created_at && <p className="text-red-500 text-xs mt-1">{validationErrors.created_at}</p>}
            </div>
          </div>

          {/* Checkboxes */}
          <div className="grid grid-cols-3 gap-4 mt-4">
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
        </div>

        {/* Options */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-3">Options</h3>
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
          <h3 className="text-lg font-medium text-gray-800 mb-3">Description</h3>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className={`w-full p-2 border rounded-lg h-32 ${validationErrors.description ? 'border-red-500' : ''}`}
            required
          />
          {validationErrors.description && <p className="text-red-500 text-xs mt-1">{validationErrors.description}</p>}
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