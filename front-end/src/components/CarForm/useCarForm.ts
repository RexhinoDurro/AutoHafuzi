import { useState, useEffect, useCallback } from 'react';
import { FormData as CarFormData, Make, Model } from '../../types/car';
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
  const [error, setError] = useState<string>('');
  const [makes, setMakes] = useState<Make[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [newOption, setNewOption] = useState<string>('');
  const [tempImages, setTempImages] = useState<TempImage[]>([]);
  const [nextTempId, setNextTempId] = useState(-1);

  const [formData, setFormData] = useState<CarFormData>({
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
      setFormData({
        ...data,
        make: data.make_id.toString(),
        model: data.model_id.toString(),
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error fetching car details');
    } finally {
      setIsLoading(false);
    }
  }, [id, token]);

  const handleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const newTempImages = Array.from(e.target.files).map(file => ({
      id: nextTempId,
      file,
      preview: URL.createObjectURL(file)
    }));
    setTempImages(prev => [...prev, ...newTempImages]);
    setNextTempId(prevId => prevId - 1);
    e.target.value = '';
  };

  const handleImageDelete = async (imageId: number) => {
    if (imageId < 0) {
      setTempImages(prev => prev.filter(img => img.id !== imageId));
      return;
    }
    try {
      await fetch(API_ENDPOINTS.CARS.IMAGES.DELETE(imageId), {
        method: 'DELETE',
        headers: { Authorization: `Token ${token}` },
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error deleting image');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await fetch(id ? API_ENDPOINTS.CARS.UPDATE(id) : API_ENDPOINTS.CARS.ADD, {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Token ${token}` },
        body: JSON.stringify(formData),
      });
      if (id) await fetchCarDetails();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error submitting form');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMakes();
    if (id) fetchCarDetails();
    return () => tempImages.forEach(image => URL.revokeObjectURL(image.preview));
  }, [fetchMakes, fetchCarDetails, id, tempImages]);

  return { isLoading, isMakesLoading, isModelsLoading, error, makes, models, formData, setFormData, newOption, setNewOption, tempImages, handleImagesUpload, handleImageDelete, handleSubmit };
};
