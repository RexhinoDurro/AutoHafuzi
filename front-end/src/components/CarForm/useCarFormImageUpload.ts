// front-end/src/components/CarForm/useCarFormImageUpload.ts
import { useState, useCallback, useEffect } from 'react';
import { getStoredAuth } from '../../utils/auth';
import { API_ENDPOINTS } from '../../config/api';
import { prepareImagesForUpload } from '../../utils/imageService';
import {
  saveTempImagesToStorage,
  loadTempImagesFromStorage,
  saveNextTempIdToStorage,
  loadNextTempIdFromStorage,
  clearTempImagesFromStorage
} from './persistentImageStorage';

export interface TempImage {
  id: number;
  file: File;
  preview: string;
}

export interface UploadedImage {
  id: number;
  url: string;
  public_id?: string;
  is_primary?: boolean;
  order?: number;
}

// No props needed for this hook
interface UseCarFormImageUploadResult {
  tempImages: TempImage[];
  nextTempId: number;
  isUploading: boolean;
  uploadError: string | null;
  handleImageUpload: (files: FileList) => Promise<void>;
  handleImageDelete: (imageId: number) => Promise<boolean>;
  setTempImages: React.Dispatch<React.SetStateAction<TempImage[]>>;
  setNextTempId: React.Dispatch<React.SetStateAction<number>>;
  uploadTempImages: (carSlug: string) => Promise<UploadedImage[]>;
  clearTempImagesStorage: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGES = 10;

export const useCarFormImageUpload = (): UseCarFormImageUploadResult => {
  const { token } = getStoredAuth();
  const [tempImages, setTempImages] = useState<TempImage[]>([]);
  const [nextTempId, setNextTempId] = useState<number>(-1);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    const initFromStorage = async () => {
      try {
        // Load next temp ID from localStorage
        const storedNextTempId = loadNextTempIdFromStorage();
        if (storedNextTempId < 0) {
          setNextTempId(storedNextTempId);
        }
        
        // Load temp images from localStorage
        const storedTempImages = await loadTempImagesFromStorage();
        if (storedTempImages.length > 0) {
          setTempImages(storedTempImages);
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing from storage:', error);
        setIsInitialized(true);
      }
    };
    
    initFromStorage();
    
    // Clean up function
    return () => {
      // Revoke object URLs when component unmounts
      tempImages.forEach(img => {
        if (img.preview) {
          URL.revokeObjectURL(img.preview);
        }
      });
    };
  }, []);
  
  // Save temp images to localStorage when they change
  useEffect(() => {
    if (isInitialized && tempImages.length > 0) {
      saveTempImagesToStorage(tempImages);
    }
  }, [tempImages, isInitialized]);
  
  // Save next temp ID to localStorage when it changes
  useEffect(() => {
    if (isInitialized && nextTempId < 0) {
      saveNextTempIdToStorage(nextTempId);
    }
  }, [nextTempId, isInitialized]);

  // Validate images before adding them to tempImages
  const validateImages = useCallback((files: FileList, currentImagesCount: number): string | null => {
    if (files.length + currentImagesCount > MAX_IMAGES) {
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
  }, []);

  // Handle image upload with compression
  const handleImageUpload = useCallback(async (files: FileList) => {
    setUploadError(null);
    
    const validationError = validateImages(files, tempImages.length);
    if (validationError) {
      setUploadError(validationError);
      return;
    }
    
    try {
      // Convert FileList to array and compress images
      const filesArray = Array.from(files);
      const compressedFiles = await prepareImagesForUpload(filesArray, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.85,
        format: 'auto'
      });
      
      let currentTempId = nextTempId;
      const newTempImages = compressedFiles.map(file => {
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
      
      setTempImages(prev => [...prev, ...newTempImages]);
      setNextTempId(currentTempId);
    } catch (error) {
      console.error('Error handling image upload:', error);
      setUploadError('Error processing images. Please try again.');
    }
  }, [nextTempId, tempImages.length, validateImages]);

  // Delete temporary or server-side image
  const handleImageDelete = useCallback(async (imageId: number): Promise<boolean> => {
    try {
      // If it's a temp image (negative ID), just remove it locally
      if (imageId < 0) {
        setTempImages(prev => {
          const filtered = prev.filter(img => img.id !== imageId);
          
          // Revoke object URL for the removed image
          const removedImage = prev.find(img => img.id === imageId);
          if (removedImage?.preview) {
            URL.revokeObjectURL(removedImage.preview);
          }
          
          // After filtering, update localStorage
          if (filtered.length === 0) {
            clearTempImagesFromStorage();
          } else {
            saveTempImagesToStorage(filtered);
          }
          
          return filtered;
        });
        return true;
      }
      
      // Otherwise, it's a server-side image that needs to be deleted via API
      if (!token) {
        setUploadError('Authentication token missing');
        return false;
      }

      const response = await fetch(API_ENDPOINTS.CARS.IMAGES.DELETE(imageId), {
        method: 'DELETE',
        headers: { Authorization: `Token ${token}` },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete image: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      setUploadError('Failed to delete image');
      return false;
    }
  }, [token]);

  // Upload temporary images to the server
  const uploadTempImages = useCallback(async (carSlug: string): Promise<UploadedImage[]> => {
    if (!tempImages.length) {
      return [];
    }
    
    if (!token) {
      setUploadError('Authentication token missing');
      return [];
    }
    
    setIsUploading(true);
    setUploadError(null);
    
    try {
      const imageFormData = new FormData();
      tempImages.forEach(img => {
        imageFormData.append('images', img.file);
      });
      
      const response = await fetch(API_ENDPOINTS.CARS.IMAGES.UPLOAD(carSlug), {
        method: 'POST',
        headers: { Authorization: `Token ${token}` },
        body: imageFormData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to upload images: ${errorText}`);
      }
      
      const data = await response.json();
      const uploadedImages = data.uploaded || [];
      
      // Clear temp images after successful upload
      tempImages.forEach(img => {
        if (img.preview) {
          URL.revokeObjectURL(img.preview);
        }
      });
      setTempImages([]);
      
      // Clear the localStorage cache
      clearTempImagesFromStorage();
      
      return uploadedImages;
    } catch (error) {
      console.error('Error uploading images:', error);
      setUploadError(
        error instanceof Error ? error.message : 'Failed to upload images'
      );
      return [];
    } finally {
      setIsUploading(false);
    }
  }, [tempImages, token]);
  
  // Helper function to clear temp images from storage
  const clearTempImagesStorage = useCallback(() => {
    clearTempImagesFromStorage();
    tempImages.forEach(img => {
      if (img.preview) {
        URL.revokeObjectURL(img.preview);
      }
    });
    setTempImages([]);
  }, [tempImages]);

  return {
    tempImages,
    nextTempId,
    isUploading,
    uploadError,
    handleImageUpload,
    handleImageDelete,
    setTempImages,
    setNextTempId,
    uploadTempImages,
    clearTempImagesStorage
  };
};