// src/components/CarForm/useCarForm.ts
import { useState, useEffect, useCallback } from 'react';
import { FormData as CarFormData, Make, Model, Variant, Upholstery } from '../../types/car';
import { getStoredAuth } from '../../utils/auth';
import { API_ENDPOINTS } from '../../config/api';
import { useCarFormImageUpload} from './useCarFormImageUpload';
import { getCloudinaryUrl } from '../../utils/imageService';

const parseNumericValue = (value: string | number | null | undefined, defaultValue: number): number => {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  const parsed = Number(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

export const useCarForm = (id?: string) => {
  const { token } = getStoredAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isMakesLoading, setIsMakesLoading] = useState(false);
  const [isModelsLoading, setIsModelsLoading] = useState(false);
  const [isVariantsLoading, setIsVariantsLoading] = useState(false);
  const [isUpholsteryLoading, setIsUpholsteryLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [makes, setMakes] = useState<Make[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [upholsteryTypes, setUpholsteryTypes] = useState<Upholstery[]>([]);
  const [newOption, setNewOption] = useState<string>('');
  
  // Get current date for defaults
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentDay = currentDate.getDate();

  // Integrate image upload functionality
  const {
    tempImages,
    nextTempId,
    isUploading,
    uploadError,
    handleImageUpload,
    handleImageDelete,
    setTempImages,
    setNextTempId,
    uploadTempImages
  } = useCarFormImageUpload();

  const [formData, setFormData] = useState<CarFormData>({
    make_id: undefined,
    model_id: undefined,
    variant_id: undefined,
    make: '',
    model: '',
    variant: '',
    // Removed year field
    first_registration_day: currentDay,
    first_registration_month: currentMonth,
    first_registration_year: currentYear,
    exterior_color: '',
    exterior_color_id: undefined,
    exterior_color_name: '',
    exterior_color_hex: '',
    interior_color: '',
    interior_color_id: undefined,
    interior_color_name: '',
    interior_color_hex: '',
    upholstery_id: undefined,
    upholstery_name: '',
    price: 0,
    discussedPrice: false,
    description: '',
    image: null,
    created_at: new Date().toISOString().split('T')[0],
    body_type: 'Sedan',
    is_used: true,
    drivetrain: 'FWD',
    seats: 5,
    doors: 4,
    mileage: 0,
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
    option_ids: []
  });

  const fetchMakes = useCallback(async () => {
    setIsMakesLoading(true);
    try {
      // Add the admin=true parameter to get all makes regardless of whether they have cars
      const response = await fetch(`${API_ENDPOINTS.MAKES}?admin=true`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Invalid response format');
      setMakes(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error fetching makes');
    } finally {
      setIsMakesLoading(false);
    }
  }, [token]);

  const fetchModels = useCallback(async (makeId: string) => {
    if (!makeId) {
      setModels([]);
      return;
    }
    setIsModelsLoading(true);
    try {
      // Add the admin=true parameter to get all models regardless of whether they have cars
      const response = await fetch(`${API_ENDPOINTS.MODELS.LIST_BY_MAKE(makeId)}?admin=true`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Invalid response format');
      setModels(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error fetching models');
      setModels([]);
    } finally {
      setIsModelsLoading(false);
    }
  }, [token]);

  const fetchVariants = useCallback(async (modelId: string) => {
    if (!modelId) {
      setVariants([]);
      return;
    }
    setIsVariantsLoading(true);
    try {
      // Add the admin=true parameter to get all variants regardless of whether they have cars
      const response = await fetch(`${API_ENDPOINTS.VARIANTS.LIST_BY_MODEL(modelId)}?admin=true`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Invalid response format');
      setVariants(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error fetching variants');
      setVariants([]);
    } finally {
      setIsVariantsLoading(false);
    }
  }, [token]);

  // Add a new function to fetch upholstery types
  const fetchUpholsteryTypes = useCallback(async () => {
    setIsUpholsteryLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.UPHOLSTERY, {
        headers: { Authorization: `Token ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Invalid response format');
      setUpholsteryTypes(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error fetching upholstery types');
    } finally {
      setIsUpholsteryLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (formData.make) {
      fetchModels(formData.make);
    }
  }, [formData.make, fetchModels]);

  useEffect(() => {
    if (formData.make_id) {
      fetchModels(formData.make_id.toString());
    }
  }, [formData.make_id, fetchModels]);

  useEffect(() => {
    if (formData.model_id) {
      fetchVariants(formData.model_id.toString());
    }
  }, [formData.model_id, fetchVariants]);

  const fetchCarDetails = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.CARS.GET(id), {
        headers: { Authorization: `Token ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      console.log("Fetched car data:", data); // For debugging
      
      // Process images to ensure they work with Cloudinary
      if (data.images && data.images.length > 0) {
        // Make sure each image has the necessary properties
        data.images = data.images.map((img: any) => ({
          ...img,
          // If URL is available but image is not, set image to URL for backward compatibility
          image: img.image || img.url || '',
          // Optimize Cloudinary URLs if present
          url: img.url ? getCloudinaryUrl(img.url, 800, 600, 'auto') : img.url
        }));
      }
      
      // Save the current data
      const carData = {
        ...formData,
        ...data,
        make: data.make_id?.toString() || '',
        model: data.model_id?.toString() || '',
        variant: data.variant_id?.toString() || '',
        exterior_color_id: data.exterior_color_id,
        exterior_color_name: data.exterior_color_name || '',
        exterior_color_hex: data.exterior_color_hex || '',
        interior_color_id: data.interior_color_id,
        interior_color_name: data.interior_color_name || '',
        interior_color_hex: data.interior_color_hex || '',
        upholstery_id: data.upholstery,  // Use the correct field from server response
        upholstery_name: data.upholstery_name || '',
        // Handle first registration fields
        first_registration_day: data.first_registration_day || currentDay,
        first_registration_month: data.first_registration_month || currentMonth,
        first_registration_year: data.first_registration_year || currentYear,
        // Important: Map discussed_price (from backend) to discussedPrice (for frontend)
        discussedPrice: data.discussed_price || false,
        // Make sure we have option_ids
        option_ids: data.options?.map((opt: any) => opt.id || opt) || [],
        // Save the slug
        slug: data.slug || ''
      };
      
      setFormData(carData);
      
      // If we have a model, fetch the variants
      if (carData.model) {
        fetchVariants(carData.model);
      }
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error fetching car details');
    } finally {
      setIsLoading(false);
    }
  }, [id, token, fetchVariants, currentDay, currentMonth, currentYear, formData]);

  // Improved form data preparation for submission to handle all fields properly
  const prepareFormDataForSubmission = useCallback((data: CarFormData) => {
    if (!data) {
      throw new Error('Form data is undefined');
    }
    
    // Create a new FormData object for multipart/form-data submission
    const formDataObj = new FormData();
    
    // Make and Model handling
    if (data.make_id) {
      formDataObj.append('make', data.make_id.toString());
    }
    
    if (data.model_id) {
      formDataObj.append('model', data.model_id.toString());
    }
    
    // Variant handling - Only add if variant_id exists
    if (data.variant_id) {
      formDataObj.append('variant', data.variant_id.toString());
    }
    
    // First registration fields instead of year
    formDataObj.append('first_registration_day', parseNumericValue(data.first_registration_day, currentDay).toString());
    formDataObj.append('first_registration_month', parseNumericValue(data.first_registration_month, currentMonth).toString());
    formDataObj.append('first_registration_year', parseNumericValue(data.first_registration_year, currentYear).toString());
    
    // Color handling
    if (data.exterior_color_id) {
      formDataObj.append('exterior_color', data.exterior_color_id.toString());
    }
    
    if (data.interior_color_id) {
      formDataObj.append('interior_color', data.interior_color_id.toString());
    }
    
    // Handle upholstery as a separate field
    if (data.upholstery_id) {
      formDataObj.append('upholstery', data.upholstery_id.toString());
    }
    
    // Price and Discussed Price - Fixed to properly handle discussed_price field
    formDataObj.append('price', parseNumericValue(data.price, 0).toString());
    
    // Important: Ensure the discussed_price field is set correctly
    // Convert discussedPrice (from frontend) to discussed_price (for backend)
    formDataObj.append('discussed_price', data.discussedPrice ? 'true' : 'false');
    
    // Description
    formDataObj.append('description', data.description || '');
    
    // Car specifications
    formDataObj.append('body_type', data.body_type || 'Sedan');
    formDataObj.append('is_used', data.is_used ? 'true' : 'false');
    formDataObj.append('drivetrain', data.drivetrain || 'FWD');
    formDataObj.append('seats', parseNumericValue(data.seats, 5).toString());
    formDataObj.append('doors', parseNumericValue(data.doors, 4).toString());
    formDataObj.append('mileage', parseNumericValue(data.mileage, 0).toString());
    
    // Date handling
    if (data.created_at) {
      formDataObj.append('created_at', data.created_at);
    }
    
    if (data.general_inspection_date) {
      formDataObj.append('general_inspection_date', data.general_inspection_date);
    }
    
    // Boolean fields
    formDataObj.append('full_service_history', data.full_service_history ? 'true' : 'false');
    formDataObj.append('customs_paid', data.customs_paid ? 'true' : 'false');
    
    // Technical specifications
    formDataObj.append('power', parseNumericValue(data.power, 100).toString());
    formDataObj.append('gearbox', data.gearbox || 'Manual');
    formDataObj.append('engine_size', parseNumericValue(data.engine_size, 1.6).toString());
    formDataObj.append('gears', parseNumericValue(data.gears, 5).toString());
    formDataObj.append('cylinders', parseNumericValue(data.cylinders, 4).toString());
    formDataObj.append('weight', parseNumericValue(data.weight, 1200).toString());
    formDataObj.append('emission_class', data.emission_class || 'Euro 6');
    formDataObj.append('fuel_type', data.fuel_type || 'Petrol');
    
    // OPTIONS HANDLING
    if (Array.isArray(data.option_ids) && data.option_ids.length > 0) {
      // For FormData/multipart submissions, DRF expects multiple fields with the same name
      data.option_ids.forEach(optionId => {
        formDataObj.append('options', optionId.toString());
      });
    }
    
    return formDataObj;
  }, [currentDay, currentMonth, currentYear]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      // Step 1: Create or update car with properly formatted data
      const formDataObj = prepareFormDataForSubmission(formData);
      
      // The server expects PUT for updates, not PATCH
      const method = id ? 'PUT' : 'POST';
      const endpoint = id ? API_ENDPOINTS.CARS.UPDATE(id) : API_ENDPOINTS.CARS.ADD;
      console.log(`Submitting data to ${endpoint} using ${method}`);
      
      const response = await fetch(endpoint, {
        method: method,
        headers: { 
          Authorization: `Token ${token}`
          // Note: Don't set Content-Type when using FormData - the browser will set it with the boundary
        },
        body: formDataObj,
      });
      
      // Better error handling
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = `Failed to save car: ${response.status}`;
        
        try {
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            console.error('Server JSON error:', errorData);
            if (errorData.error) errorMessage = errorData.error;
            else if (errorData.variant) errorMessage = `Variant error: ${errorData.variant}`;
            else if (errorData.non_field_errors) errorMessage = errorData.non_field_errors[0];
            else errorMessage = JSON.stringify(errorData);
          } else {
            const textError = await response.text();
            console.error('Server text error:', textError);
            if (textError.length < 100) errorMessage = textError;
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
        
        throw new Error(errorMessage);
      }
      
      const carData = await response.json();
      console.log("Car creation/update response:", carData); // Debug log
      
      // IMPORTANT: Use the slug for image operations
      const carSlug = carData.slug;
      console.log("Using car slug for images:", carSlug);
      
      // Step 2: Upload any temporary images using the enhanced image upload
      if (tempImages.length > 0 && carSlug) {
        console.log(`Uploading ${tempImages.length} compressed images for car slug: ${carSlug}`);
        
        try {
          // Use the uploadTempImages function from useCarFormImageUpload
          const uploadedImages = await uploadTempImages(carSlug);
          console.log("Successfully uploaded images:", uploadedImages);
          
          // After successful upload, fetch the updated car data to get the new images
          const updatedCarResponse = await fetch(API_ENDPOINTS.CARS.GET(carSlug), {
            headers: { Authorization: `Token ${token}` },
          });
          
          if (updatedCarResponse.ok) {
            const updatedCar = await updatedCarResponse.json();
            // Make sure to process the images with Cloudinary URLs
            if (updatedCar.images && updatedCar.images.length > 0) {
              updatedCar.images = updatedCar.images.map((img: any) => ({
                ...img,
                image: img.image || img.url || '',
                // Optimize Cloudinary URLs
                url: img.url ? getCloudinaryUrl(img.url, 800, 600, 'auto') : img.url
              }));
            }
            
            setFormData({
              ...updatedCar,
              make: updatedCar.make_id?.toString() || '',
              model: updatedCar.model_id?.toString() || '',
              variant: updatedCar.variant_id?.toString() || '',
              exterior_color_id: updatedCar.exterior_color_id,
              exterior_color_name: updatedCar.exterior_color_name || '',
              exterior_color_hex: updatedCar.exterior_color_hex || '',
              interior_color_id: updatedCar.interior_color_id,
              interior_color_name: updatedCar.interior_color_name || '',
              interior_color_hex: updatedCar.interior_color_hex || '',
              upholstery_id: updatedCar.upholstery,  // This is the field that was causing the error
              upholstery_name: updatedCar.upholstery_name || '',
              first_registration_day: updatedCar.first_registration_day || currentDay,
              first_registration_month: updatedCar.first_registration_month || currentMonth,
              first_registration_year: updatedCar.first_registration_year || currentYear,
              discussedPrice: updatedCar.discussed_price || false,
              option_ids: updatedCar.options?.map((opt: any) => opt.id || opt) || [],
              slug: updatedCar.slug
            });
          }
        } catch (imageError) {
          console.error("Error uploading images:", imageError);
          // Allow the submission to succeed even if image upload fails
        }
      }
      
      return true; // Return success
    } catch (error) {
      console.error('Full error details:', error);
      setError(error instanceof Error ? error.message : 'Error submitting form');
      return false; // Return failure
    } finally {
      setIsLoading(false);
    }
  }, [formData, id, prepareFormDataForSubmission, tempImages, token, uploadTempImages, currentDay, currentMonth, currentYear]);

  // Add initial setup effect - ONLY runs on mount
  useEffect(() => {
    fetchMakes();
    fetchUpholsteryTypes(); // Call the upholstery types fetch
    if (id) fetchCarDetails();
    
    // Cleanup function to revoke object URLs
    return () => {
      tempImages.forEach(image => URL.revokeObjectURL(image.preview));
    };
  }, [fetchMakes, fetchUpholsteryTypes, fetchCarDetails, id, tempImages]);

  return { 
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
    newOption, 
    setNewOption, 
    tempImages, 
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleImageUpload(e.target.files);
        // Reset the input value after handling the files
        e.target.value = '';
      }
    },
    handleImageDelete, 
    handleSubmit,
    fetchVariants,
    fetchUpholsteryTypes,
    nextTempId,
    setTempImages,
    setNextTempId,
    // Additional image-related properties
    isUploading,
    uploadError
  };
};