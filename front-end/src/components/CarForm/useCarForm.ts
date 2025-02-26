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
    make: '',
    model: '',
    variant: '',
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

  // FIXED: Assign unique IDs to each image
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

  // FIXED: Prepare form data for submission with proper type conversions
  const prepareFormDataForSubmission = (data: CarFormData) => {
    return {
      ...data,
      // Use parseNumericValue to handle conversions
      year: parseNumericValue(data.year, new Date().getFullYear()),
      price: parseNumericValue(data.price, 0),
      seats: parseNumericValue(data.seats, 5),
      doors: parseNumericValue(data.doors, 4),
      mileage: parseNumericValue(data.mileage, 0),
      power: parseNumericValue(data.power, 100),
      engine_size: parseNumericValue(data.engine_size, 1.6),
      gears: parseNumericValue(data.gears, 5),
      cylinders: parseNumericValue(data.cylinders, 4),
      weight: parseNumericValue(data.weight, 1200),
      options: Array.isArray(data.options) ? data.options : []
    };
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
        // Step 1: Create or update car with properly formatted data
        const preparedData = prepareFormDataForSubmission(formData);
        
        const response = await fetch(id ? API_ENDPOINTS.CARS.UPDATE(id) : API_ENDPOINTS.CARS.ADD, {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Token ${token}` },
            body: JSON.stringify(preparedData),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Server response:', errorData);
            throw new Error(errorData.error || `Failed to save car: ${response.status}`);
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