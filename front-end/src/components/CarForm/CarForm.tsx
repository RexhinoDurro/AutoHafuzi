// Modified CarForm.tsx with aspect ratio validation and without cropping
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ImageGallery } from './ImageGallery';
import { useCarForm } from './useCarForm';
import { API_BASE_URL } from '../../config/api';
import { ExteriorColor, InteriorColor, CarImage } from '../../types/car';
import {
  BODY_TYPES,
  DRIVETRAINS,
  GEARBOX_TYPES,
  FUEL_TYPES,
  EMISSION_CLASSES,
} from './constants';
import { TempImage } from './useCarFormImageUpload';

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
    isUpholsteryLoading,
    error,
    makes,
    models,
    variants,
    upholsteryTypes,
    formData: serverFormData,
    setFormData: setServerFormData,
    handleSubmit: hookHandleSubmit,
    handleImageDelete: hookHandleImageDelete,
    tempImages: hookTempImages,
    handleImageUpload: hookHandleImageUpload,
    clearTempImagesStorage,
    detectedAspectRatio
  } = useCarForm(id);

  // Local form state that doesn't trigger API calls until necessary
  const [localFormData, setLocalFormData] = useState(serverFormData);

  // Local state for images to prevent refresh on add/delete
  const [localImages, setLocalImages] = useState<CarImage[]>([]);
  const [localTempImages, setLocalTempImages] = useState<TempImage[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);

  // Update local form state when server data changes (initial load or after submit)
  useEffect(() => {
    setLocalFormData(serverFormData);
  }, [serverFormData]);

  // Update local images when server images change
  useEffect(() => {
    if (serverFormData.images) {
      setLocalImages(serverFormData.images);
    }
    
    // Keep local temp images in sync with hook's temp images
    setLocalTempImages(hookTempImages);
    
    console.log(`Synced ${hookTempImages.length} temporary images from hook to local state`);
  }, [serverFormData.images, hookTempImages]);

  // State for form validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [availableOptions, setAvailableOptions] = useState<Array<{id: number, name: string}>>([]);
  const [selectedOptions, setSelectedOptions] = useState<Array<number>>([]);
  const [activeCategory, setActiveCategory] = useState<string>("COMFORT");
  const [categorizedOptions, setCategorizedOptions] = useState<Record<string, Array<{id: number, name: string, category: string}>>>({
    COMFORT: [],
    ENTERTAINMENT: [],
    SAFETY: [],
    EXTRAS: []
  });
  
  // State for colors
  const [exteriorColors, setExteriorColors] = useState<ExteriorColor[]>([]);
  const [interiorColors, setInteriorColors] = useState<InteriorColor[]>([]);
  const [isColorsLoading, setIsColorsLoading] = useState<boolean>(false);
  const [formattedPrice, setFormattedPrice] = useState<string>('');
  const [formattedMileage, setFormattedMileage] = useState<string>('');

  const optionCategories = {
    'COMFORT': 'Rehatia & Komoditeti',
    'ENTERTAINMENT': 'Argëtimi & Media',
    'SAFETY': 'Siguria & Mbrojtja',
    'EXTRAS': 'Ekstra'
  };

  // Add this useEffect at the top level to prevent continuous refreshes
  useEffect(() => {
    // This runs only once when the component mounts
    console.log('CarForm mounted');
    
    // This will help prevent unintended navigation away from the form
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const message = "You have unsaved changes. Are you sure you want to leave?";
      e.returnValue = message;
      return message;
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Cleanup function to prevent memory leaks
    return () => {
      console.log('CarForm unmounted');
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Revoke object URLs for temp images
      localTempImages.forEach(image => {
        if (image.preview) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, [localTempImages]);

  // Initialize formatted values when localFormData changes
  useEffect(() => {
    if (!localFormData.discussedPrice && localFormData.price) {
      setFormattedPrice(formatPrice(localFormData.price));
    } else {
      setFormattedPrice('');
    }
    
    if (localFormData.mileage) {
      setFormattedMileage(formatMileage(localFormData.mileage));
    } else {
      setFormattedMileage('');
    }
  }, [localFormData.price, localFormData.discussedPrice, localFormData.mileage]);

  // Format price with commas
  const formatPrice = (price: number | string): string => {
    if (!price) return '';
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Parse price from formatted string to number
  const parsePrice = (formattedPrice: string): number => {
    return parseFloat(formattedPrice.replace(/,/g, '')) || 0;
  };

  // Format mileage with commas
  const formatMileage = (mileage: number | string): string => {
    if (!mileage) return '';
    return mileage.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Parse mileage from formatted string to number
  const parseMileage = (formattedMileage: string): number => {
    return parseFloat(formattedMileage.replace(/,/g, '')) || 0;
  };

  // General field change handler - updates both localFormData and serverFormData
  const handleFieldChange = useCallback((field: string, value: any) => {
    // Update local form data immediately for responsive UI
    setLocalFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Also update the server form data to ensure changes are saved
    setServerFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, [setServerFormData]);

  // Handle price change with formatting
  const handlePriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormattedPrice(value);
    
    // Update both form states with the parsed price
    const parsedPrice = parsePrice(value);
    handleFieldChange('price', parsedPrice);
    handleFieldChange('discussedPrice', false);
  }, [handleFieldChange]);

  // Handle mileage change with formatting
  const handleMileageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormattedMileage(value);
    
    // Update both form states with the parsed mileage
    const parsedMileage = parseMileage(value);
    handleFieldChange('mileage', parsedMileage);
  }, [handleFieldChange]);

  // Modified function for make and model changes - updates both states
  const updateLocalFormDataForRelationships = useCallback((field: string, value: any) => {
    // Update local state immediately
    setLocalFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // If changing make, reset model and variant
      if (field === 'make_id') {
        newData.model_id = 0;
        newData.variant_id = undefined;
      }
      
      // If changing model, reset variant
      if (field === 'model_id') {
        newData.variant_id = undefined;
      }
      
      return newData;
    });
    
    // Also update server form data
    setServerFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // If changing make, reset model and variant
      if (field === 'make_id') {
        newData.model_id = 0;
        newData.variant_id = undefined;
      }
      
      // If changing model, reset variant
      if (field === 'model_id') {
        newData.variant_id = undefined;
      }
      
      return newData;
    });
    
    // No need to call fetchModels/fetchVariants directly
    // The useEffect hooks in useCarForm will handle this based on formData changes
  }, [setServerFormData]);
  
  // Local image handlers (fixes image refresh issue)
  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      console.log(`Local image upload triggered with ${e.target.files.length} files`);
      
      // Call the hook's handler directly with the event
      hookHandleImageUpload(e);
      
      console.log('Image upload initiated');
    }
  };

  const handleLocalImageDelete = (imageId: number) => {
    // Handle locally based on image type
    if (imageId < 0) {
      // It's a temporary image
      setLocalTempImages(prev => prev.filter(img => img.id !== imageId));
      
      // Also call the hook handler to stay in sync
      hookHandleImageDelete(imageId);
      
      console.log(`Deleted temporary image ${imageId}`);
    } else {
      // It's a server image - remove from local display but don't call API yet
      setLocalImages(prev => prev.filter(img => img.id !== imageId));
      
      // Track that we should delete this on submit
      setImagesToDelete(prev => [...prev, imageId]);
      
      console.log(`Marked server image ${imageId} for deletion on form submission`);
    }
  };

  // Fetch exterior and interior colors
  const fetchColors = async () => {
    setIsColorsLoading(true);
    try {
      const exteriorResponse = await fetch(`${API_BASE_URL}/api/exterior-colors/`);
      const interiorResponse = await fetch(`${API_BASE_URL}/api/interior-colors/`);
      
      if (!exteriorResponse.ok || !interiorResponse.ok) {
        throw new Error('Failed to fetch colors');
      }
      
      const exteriorData = await exteriorResponse.json();
      const interiorData = await interiorResponse.json();
      
      setExteriorColors(exteriorData);
      setInteriorColors(interiorData);
    } catch (error) {
      console.error('Error fetching colors:', error);
    } finally {
      setIsColorsLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/options/list/`);
      if (!response.ok) {
        throw new Error('Failed to fetch options');
      }
      const data = await response.json();
      setAvailableOptions(data);
      
      // Categorize options
      const categorized: Record<string, any[]> = {
        COMFORT: [],
        ENTERTAINMENT: [],
        SAFETY: [],
        EXTRAS: []
      };
      
      data.forEach((option: any) => {
        if (categorized[option.category]) {
          categorized[option.category].push(option);
        } else {
          categorized.EXTRAS.push(option);
        }
      });
      
      setCategorizedOptions(categorized);
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchOptions();
    fetchColors();
  }, []);

  // Update selectedOptions when server formData option_ids change (initial load)
  useEffect(() => {
    if (serverFormData.option_ids && serverFormData.option_ids.length > 0) {
      setSelectedOptions(serverFormData.option_ids);
    }
  }, [serverFormData.option_ids]);

  // Validate dates
  const validateDates = () => {
    // Create date objects, ensuring we use UTC to avoid timezone issues
    const today = new Date();
    
    // Check if first registration date is valid
    if (localFormData.first_registration_year && localFormData.first_registration_month && localFormData.first_registration_day) {
      const firstRegDate = new Date(
        localFormData.first_registration_year, 
        localFormData.first_registration_month - 1, 
        localFormData.first_registration_day
      );
      
      if (firstRegDate > today) {
        return 'First registration date cannot be in the future';
      }
    }
    
    if (localFormData.created_at) {
      const created = new Date(localFormData.created_at);
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
    if (!localFormData.make_id) errors.make = 'Make is required';
    if (!localFormData.model_id) errors.model = 'Model is required';
    if (!localFormData.exterior_color_id) errors.exterior_color = 'Exterior color is required';
    if (!localFormData.price && !localFormData.discussedPrice) errors.price = 'Price is required';
    if (!localFormData.description) errors.description = 'Description is required';
    if (!localFormData.created_at) errors.created_at = 'Created date is required';
    
    // Registration fields validation
    if (localFormData.is_used) {
      if (!localFormData.first_registration_day) {
        errors.first_registration_day = 'Day is required for used vehicles';
      }
      if (!localFormData.first_registration_month) {
        errors.first_registration_month = 'Month is required for used vehicles';
      }
      if (!localFormData.first_registration_year) {
        errors.first_registration_year = 'Year is required for used vehicles';
      }
    }
  
    if (!localFormData.discussedPrice && !localFormData.price) {
      errors.price = 'Price is required when not using discussed price';
    }
    
    // Validate numeric fields
    if (localFormData.cylinders !== undefined && 
        (isNaN(Number(localFormData.cylinders)) || Number(localFormData.cylinders) < 1)) {
      errors.cylinders = 'Cylinders must be a valid number';
    }
    
    // Get any date validation errors
    const dateError = validateDates();
    if (dateError) {
      errors.dates = dateError;
    }
    
    return errors;
  };

  // Form submission with image handling
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    // Validate the form
    const errors = validateForm();
    setValidationErrors(errors);
    
    // If there are validation errors, show them and stop submission
    if (Object.keys(errors).length > 0) {
      window.scrollTo(0, 0);
      return;
    }
    
    try {
      // Process any pending image deletions first
      for (const imageId of imagesToDelete) {
        await hookHandleImageDelete(imageId);
      }
      
      // Clear the pending delete tracker
      setImagesToDelete([]);
      
      // Submit the form data and temporary images
      const success = await hookHandleSubmit(e);
      if (success) {
        // Clear temp images from storage after successful submission
        clearTempImagesStorage();
        navigate('/auth/dashboard');
      }
    } catch (error) {
      console.error('Error during form submission:', error);
      setValidationErrors({
        submission: error instanceof Error ? error.message : 'Error submitting form'
      });
      window.scrollTo(0, 0);
    }
  };

  // Generate month options
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const monthNumber = i + 1;
    return {
      value: monthNumber,
      label: new Date(2000, i, 1).toLocaleString('default', { month: 'long' })
    };
  });

  // Generate day options (1-31)
  const dayOptions = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    return {
      value: day,
      label: String(day).padStart(2, '0')
    };
  });

  // Generate year options (from 1900 to current year)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1899 }, (_, i) => {
    const year = 1900 + i;
    return {
      value: year,
      label: String(year)
    };
  }).reverse(); // Most recent years first
 
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
                  value={localFormData.make_id || ''}
                  onChange={(e) => updateLocalFormDataForRelationships('make_id', parseInt(e.target.value))}
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
                  value={localFormData.model_id || ''}
                  onChange={(e) => updateLocalFormDataForRelationships('model_id', parseInt(e.target.value))}
                  className={`w-full p-2 border rounded-lg ${validationErrors.model ? 'border-red-500' : ''}`}
                  required
                  disabled={!localFormData.make_id || isModelsLoading}
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

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Variant
                </label>
                <select
                  value={localFormData.variant_id || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleFieldChange('variant_id', value === '' ? undefined : parseInt(value));
                  }}
                  className="w-full p-2 border rounded-lg"
                  disabled={!localFormData.model_id || isVariantsLoading}
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
            </div>

            {/* First Registration Date Fields */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Registration <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-4">
                {/* Day field */}
                <div>
                  <select
                    value={localFormData.first_registration_day || ''}
                    onChange={(e) => handleFieldChange('first_registration_day', e.target.value ? parseInt(e.target.value) : undefined)}
                    className={`w-full p-2 border rounded-lg ${validationErrors.first_registration_day ? 'border-red-500' : ''}`}
                    required={localFormData.is_used}
                  >
                    <option value="">Day</option>
                    {dayOptions.map(option => (
                      <option key={`day-${option.value}`} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {validationErrors.first_registration_day && 
                    <p className="text-red-500 text-xs mt-1">{validationErrors.first_registration_day}</p>
                  }
                </div>
                
                {/* Month field */}
                <div>
                  <select
                    value={localFormData.first_registration_month || ''}
                    onChange={(e) => handleFieldChange('first_registration_month', e.target.value ? parseInt(e.target.value) : undefined)}
                    className={`w-full p-2 border rounded-lg ${validationErrors.first_registration_month ? 'border-red-500' : ''}`}
                    required={localFormData.is_used}
                  >
                    <option value="">Month</option>
                    {monthOptions.map(option => (
                      <option key={`month-${option.value}`} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {validationErrors.first_registration_month && 
                    <p className="text-red-500 text-xs mt-1">{validationErrors.first_registration_month}</p>
                  }
                </div>
                
                {/* Year field */}
                <div>
                  <select
                    value={localFormData.first_registration_year || ''}
                    onChange={(e) => handleFieldChange('first_registration_year', e.target.value ? parseInt(e.target.value) : undefined)}
                    className={`w-full p-2 border rounded-lg ${validationErrors.first_registration_year ? 'border-red-500' : ''}`}
                    required={localFormData.is_used}
                  >
                    <option value="">Year</option>
                    {yearOptions.map(option => (
                      <option key={`year-${option.value}`} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {validationErrors.first_registration_year && 
                    <p className="text-red-500 text-xs mt-1">{validationErrors.first_registration_year}</p>
                  }
                </div>
              </div>
            </div>

            {/* Colors Section */}
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Colors & Upholstery</h3>
              <div className="grid grid-cols-3 gap-4">
                {/* Exterior Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exterior Color <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={localFormData.exterior_color_id || ''}
                    onChange={(e) => {
                      const colorId = e.target.value ? parseInt(e.target.value) : undefined;
                      const selectedColor = exteriorColors.find(color => color.id === colorId);
                      
                      // Update multiple fields at once in local state
                      setLocalFormData(prev => ({
                        ...prev,
                        exterior_color_id: colorId,
                        exterior_color_name: selectedColor?.name,
                        exterior_color_hex: selectedColor?.hex_code
                      }));
                      
                      // Also update server form data
                      setServerFormData(prev => ({
                        ...prev,
                        exterior_color_id: colorId,
                        exterior_color_name: selectedColor?.name,
                        exterior_color_hex: selectedColor?.hex_code
                      }));
                    }}
                    className={`w-full p-2 border rounded-lg ${validationErrors.exterior_color ? 'border-red-500' : ''}`}
                    required
                    disabled={isColorsLoading}
                  >
                    <option value="">Select Exterior Color</option>
                    {exteriorColors.map((color) => (
                      <option key={color.id} value={color.id}>
                        {color.name}
                      </option>
                    ))}
                  </select>
                  {isColorsLoading && <span className="text-sm text-gray-500">Loading colors...</span>}
                  {validationErrors.exterior_color && <p className="text-red-500 text-xs mt-1">{validationErrors.exterior_color}</p>}
                  {localFormData.exterior_color_hex && (
                    <div className="mt-2 flex items-center">
                      <div 
                        className="w-6 h-6 mr-2 border border-gray-300 rounded" 
                        style={{ backgroundColor: localFormData.exterior_color_hex }}
                      ></div>
                      <span className="text-xs text-gray-500">{localFormData.exterior_color_hex}</span>
                    </div>
                  )}
                </div>
                
                {/* Interior Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interior Color
                  </label>
                  <select
                    value={localFormData.interior_color_id || ''}
                    onChange={(e) => {
                      const colorId = e.target.value ? parseInt(e.target.value) : undefined;
                      const selectedColor = interiorColors.find(color => color.id === colorId);
                      
                      // Update multiple fields at once in local state
                      setLocalFormData(prev => ({
                        ...prev,
                        interior_color_id: colorId,
                        interior_color_name: selectedColor?.name,
                        interior_color_hex: selectedColor?.hex_code
                      }));
                      
                      // Also update server form data
                      setServerFormData(prev => ({
                        ...prev,
                        interior_color_id: colorId,
                        interior_color_name: selectedColor?.name,
                        interior_color_hex: selectedColor?.hex_code
                      }));
                    }}
                    className="w-full p-2 border rounded-lg"
                    disabled={isColorsLoading}
                  >
                    <option value="">Select Interior Color</option>
                    {interiorColors.map((color) => (
                      <option key={color.id} value={color.id}>
                        {color.name}
                      </option>
                    ))}
                  </select>
                  {isColorsLoading && <span className="text-sm text-gray-500">Loading colors...</span>}
                  {localFormData.interior_color_hex && (
                    <div className="mt-2 flex items-center">
                      <div 
                        className="w-6 h-6 mr-2 border border-gray-300 rounded" 
                        style={{ backgroundColor: localFormData.interior_color_hex }}
                      ></div>
                      <span className="text-xs text-gray-500">{localFormData.interior_color_hex}</span>
                    </div>
                  )}
                </div>
                
                {/* Upholstery */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upholstery
                  </label>
                  <select
                    value={localFormData.upholstery_id || ''}
                    onChange={(e) => {
                      const upholsteryId = e.target.value ? parseInt(e.target.value) : undefined;
                      const selectedUpholstery = upholsteryTypes.find(type => type.id === upholsteryId);
                      
                      setLocalFormData(prev => ({ 
                        ...prev, 
                        upholstery_id: upholsteryId,
                        upholstery_name: selectedUpholstery?.name || ''
                      }));
                      
                      setServerFormData(prev => ({ 
                        ...prev, 
                        upholstery_id: upholsteryId,
                        upholstery_name: selectedUpholstery?.name || ''
                      }));
                    }}
                    className="w-full p-2 border rounded-lg"
                    disabled={isUpholsteryLoading}
                  >
                    <option value="">Select Upholstery</option>
                    {upholsteryTypes.map((type) => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                  {isUpholsteryLoading && <span className="text-sm text-gray-500">Loading upholstery types...</span>}
                </div>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (€) {!localFormData.discussedPrice && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                value={formattedPrice}
                onChange={handlePriceChange}
                className={`w-full p-2 border rounded-lg ${validationErrors.price ? 'border-red-500' : ''}`}
                required={!localFormData.discussedPrice}
                disabled={localFormData.discussedPrice}
                placeholder={localFormData.discussedPrice ? 'Price will be discussed' : ''}
              />
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="discussedPrice"
                  checked={localFormData.discussedPrice || false}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    setLocalFormData(prev => ({ 
                      ...prev, 
                      discussedPrice: isChecked,
                      price: isChecked ? 0 : prev.price // Set price to 0 when discussedPrice is checked
                    }));
                    
                    setServerFormData(prev => ({ 
                      ...prev, 
                      discussedPrice: isChecked,
                      price: isChecked ? 0 : prev.price // Set price to 0 when discussedPrice is checked
                    }));
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="discussedPrice" className="ml-2 text-sm text-gray-700">
                  Discussed price
                </label>
              </div>
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
              onChange={handleLocalImageUpload}
              className="w-full border border-gray-300 p-2 rounded"
            />
            <p className="mt-1 text-sm text-gray-500">
              Max file size: 5MB. Supported formats: JPEG, PNG, WebP
            </p>
            {detectedAspectRatio && (
              <p className="mt-1 text-sm text-gray-600">
                <strong>Note:</strong> All uploaded images must have the same aspect ratio ({detectedAspectRatio}:1).
              </p>
            )}
            {isLoading && <p className="mt-2 text-blue-500">Uploading images...</p>}
            {(localImages.length > 0 || localTempImages.length > 0) && (
              <ImageGallery
                images={[...localImages, ...localTempImages]}
                onDeleteImage={handleLocalImageDelete}
                isEditing={true}
                baseUrl={API_BASE_URL}
                detectedAspectRatio={detectedAspectRatio}
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
                  value={localFormData.body_type}
                  onChange={(e) => handleFieldChange('body_type', e.target.value)}
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
                  value={localFormData.drivetrain}
                  onChange={(e) => handleFieldChange('drivetrain', e.target.value)}
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
                  value={localFormData.seats}
                  onChange={(e) => handleFieldChange('seats', parseInt(e.target.value))}
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
                  value={localFormData.doors}
                  onChange={(e) => handleFieldChange('doors', parseInt(e.target.value))}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mileage (km)
                </label>
                <input
                  type="text"
                  value={formattedMileage}
                  onChange={handleMileageChange}
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
                  value={localFormData.power}
                  onChange={(e) => handleFieldChange('power', parseInt(e.target.value))}
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
                  value={localFormData.engine_size}
                  onChange={(e) => handleFieldChange('engine_size', parseFloat(e.target.value))}
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
                  value={localFormData.weight}
                  onChange={(e) => handleFieldChange('weight', parseInt(e.target.value))}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gearbox
                </label>
                <select
                  value={localFormData.gearbox}
                  onChange={(e) => handleFieldChange('gearbox', e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  {GEARBOX_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cylinders
                </label>
                <select
                  value={localFormData.cylinders}
                  onChange={(e) => handleFieldChange('cylinders', parseInt(e.target.value))}
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
                  value={localFormData.fuel_type}
                  onChange={(e) => handleFieldChange('fuel_type', e.target.value)}
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
                  value={localFormData.emission_class}
                  onChange={(e) => handleFieldChange('emission_class', e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  {EMISSION_CLASSES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Created At <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={localFormData.created_at}
                  onChange={(e) => handleFieldChange('created_at', e.target.value)}
                  className={`w-full p-2 border rounded-lg ${validationErrors.created_at ? 'border-red-500' : ''}`}
                  required
                />
                {validationErrors.created_at && <p className="text-red-500 text-xs mt-1">{validationErrors.created_at}</p>}
              </div>
              
              <div className="flex items-center mt-6">
                <input
                  type="checkbox"
                  checked={localFormData.customs_paid}
                  onChange={(e) => handleFieldChange('customs_paid', e.target.checked)}
                  className="h-4 w-4 text-blue-600"
                />
                <label className="ml-2 text-sm text-gray-700">Customs Paid</label>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={localFormData.is_used}
                  onChange={(e) => handleFieldChange('is_used', e.target.checked)}
                  className="h-4 w-4 text-blue-600"
                />
                <label className="ml-2 text-sm text-gray-700">Used Vehicle</label>
              </div>
            </div>
          </div>
          
          {/* Options */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">Options</h3>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Options
            </label>
            
            {/* Loading state */}
            {availableOptions.length === 0 && (
              <div className="text-sm text-gray-500 mb-2">Loading options...</div>
            )}
            
            {/* Category tabs */}
            <div className="mb-3 border-b border-gray-200">
              <nav className="-mb-px flex space-x-4 overflow-x-auto">
                {Object.entries(optionCategories).map(([categoryKey, categoryLabel]) => (
                  <button
                    key={categoryKey}
                    type="button"
                    onClick={() => setActiveCategory(categoryKey)}
                    className={`whitespace-nowrap py-2 px-3 text-sm font-medium ${
                      activeCategory === categoryKey 
                        ? 'border-b-2 border-blue-500 text-blue-600' 
                        : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {categoryLabel}
                  </button>
                ))}
              </nav>
            </div>
  
            <div className="max-h-60 overflow-y-auto border rounded-lg p-3">
              <div className="grid grid-cols-2 gap-2">
                {categorizedOptions[activeCategory]?.map((option) => (
                  <div key={option.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`option-${option.id}`}
                      checked={selectedOptions.includes(option.id)}
                      onChange={(e) => {
                        const optionId = option.id;
                        let newSelectedOptions: number[];
                        
                        if (e.target.checked) {
                          // Add the option if checked
                          newSelectedOptions = [...selectedOptions, optionId];
                        } else {
                          // Remove the option if unchecked
                          newSelectedOptions = selectedOptions.filter(id => id !== optionId);
                        }
                        
                        setSelectedOptions(newSelectedOptions);
                        
                        // Update localFormData with the selected option IDs
                        handleFieldChange('option_ids', newSelectedOptions);
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`option-${option.id}`} className="ml-2 text-sm text-gray-700">
                      {option.name}
                    </label>
                  </div>
                ))}
  
                {categorizedOptions[activeCategory]?.length === 0 && (
                  <div className="col-span-2 text-sm text-gray-500 py-2">
                    No options available in this category
                  </div>
                )}
              </div>
            </div>
            
            {selectedOptions.length > 0 && (
              <div className="mt-3">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Selected Options ({selectedOptions.length}):</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedOptions.map((optionId) => {
                    const option = availableOptions.find(opt => opt.id === optionId);
                    return option ? (
                      <div key={optionId} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full flex items-center">
                        {option.name}
                        <button
                          type="button"
                          onClick={() => {
                            const newSelected = selectedOptions.filter(id => id !== optionId);
                            setSelectedOptions(newSelected);
                            handleFieldChange('option_ids', newSelected);
                          }}
                          className="ml-1 text-gray-500 hover:text-gray-700"
                        >
                          <span className="sr-only">Remove</span>
                          ×
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
  
          {/* Description */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">Description</h3>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={localFormData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
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