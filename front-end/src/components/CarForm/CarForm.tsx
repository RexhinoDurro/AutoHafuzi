import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ImageGallery } from './ImageGallery';
import { useCarForm } from './useCarForm';
import { API_BASE_URL } from '../../config/api';
import { CarImage, TempImage, ExteriorColor, InteriorColor } from '../../types/car';
import {
  BODY_TYPES,
  DRIVETRAINS,
  GEARBOX_TYPES,
  FUEL_TYPES,
  EMISSION_CLASSES,
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
    isUpholsteryLoading,
    error,
    makes,
    models,
    variants,
    upholsteryTypes,
    formData,
    setFormData,
    handleSubmit,
    handleImageDelete,
    tempImages,
    fetchVariants,
    nextTempId,
    setTempImages,
    setNextTempId
  } = useCarForm(id);

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

  const optionCategories = {
    COMFORT: 'Comfort & Convenience',
    ENTERTAINMENT: 'Entertainment & Media',
    SAFETY: 'Safety & Security',
    EXTRAS: 'Extras'
  };

  // Helper function to get correct image URL for any image type

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
      tempImages.forEach(image => {
        if (image.preview) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, [tempImages]);

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

  // Format mileage with commas
  const formatMileage = (mileage: number | string): string => {
    if (!mileage) return '';
    return mileage.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Parse mileage from formatted string to number
  const parseMileage = (formattedMileage: string): number => {
    return parseFloat(formattedMileage.replace(/,/g, '')) || 0;
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
  
    // Create temporary image previews for display before upload
    let currentTempId = nextTempId;
    const newTempImages = Array.from(files).map(file => {
      const imageId = currentTempId;
      currentTempId -= 1;
      
      // Create object URL for preview
      const preview = URL.createObjectURL(file);
      
      return {
        id: imageId,
        file,
        preview
      };
    });
    
    // Fix: Use explicit type for the prev parameter
    setTempImages((prev: TempImage[]) => [...prev, ...newTempImages]);
    setNextTempId(currentTempId);
    
    // Reset input value
    e.target.value = '';
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
      
      // If editing an existing car, set the selected options
      if (formData.option_ids && formData.option_ids.length > 0) {
        setSelectedOptions(formData.option_ids);
      }
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchOptions();
    fetchColors();
  }, []);
  
  // Handle option selection changes

  const validateDates = () => {
    // Create date objects, ensuring we use UTC to avoid timezone issues
    const today = new Date();
    
    // Check if first registration date is valid
    if (formData.first_registration_year && formData.first_registration_month && formData.first_registration_day) {
      const firstRegDate = new Date(
        formData.first_registration_year, 
        formData.first_registration_month - 1, 
        formData.first_registration_day
      );
      
      if (firstRegDate > today) {
        return 'First registration date cannot be in the future';
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
    if (!formData.make_id) errors.make = 'Make is required';
    if (!formData.model_id) errors.model = 'Model is required';
    if (!formData.exterior_color_id) errors.exterior_color = 'Exterior color is required';
    if (!formData.price && !formData.discussedPrice) errors.price = 'Price is required';
    if (!formData.description) errors.description = 'Description is required';
    if (!formData.created_at) errors.created_at = 'Created date is required';
    
    // Registration fields validation
    if (formData.is_used) {
      if (!formData.first_registration_day) {
        errors.first_registration_day = 'Day is required for used vehicles';
      }
      if (!formData.first_registration_month) {
        errors.first_registration_month = 'Month is required for used vehicles';
      }
      if (!formData.first_registration_year) {
        errors.first_registration_year = 'Year is required for used vehicles';
      }
    }
  
    if (!formData.discussedPrice && !formData.price) {
      errors.price = 'Price is required when not using discussed price';
    }
    
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

    const success = await handleSubmit(e);
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
                  value={formData.make_id || ''}
                  onChange={(e) => setFormData({ ...formData, make_id: parseInt(e.target.value), model_id: 0, variant_id: undefined })}
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
                  value={formData.model_id || ''}
                  onChange={(e) => setFormData({ ...formData, model_id: parseInt(e.target.value), variant_id: undefined })}
                  className={`w-full p-2 border rounded-lg ${validationErrors.model ? 'border-red-500' : ''}`}
                  required
                  disabled={!formData.make_id || isModelsLoading}
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
                  value={formData.variant_id || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ 
                      ...formData, 
                      variant_id: value === '' ? undefined : parseInt(value) // Keep as undefined if empty, otherwise use the value
                    });
                  }}
                  className="w-full p-2 border rounded-lg"
                  disabled={!formData.model_id || isVariantsLoading}
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
                    value={formData.first_registration_day || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      first_registration_day: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                    className={`w-full p-2 border rounded-lg ${validationErrors.first_registration_day ? 'border-red-500' : ''}`}
                    required={formData.is_used}
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
                    value={formData.first_registration_month || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      first_registration_month: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                    className={`w-full p-2 border rounded-lg ${validationErrors.first_registration_month ? 'border-red-500' : ''}`}
                    required={formData.is_used}
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
                    value={formData.first_registration_year || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      first_registration_year: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                    className={`w-full p-2 border rounded-lg ${validationErrors.first_registration_year ? 'border-red-500' : ''}`}
                    required={formData.is_used}
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
                    value={formData.exterior_color_id || ''}
                    onChange={(e) => {
                      const colorId = e.target.value ? parseInt(e.target.value) : undefined;
                      const selectedColor = exteriorColors.find(color => color.id === colorId);
                      
                      setFormData({ 
                        ...formData, 
                        exterior_color_id: colorId,
                        exterior_color_name: selectedColor?.name,
                        exterior_color_hex: selectedColor?.hex_code
                      });
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
                  {formData.exterior_color_hex && (
                    <div className="mt-2 flex items-center">
                      <div 
                        className="w-6 h-6 mr-2 border border-gray-300 rounded" 
                        style={{ backgroundColor: formData.exterior_color_hex }}
                      ></div>
                      <span className="text-xs text-gray-500">{formData.exterior_color_hex}</span>
                    </div>
                  )}
                </div>
                
                {/* Interior Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interior Color
                  </label>
                  <select
                    value={formData.interior_color_id || ''}
                    onChange={(e) => {
                      const colorId = e.target.value ? parseInt(e.target.value) : undefined;
                      const selectedColor = interiorColors.find(color => color.id === colorId);
                      
                      setFormData({ 
                        ...formData, 
                        interior_color_id: colorId,
                        interior_color_name: selectedColor?.name,
                        interior_color_hex: selectedColor?.hex_code
                      });
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
                  {formData.interior_color_hex && (
                    <div className="mt-2 flex items-center">
                      <div 
                        className="w-6 h-6 mr-2 border border-gray-300 rounded" 
                        style={{ backgroundColor: formData.interior_color_hex }}
                      ></div>
                      <span className="text-xs text-gray-500">{formData.interior_color_hex}</span>
                    </div>
                  )}
                </div>
                
                {/* Upholstery - Properly implemented with the separate upholstery model */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upholstery
                  </label>
                  <select
                    value={formData.upholstery_id || ''}
                    onChange={(e) => {
                      const upholsteryId = e.target.value ? parseInt(e.target.value) : undefined;
                      const selectedUpholstery = upholsteryTypes.find(type => type.id === upholsteryId);
                      
                      setFormData({ 
                        ...formData, 
                        upholstery_id: upholsteryId,
                        upholstery_name: selectedUpholstery?.name || ''
                      });
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
                Price (€) {!formData.discussedPrice && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                value={formData.discussedPrice ? '' : formatPrice(formData.price)}
                onChange={(e) => setFormData({ ...formData, price: parsePrice(e.target.value), discussedPrice: false })}
                className={`w-full p-2 border rounded-lg ${validationErrors.price ? 'border-red-500' : ''}`}
                required={!formData.discussedPrice}
                disabled={formData.discussedPrice}
                placeholder={formData.discussedPrice ? 'Price will be discussed' : ''}
              />
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="discussedPrice"
                  checked={formData.discussedPrice || false}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    setFormData({ 
                      ...formData, 
                      discussedPrice: isChecked,
                      price: isChecked ? 0 : formData.price // Set price to 0 when discussedPrice is checked
                    });
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
                type="text"
                value={formData.mileage === 0 ? '' : formatMileage(formData.mileage)}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  mileage: parseMileage(e.target.value) 
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

          <div className="grid grid-cols-2 gap-4">
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
          <div className="grid grid-cols-2 gap-4">
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
            
            <div className="flex items-center mt-6">
              <input
                type="checkbox"
                checked={formData.customs_paid}
                onChange={(e) => setFormData({ ...formData, customs_paid: e.target.checked })}
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
                checked={formData.is_used}
                onChange={(e) => setFormData({ ...formData, is_used: e.target.checked })}
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
        
        // Update formData with the selected option IDs directly
        setFormData({
          ...formData,
          option_ids: newSelectedOptions
        });
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
                  setFormData({
                    ...formData,
                    option_ids: newSelected
                  });
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