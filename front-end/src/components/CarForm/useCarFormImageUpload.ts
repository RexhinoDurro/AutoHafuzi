// src/components/CarForm/useCarFormImageUpload.ts - Enhanced with aspect ratio detection
import { useState, useCallback, useEffect } from 'react';
import { getStoredAuth } from '../../utils/auth';
import { API_ENDPOINTS } from '../../config/api';
import { prepareImagesForUpload, getImageDimensions } from '../../utils/imageService';
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
  aspectRatio?: number; // Add aspect ratio property
}

export interface UploadedImage {
  id: number;
  url: string;
  public_id?: string;
  is_primary?: boolean;
  order?: number;
}

export const useCarFormImageUpload = () => {
  const { token } = getStoredAuth();
  const [tempImages, setTempImages] = useState<TempImage[]>([]);
  const [nextTempId, setNextTempId] = useState<number>(-1);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [detectedAspectRatio, setDetectedAspectRatio] = useState<number | null>(null);

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
          // If there are images already, extract the aspect ratio from the first one
          if (storedTempImages[0]?.preview) {
            try {
              const dimensions = await getImageDimensions(storedTempImages[0].preview);
              setDetectedAspectRatio(dimensions.aspectRatio);
            } catch (error) {
              console.error('Error detecting aspect ratio from stored image:', error);
            }
          }
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

  // Detect aspect ratio from an image file
  const detectAspectRatio = useCallback(async (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (!e.target?.result) {
          reject(new Error('Failed to read image file'));
          return;
        }
        
        const img = new Image();
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          resolve(aspectRatio);
        };
        img.onerror = () => {
          reject(new Error('Failed to load image for aspect ratio detection'));
        };
        img.src = e.target.result as string;
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    });
  }, []);

  // Check if an image has the correct aspect ratio
  const hasCorrectAspectRatio = useCallback((imageAspectRatio: number): boolean => {
    if (!detectedAspectRatio) return true; // No enforcement yet
    
    // Allow for some tolerance in the aspect ratio comparison (e.g., 5%)
    const tolerance = 0.05;
    return Math.abs(imageAspectRatio - detectedAspectRatio) <= tolerance * detectedAspectRatio;
  }, [detectedAspectRatio]);

  // Format the aspect ratio to a string like "16:9" or "4:3"
  const formatAspectRatio = useCallback((ratio: number | null): string => {
    if (!ratio) return 'Unknown';
    
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
      return Math.abs(curr.ratio - ratio) < Math.abs(prev.ratio - ratio) ? curr : prev;
    });
    
    // If it's close to a common ratio (within 5%), use that name
    if (Math.abs(closest.ratio - ratio) <= 0.05 * ratio) {
      return closest.text;
    }
    
    // Otherwise, format as decimal with 2 digits of precision
    return `${ratio.toFixed(2)}:1`;
  }, []);

  // Validate images before adding them to tempImages
  const validateImages = useCallback((files: FileList, currentImagesCount: number): string | null => {
    if (files.length + currentImagesCount > 10) {
      return `Maximum 10 images allowed`;
    }
  
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        return 'Image size should not exceed 5MB';
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
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
      return [];
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
      const newTempImages: TempImage[] = [];
      
      // Process each image
      for (const file of compressedFiles) {
        // Detect aspect ratio
        let imageAspectRatio;
        try {
          imageAspectRatio = await detectAspectRatio(file);
          
          // If this is the first image overall, set it as the reference aspect ratio
          if (tempImages.length === 0 && newTempImages.length === 0 && !detectedAspectRatio) {
            setDetectedAspectRatio(imageAspectRatio);
          } else if (detectedAspectRatio && !hasCorrectAspectRatio(imageAspectRatio)) {
            // Skip images with incorrect aspect ratio
            console.warn(`Skipping image with aspect ratio ${imageAspectRatio}, expected around ${detectedAspectRatio}`);
            continue;
          }
        } catch (error) {
          console.error('Error detecting aspect ratio:', error);
          // Skip if we can't detect the aspect ratio
          continue;
        }
        
        const imageId = currentTempId;
        currentTempId -= 1;
        
        // Create object URL for preview
        const preview = URL.createObjectURL(file);
        
        newTempImages.push({
          id: imageId,
          file,
          preview,
          aspectRatio: imageAspectRatio
        });
      }
      
      // IMPORTANT: Append new images to existing ones, don't replace
      setTempImages(prev => [...prev, ...newTempImages]);
      setNextTempId(currentTempId);
      
      return newTempImages;
    } catch (error) {
      console.error('Error handling image upload:', error);
      setUploadError('Error processing images. Please try again.');
      return [];
    }
  }, [nextTempId, tempImages.length, validateImages, detectAspectRatio, detectedAspectRatio, hasCorrectAspectRatio]);

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
            // Reset detected aspect ratio if all images are removed
            setDetectedAspectRatio(null);
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
    clearTempImagesStorage: () => {
      clearTempImagesFromStorage();
      tempImages.forEach(img => {
        if (img.preview) {
          URL.revokeObjectURL(img.preview);
        }
      });
      setTempImages([]);
      setDetectedAspectRatio(null);
    },
    detectedAspectRatio,
    formatAspectRatio
  };
};