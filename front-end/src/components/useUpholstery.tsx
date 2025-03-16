import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import { Upholstery } from '../types/car';

export const useUpholstery = () => {
  const [upholsteryTypes, setUpholsteryTypes] = useState<Upholstery[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUpholsteryTypes = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(API_ENDPOINTS.UPHOLSTERY);
      setUpholsteryTypes(response.data);
    } catch (err) {
      console.error('Error fetching upholstery types:', err);
      setError('Failed to load upholstery types');
    } finally {
      setIsLoading(false);
    }
  };

  const addUpholsteryType = async (name: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_ENDPOINTS.UPHOLSTERY}add/`, { name });
      setUpholsteryTypes([...upholsteryTypes, response.data]);
      return response.data;
    } catch (err) {
      console.error('Error adding upholstery type:', err);
      setError('Failed to add upholstery type');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUpholsteryType = async (id: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await axios.delete(`${API_ENDPOINTS.UPHOLSTERY}delete/${id}/`);
      setUpholsteryTypes(upholsteryTypes.filter(type => type.id !== id));
    } catch (err) {
      console.error('Error deleting upholstery type:', err);
      setError('Failed to delete upholstery type');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUpholsteryTypes();
  }, []);

  return {
    upholsteryTypes,
    isLoading,
    error,
    fetchUpholsteryTypes,
    addUpholsteryType,
    deleteUpholsteryType
  };
};

export default useUpholstery;