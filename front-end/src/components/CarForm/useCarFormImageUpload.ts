// src/components/CarForm/useCarFormImageUpload.ts - Fixed version
import { useState, useCallback, useEffect, useRef } from 'react';
import { getStoredAuth } from '../../utils/auth';
import { API_ENDPOINTS } from '../../config/api';
import { prepareImagesForUpload, getImageDimensions } from '../../utils/imageService';

export interface TempImage {
  id: number;
  file: File;
  preview: string;
  aspectRatio?: number;
}

export interface UploadedImage {
  id: number;
  url: string;
  public_id?: string;
  is_primary?: boolean;
  order?: number;
}

export const useCarFormImageUpload = (carSlug?: string) => {
  const { token } = getStoredAuth();
  const [tempImages, setTempImages] = useState<TempImage[]>([]);
  const [nextTempId, setNextTempId] = useState<number>(-1);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [detectedAspectRatio, setDetectedAspectRatio] = useState<number | null>(null);
  
  // Use a ref to track if component is mounted
  const isMounted = useRef(true);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      // Mark component as unmounted
      isMounted.current = false;
      
      // Revoke object URLs to prevent memory leaks
      tempImages.forEach(img => {
        if (img.preview) {
          URL.revokeObjectURL(img.preview);
        }
      });
    };
  }, [tempImages]);

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

  // IMPROVED: Handle image upload with two paths - immediate upload or temporary storage
  const handleImageUpload = useCallback(async (files: FileList) => {
    setUploadError(null);
    
    const validationError = validateImages(files, tempImages.length);
    if (validationError) {
      setUploadError(validationError);
      return [];
    }
    
    setIsUploading(true);
    
    try {
      // IMMEDIATE UPLOAD PATH: If editing an existing car (we have carSlug)
      if (carSlug) {
        console.log(`Direct upload path for car slug: ${carSlug}`);
        
        // Create FormData with all selected files
        const imageFormData = new FormData();
        Array.from(files).forEach(file => {
          imageFormData.append('images', file);
        });
        
        // Upload directly to the server
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
        console.log('Upload response:', data);
        
        // Return the uploaded images info from server
        const uploadedImages = data.uploaded || [];
        
        // Try to detect aspect ratio if it's not already set
        if (!detectedAspectRatio && uploadedImages.length > 0 && uploadedImages[0].url) {
          try {
            const dimensions = await getImageDimensions(uploadedImages[0].url);
            if (isMounted.current) {
              setDetectedAspectRatio(dimensions.aspectRatio);
            }
          } catch (error) {
            console.error('Error detecting aspect ratio:', error);
          }
        }
        
        setIsUploading(false);
        return uploadedImages;
      }
      // TEMPORARY STORAGE PATH: If creating a new car (no carSlug yet)
      else {
        console.log('Temporary storage path - car not created yet');
        
        // Compress files for temporary storage
        const compressedFiles = await prepareImagesForUpload(Array.from(files), {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.85
        });
        
        let currentTempId = nextTempId;
        const newTempImages: TempImage[] = [];
        
        // Process each image for local preview
        for (const file of compressedFiles) {
          // Detect aspect ratio
          let imageAspectRatio;
          try {
            imageAspectRatio = await detectAspectRatio(file);
            
            // If this is the first image, set it as the reference aspect ratio
            if (tempImages.length === 0 && newTempImages.length === 0 && !detectedAspectRatio) {
              if (isMounted.current) {
                setDetectedAspectRatio(imageAspectRatio);
              }
            } else if (detectedAspectRatio && !hasCorrectAspectRatio(imageAspectRatio)) {
              // Skip images with incorrect aspect ratio
              console.warn(`Skipping image with aspect ratio ${imageAspectRatio}, expected around ${detectedAspectRatio}`);
              continue;
            }
          } catch (error) {
            console.error('Error detecting aspect ratio:', error);
            continue;
          }
          
          // Create object URL for preview
          const preview = URL.createObjectURL(file);
          
          newTempImages.push({
            id: currentTempId,
            file,
            preview,
            aspectRatio: imageAspectRatio
          });
          
          currentTempId -= 1;
        }
        
        // Update state with new images
        if (isMounted.current) {
          setTempImages(prev => [...prev, ...newTempImages]);
          setNextTempId(currentTempId);
        }
        
        setIsUploading(false);
        return newTempImages;
      }
    } catch (error) {
      console.error('Error handling image upload:', error);
      if (isMounted.current) {
        setUploadError(error instanceof Error ? error.message : 'Error processing images');
      }
      setIsUploading(false);
      return [];
    }
  }, [tempImages.length, nextTempId, validateImages, carSlug, token, detectAspectRatio, detectedAspectRatio, hasCorrectAspectRatio]);

  // IMPROVED: Delete image - handles both temporary and server images
  const handleImageDelete = useCallback(async (imageId: number): Promise<boolean> => {
    try {
      // TEMPORARY IMAGE: If it's a temp image (negative ID), just remove it locally
      if (imageId < 0) {
        setTempImages(prev => {
          const filtered = prev.filter(img => img.id !== imageId);
          
          // Revoke object URL for the removed image
          const removedImage = prev.find(img => img.id === imageId);
          if (removedImage?.preview) {
            URL.revokeObjectURL(removedImage.preview);
          }
          
          return filtered;
        });
        
        // If all images are removed, reset aspect ratio detection
        if (tempImages.length <= 1) {
          setDetectedAspectRatio(null);
        }
        
        return true;
      }
      // SERVER IMAGE: If it's a server-side image, delete via API
      else {
        if (!token) {
          setUploadError('Authentication token missing');
          return false;
        }
        
        console.log(`Deleting server image with ID: ${imageId}`);
        setIsUploading(true);

        const response = await fetch(API_ENDPOINTS.CARS.IMAGES.DELETE(imageId), {
          method: 'DELETE',
          headers: { Authorization: `Token ${token}` },
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to delete image: ${errorText}`);
        }
        
        setIsUploading(false);
        return true;
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to delete image');
      setIsUploading(false);
      return false;
    }
  }, [token, tempImages.length]);

  // Upload all temporary images to the server - used when form is submitted
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
      console.log(`Uploading ${tempImages.length} temporary images to car: ${carSlug}`);
      
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
      
      console.log(`Successfully uploaded ${uploadedImages.length} images`);
      
      // Clear temp images after successful upload
      tempImages.forEach(img => {
        if (img.preview) {
          URL.revokeObjectURL(img.preview);
        }
      });
      
      if (isMounted.current) {
        setTempImages([]);
      }
      
      setIsUploading(false);
      return uploadedImages;
    } catch (error) {
      console.error('Error uploading images:', error);
      setUploadError(
        error instanceof Error ? error.message : 'Failed to upload images'
      );
      setIsUploading(false);
      return [];
    }
  }, [tempImages, token]);

  // Clear all temporary images
  const clearTempImages = useCallback(() => {
    // Revoke all object URLs to prevent memory leaks
    tempImages.forEach(img => {
      if (img.preview) {
        URL.revokeObjectURL(img.preview);
      }
    });
    
    setTempImages([]);
    setDetectedAspectRatio(null);
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
    clearTempImages,
    detectedAspectRatio,
    formatAspectRatio
  };
};