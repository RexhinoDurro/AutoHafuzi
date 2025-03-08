import { useState, useEffect, useCallback } from 'react';
import { FormData as CarFormData, Make, Model, Variant } from '../../types/car';
import { getStoredAuth } from '../../utils/auth';
import { API_ENDPOINTS } from '../../config/api';

interface TempImage {
  id: number;
  file: File;
  preview: string;
}

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
  const [error, setError] = useState<string>('');
  const [makes, setMakes] = useState<Make[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [newOption, setNewOption] = useState<string>('');
  const [tempImages, setTempImages] = useState<TempImage[]>([]);
  const [nextTempId, setNextTempId] = useState(-1);

  const [formData, setFormData] = useState<CarFormData>({
    make_id: undefined,
    model_id: undefined,
    variant_id: undefined,
    make: '',
    model: '',
    variant: '',
    year: new Date().getFullYear(),
    exterior_color: '',
    exterior_color_id: undefined,
    exterior_color_name: '',
    exterior_color_hex: '',
    interior_color: '',
    interior_color_id: undefined,
    interior_color_name: '',
    interior_color_hex: '',
    interior_upholstery: '',
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

  const fetchMakes = useCallback(async () => {
    setIsMakesLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.MAKES, {
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
      const response = await fetch(API_ENDPOINTS.MODELS(makeId), {
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
      const response = await fetch(API_ENDPOINTS.VARIANTS(modelId), {
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
      
      // Save the current data
      const carData = {
        ...formData,
        ...data,
        make: data.make_id?.toString() || '',
        model: data.model_id?.toString() || '',
        variant: data.variant_id?.toString() || '',
        exterior_color_id: data.exterior_color_id,
        exterior_color_name: data.exterior_color_name,
        exterior_color_hex: data.exterior_color_hex,
        interior_color_id: data.interior_color_id,
        interior_color_name: data.interior_color_name,
        interior_color_hex: data.interior_color_hex,
        interior_upholstery: data.interior_upholstery,
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
  }, [id, token, fetchVariants]);

  const handleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    let currentTempId = nextTempId;
    const newTempImages = Array.from(e.target.files).map(file => {
      const imageId = currentTempId;
      currentTempId -= 1;
      return {
        id: imageId,
        file,
        preview: URL.createObjectURL(file)
      };
    });
    
    setTempImages(prev => [...prev, ...newTempImages]);
    setNextTempId(currentTempId);
    e.target.value = '';
  };

  const handleImageDelete = async (imageId: number) => {
    if (imageId < 0) {
      setTempImages(prev => prev.filter(img => img.id !== imageId));
      return;
    }
    try {
      const response = await fetch(API_ENDPOINTS.CARS.IMAGES.DELETE(imageId), {
        method: 'DELETE',
        headers: { Authorization: `Token ${token}` },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete image: ${response.status}`);
      }
      
      // Update the formData to remove the deleted image
      setFormData(prevData => ({
        ...prevData,
        images: prevData.images.filter(img => img.id !== imageId)
      }));
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error deleting image');
    }
  };

  // FIXED: Better form data preparation for submission to handle make and model properly
const prepareFormDataForSubmission = (data: CarFormData) => {
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
  
  // Year
  formDataObj.append('year', parseNumericValue(data.year, new Date().getFullYear()).toString());
  
  // Color handling
  if (data.exterior_color_id) {
    formDataObj.append('exterior_color', data.exterior_color_id.toString());
  }
  
  if (data.interior_color_id) {
    formDataObj.append('interior_color', data.interior_color_id.toString());
  }
  
  // Price
  formDataObj.append('price', parseNumericValue(data.price, 0).toString());
  
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
  
  if (data.first_registration) {
    formDataObj.append('first_registration', data.first_registration);
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
  
  // Upholstery handling - optional
  if (data.interior_upholstery) {
    formDataObj.append('interior_upholstery', data.interior_upholstery);
  }
  
  // FIXED OPTIONS HANDLING - Try multiple approaches
  if (Array.isArray(data.option_ids) && data.option_ids.length > 0) {
    // For FormData/multipart submissions, DRF expects multiple fields with the same name
    // rather than a JSON array
    data.option_ids.forEach(optionId => {
      formDataObj.append('options', optionId.toString());
    });
    
    console.log('Sending options as multiple fields with same key:', data.option_ids);
  } else {
    // Don't send options field at all for no options
    console.log('No options to send');
  }
  
  // Debug log the key data being sent
  console.log('Form data being submitted:', {
    make: data.make_id,
    model: data.model_id,
    variant: data.variant_id,
    exterior_color: data.exterior_color_id,
    interior_color: data.interior_color_id,
    first_registration: data.first_registration,
    options: data.option_ids || []
  });
  
  return formDataObj;
};

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      // Step 1: Create or update car with properly formatted data
      const formDataObj = prepareFormDataForSubmission(formData);
      
      console.log('Submitting data to:', id ? API_ENDPOINTS.CARS.UPDATE(id) : API_ENDPOINTS.CARS.ADD);
      
      const response = await fetch(id ? API_ENDPOINTS.CARS.UPDATE(id) : API_ENDPOINTS.CARS.ADD, {
        method: id ? 'PUT' : 'POST',
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
      const carId = id || carData.id;
      
      // Step 2: Upload any temporary images
      if (tempImages.length > 0 && carId) {
        console.log(`Uploading ${tempImages.length} images for car ID: ${carId}`);
        
        const imageFormData = new FormData();
        tempImages.forEach((img, index) => {
          console.log(`Appending image ${index + 1}:`, img.file.name, img.file.type, img.file.size);
          imageFormData.append('images', img.file);
        });
        
        const imageUploadUrl = API_ENDPOINTS.CARS.IMAGES.UPLOAD(carId);
        console.log('Image upload URL:', imageUploadUrl);
        
        const imageResponse = await fetch(imageUploadUrl, {
          method: 'POST',
          headers: { Authorization: `Token ${token}` },
          // Don't set Content-Type here, let the browser set it with the boundary
          body: imageFormData,
        });
        
        if (!imageResponse.ok) {
          let errorMessage = `Image upload failed with status: ${imageResponse.status}`;
          try {
            const imageErrorData = await imageResponse.json();
            console.error('Image upload error:', imageErrorData);
            errorMessage = `Failed to upload images: ${JSON.stringify(imageErrorData)}`;
          } catch (e) {
            console.error('Failed to parse error response:', e);
          }
          throw new Error(errorMessage);
        }
        
        // After successful upload, fetch the updated car data to get the new images
        const updatedCarResponse = await fetch(API_ENDPOINTS.CARS.GET(carId), {
          headers: { Authorization: `Token ${token}` },
        });
        
        if (updatedCarResponse.ok) {
          const updatedCar = await updatedCarResponse.json();
          setFormData({
            ...updatedCar,
            make: updatedCar.make_id.toString(),
            model: updatedCar.model_id.toString(),
            variant: updatedCar.variant_id?.toString() || '',
            exterior_color_id: updatedCar.exterior_color_id,
            exterior_color_name: updatedCar.exterior_color_name,
            exterior_color_hex: updatedCar.exterior_color_hex,
            interior_color_id: updatedCar.interior_color_id,
            interior_color_name: updatedCar.interior_color_name,
            interior_color_hex: updatedCar.interior_color_hex,
            interior_upholstery: updatedCar.interior_upholstery,
          });
        }
        
        // Clear temporary images after successful upload
        setTempImages([]);
      }
      
      return true; // Return success
    } catch (error) {
      console.error('Full error details:', error);
      setError(error instanceof Error ? error.message : 'Error submitting form');
      return false; // Return failure
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMakes();
    if (id) fetchCarDetails();
    // Cleanup function to revoke object URLs
    return () => {
      tempImages.forEach(image => URL.revokeObjectURL(image.preview));
    };
  }, [fetchMakes, fetchCarDetails, id]);

  return { 
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
    tempImages, 
    handleImagesUpload, 
    handleImageDelete, 
    handleSubmit,
    fetchVariants
  };
};
export default useCarForm;