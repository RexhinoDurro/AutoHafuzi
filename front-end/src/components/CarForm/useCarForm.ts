// src/components/CarForm/useCarForm.ts - Fixed version
import { useState, useEffect, useCallback, useRef } from 'react';
import { FormData as CarFormData, Make, Model, Variant, Upholstery, CarImage } from '../../types/car';
import { getStoredAuth } from '../../utils/auth';
import { API_ENDPOINTS } from '../../config/api';
import { useCarFormImageUpload } from './useCarFormImageUpload';
import { getCloudinaryUrl, getImageDimensions } from '../../utils/imageService';

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
  const initialFetchDone = useRef(false);
  const [detectedAspectRatio, setDetectedAspectRatio] = useState<number | null>(null);
  const [, setServerImages] = useState<CarImage[]>([]);
  
  // Get current date for defaults
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentDay = currentDate.getDate();

  // Integrate image upload functionality with enhanced approach
  const {
    tempImages,
    nextTempId,
    isUploading,
    uploadError,
    handleImageUpload: hookHandleImageUpload,
    handleImageDelete: hookHandleImageDelete,
    setTempImages,
    setNextTempId,
    uploadTempImages,
    clearTempImages,
    detectedAspectRatio: uploadDetectedAspectRatio
  } = useCarFormImageUpload(id);

  // Sync the detected aspect ratio from the upload hook
  useEffect(() => {
    if (uploadDetectedAspectRatio !== null) {
      setDetectedAspectRatio(uploadDetectedAspectRatio);
    }
  }, [uploadDetectedAspectRatio]);

  const [formData, setFormData] = useState<CarFormData>({
    make_id: undefined,
    model_id: undefined,
    variant_id: undefined,
    make: '',
    model: '',
    variant: '',
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

  // Format the detected aspect ratio into a readable string
  const formatAspectRatio = useCallback(() => {
    if (!detectedAspectRatio) return "None detected";
    
    // Common aspect ratios with their names
    const commonRatios = [
      { ratio: 1, text: '1:1 (Square)' },
      { ratio: 4/3, text: '4:3 (Standard)' },
      { ratio: 3/2, text: '3:2 (Classic)' },
      { ratio: 16/9, text: '16:9 (Widescreen)' },
      { ratio: 3/4, text: '3:4 (Portrait)' },
      { ratio: 2/3, text: '2:3 (Portrait)' },
      { ratio: 9/16, text: '9:16 (Mobile)' },
    ];
    
    // Find the closest common ratio
    const closest = commonRatios.reduce((prev, curr) => {
      return Math.abs(curr.ratio - detectedAspectRatio) < Math.abs(prev.ratio - detectedAspectRatio) ? curr : prev;
    });
    
    // If it's close to a common ratio (within 5%), use that name
    if (Math.abs(closest.ratio - detectedAspectRatio) <= 0.05 * detectedAspectRatio) {
      return closest.text;
    }
    
    // Otherwise, format as decimal with 2 digits of precision
    return `${detectedAspectRatio.toFixed(2)}:1`;
  }, [detectedAspectRatio]);

  // Enhanced image upload handler
  const handleImageUpload = useCallback(async (files: FileList) => {
    try {
      console.log(`Processing ${files.length} images for upload`);
      
      // Use the hook's handler but make sure we have the right context (editing or creating)
      const result = await hookHandleImageUpload(files);
      
      // If editing a car (we have an ID), these are server images that were just uploaded
      if (id && result && result.length > 0 && 'url' in result[0]) {
        const serverUploadedImages = result as unknown as CarImage[];
        
        // Update form data with new server images
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...serverUploadedImages]
        }));
        
        console.log(`Added ${serverUploadedImages.length} server images to form data`);
      }
      
      return result;
    } catch (error) {
      console.error('Error in handleImageUpload:', error);
      return [];
    }
  }, [hookHandleImageUpload, id]);

  // Enhanced image delete handler
  const handleImageDelete = useCallback(async (imageId: number) => {
    console.log(`Deleting image with ID: ${imageId}`);
    
    // Use the hook's handler
    const success = await hookHandleImageDelete(imageId);
    
    if (success) {
      // If it's a server image (positive ID), remove it from formData.images too
      if (imageId > 0) {
        setFormData(prev => ({
          ...prev,
          images: prev.images.filter(img => img.id !== imageId)
        }));
        console.log(`Removed server image ${imageId} from form data`);
      }
    }
    
    return success;
  }, [hookHandleImageDelete]);

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

  // Fetch models when make_id changes
  useEffect(() => {
    if (formData.make_id) {
      fetchModels(formData.make_id.toString());
    }
  }, [formData.make_id, fetchModels]);
  
  // Fetch variants when model_id changes
  useEffect(() => {
    if (formData.model_id) {
      fetchVariants(formData.model_id.toString());
    }
  }, [formData.model_id, fetchVariants]);

  // Improved fetch car details with proper image handling
  const fetchCarDetails = useCallback(async () => {
    if (!id || initialFetchDone.current) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.CARS.GET(id), {
        headers: { Authorization: `Token ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      console.log("Fetched car data:", data);
      
      // Process images for Cloudinary
      let processedImages: CarImage[] = [];
      
      if (data.images && data.images.length > 0) {
        processedImages = data.images.map((img: any) => ({
          ...img,
          id: img.id,
          image: img.image || img.url || '',
          url: img.url ? getCloudinaryUrl(img.url, 800, 600, 'auto') : (
            img.image && img.image.includes('cloudinary.com') 
              ? getCloudinaryUrl(img.image, 800, 600, 'auto') 
              : img.image || ''
          ),
          is_primary: img.is_primary || false,
          order: img.order || 0
        }));

        // Try to detect aspect ratio from the first image
        if (processedImages[0]?.url) {
          try {
            const dimensions = await getImageDimensions(processedImages[0].url);
            setDetectedAspectRatio(dimensions.aspectRatio);
          } catch (error) {
            console.error('Error detecting aspect ratio from image:', error);
          }
        }
        
        // Save server images
        setServerImages(processedImages);
      }
      
      // Create a complete car data object
      const carData = {
        make_id: data.make,
        model_id: data.model,
        variant_id: data.variant,
        make: data.make?.toString() || '',
        model: data.model?.toString() || '',
        variant: data.variant?.toString() || '',
        exterior_color_id: data.exterior_color,
        exterior_color_name: data.exterior_color_name || '',
        exterior_color_hex: data.exterior_color_hex || '',
        interior_color_id: data.interior_color,
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
        price: data.price || 0,
        description: data.description || '',
        created_at: data.created_at || new Date().toISOString().split('T')[0],
        body_type: data.body_type || 'Sedan',
        is_used: data.is_used !== undefined ? data.is_used : true,
        drivetrain: data.drivetrain || 'FWD',
        seats: data.seats || 5,
        doors: data.doors || 4,
        mileage: data.mileage || 0,
        general_inspection_date: data.general_inspection_date || '',
        full_service_history: data.full_service_history || false,
        customs_paid: data.customs_paid || false,
        power: data.power || 100,
        gearbox: data.gearbox || 'Manual',
        engine_size: data.engine_size || 1.6,
        gears: data.gears || 5,
        cylinders: data.cylinders || 4,
        weight: data.weight || 1200,
        emission_class: data.emission_class || 'Euro 6',
        fuel_type: data.fuel_type || 'Petrol',
        images: processedImages, // Use the processed images
        // Make sure we have option_ids
        option_ids: data.options?.map((opt: any) => opt.id || opt) || [],
        options: [],
        image: null,
        // Save the slug
        slug: data.slug || ''
      };
      
      setFormData(carData);
      
      // If we have a model, fetch the variants
      if (carData.model_id) {
        fetchVariants(carData.model_id.toString());
      }

      // Mark that we've completed the initial fetch
      initialFetchDone.current = true;
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error fetching car details');
    } finally {
      setIsLoading(false);
    }
  }, [id, token, fetchVariants, currentDay, currentMonth, currentYear]);

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

  // Improved form submission with better error handling
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
      
      // Step 2: Upload any temporary images
      if (tempImages.length > 0 && carSlug) {
        console.log(`Uploading ${tempImages.length} temporary images for car slug: ${carSlug}`);
        
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
            
            // Update formData with the complete updated car data
            setFormData({
              make_id: updatedCar.make,
              model_id: updatedCar.model,
              variant_id: updatedCar.variant,
              make: updatedCar.make?.toString() || '',
              model: updatedCar.model?.toString() || '',
              variant: updatedCar.variant?.toString() || '',
              exterior_color_id: updatedCar.exterior_color,
              exterior_color_name: updatedCar.exterior_color_name || '',
              exterior_color_hex: updatedCar.exterior_color_hex || '',
              interior_color_id: updatedCar.interior_color,
              interior_color_name: updatedCar.interior_color_name || '',
              interior_color_hex: updatedCar.interior_color_hex || '',
              upholstery_id: updatedCar.upholstery,
              upholstery_name: updatedCar.upholstery_name || '',
              first_registration_day: updatedCar.first_registration_day || currentDay,
              first_registration_month: updatedCar.first_registration_month || currentMonth,
              first_registration_year: updatedCar.first_registration_year || currentYear,
              discussedPrice: updatedCar.discussed_price || false,
              price: updatedCar.price || 0,
              description: updatedCar.description || '',
              image: null,
              created_at: updatedCar.created_at || new Date().toISOString().split('T')[0],
              body_type: updatedCar.body_type || 'Sedan',
              is_used: updatedCar.is_used !== undefined ? updatedCar.is_used : true,
              drivetrain: updatedCar.drivetrain || 'FWD',
              seats: updatedCar.seats || 5,
              doors: updatedCar.doors || 4,
              mileage: updatedCar.mileage || 0,
              general_inspection_date: updatedCar.general_inspection_date || '',
              full_service_history: updatedCar.full_service_history || false,
              customs_paid: updatedCar.customs_paid || false,
              power: updatedCar.power || 100,
              gearbox: updatedCar.gearbox || 'Manual',
              engine_size: updatedCar.engine_size || 1.6,
              gears: updatedCar.gears || 5,
              cylinders: updatedCar.cylinders || 4,
              weight: updatedCar.weight || 1200,
              emission_class: updatedCar.emission_class || 'Euro 6',
              fuel_type: updatedCar.fuel_type || 'Petrol',
              images: updatedCar.images || [],
              option_ids: updatedCar.options?.map((opt: any) => opt.id || opt) || [],
              options: [],
              slug: updatedCar.slug
            });
          }
        } catch (imageError) {
          console.error("Error uploading images:", imageError);
          // Allow the submission to succeed even if image upload fails
        }
      }
      
      // Clear any temporary images
      clearTempImages();
      
      return true; // Return success
    } catch (error) {
      console.error('Full error details:', error);
      setError(error instanceof Error ? error.message : 'Error submitting form');
      return false; // Return failure
    } finally {
      setIsLoading(false);
    }
  }, [formData, id, prepareFormDataForSubmission, tempImages, token, uploadTempImages, clearTempImages, currentDay, currentMonth, currentYear]);

  // Initialize with data fetching
  useEffect(() => {
    fetchMakes();
    fetchUpholsteryTypes();
    
    if (id && !initialFetchDone.current) {
      fetchCarDetails();
    }
    
    // Cleanup function to revoke object URLs
    return () => {
      tempImages.forEach(image => {
        if (image.preview) {
          URL.revokeObjectURL(image.preview);
        }
      });
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
    handleImageUpload, 
    handleImageDelete, 
    handleSubmit,
    fetchVariants,
    fetchModels,
    fetchUpholsteryTypes,
    nextTempId,
    setTempImages,
    setNextTempId,
    // Additional image-related properties
    isUploading,
    uploadError,
    // Export the clearTempImages function
    clearTempImagesStorage: clearTempImages,
    // Aspect ratio related
    detectedAspectRatio,
    formatAspectRatio,
    // All images (server + temporary)
    getAllImages: useCallback(() => {
      return [...formData.images, ...tempImages];
    }, [formData.images, tempImages])
  };
};