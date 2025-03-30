// Fixed useCarFormImageUpload.ts with TypeScript fixes
import { useState, useCallback, useEffect, useRef } from 'react';
import { getStoredAuth } from '../../utils/auth';
import { API_ENDPOINTS } from '../../config/api';
import { prepareImagesForUpload, getImageDimensions } from '../../utils/imageService';
import {
  saveTempImagesToStorage,
  loadTempImagesFromStorage,
  saveNextTempIdToStorage,
  loadNextTempIdFromStorage,
  clearTempImagesFromStorage,
  getFormSessionId
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

interface UseCarFormImageUploadResult {
  tempImages: TempImage[];
  nextTempId: number;
  isUploading: boolean;
  uploadError: string | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleImageDelete: (imageId: number) => Promise<boolean>;
  setTempImages: React.Dispatch<React.SetStateAction<TempImage[]>>;
  setNextTempId: React.Dispatch<React.SetStateAction<number>>;
  uploadTempImages: (carSlug: string) => Promise<UploadedImage[]>;
  clearTempImagesStorage: () => void;
  detectedAspectRatio: string | null;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGES = 10;
const ASPECT_RATIO_TOLERANCE = 0.1; // 10% tolerance for aspect ratio comparison

export const useCarFormImageUpload = (): UseCarFormImageUploadResult => {
  const { token } = getStoredAuth();
  const [tempImages, setTempImages] = useState<TempImage[]>([]);
  const [nextTempId, setNextTempId] = useState<number>(-1);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [detectedAspectRatio, setDetectedAspectRatio] = useState<string | null>(null);
  
  // Use a ref to track if image loading is in progress
  const isLoadingImages = useRef(false);
  
  // Get session ID for consistent storage
  const sessionId = useRef(getFormSessionId());

  // Initialize from localStorage on mount with retry logic
  useEffect(() => {
    const initFromStorage = async () => {
      if (isLoadingImages.current) return;
      isLoadingImages.current = true;
      
      try {
        console.log('Initializing image storage with session ID:', sessionId.current);
        
        // First, load the next temp ID
        const storedNextTempId = loadNextTempIdFromStorage();
        if (storedNextTempId < 0) {
          setNextTempId(storedNextTempId);
        }
        
        // Then load temp images with retry logic
        let attempts = 0;
        const maxAttempts = 3;
        let storedTempImages: TempImage[] = [];
        
        while (attempts < maxAttempts) {
          try {
            storedTempImages = await loadTempImagesFromStorage();
            if (storedTempImages.length > 0) {
              console.log(`Successfully loaded ${storedTempImages.length} images from localStorage`);
              break;
            }
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 300)); // Short delay before retry
          } catch (err) {
            console.error(`Attempt ${attempts + 1} failed:`, err);
            attempts++;
            if (attempts >= maxAttempts) throw err;
          }
        }
        
        if (storedTempImages.length > 0) {
          setTempImages(storedTempImages);
          
          // Calculate aspect ratio from the first loaded image
          if (storedTempImages[0] && storedTempImages[0].preview) {
            try {
              const dimensions = await getImageDimensions(storedTempImages[0].preview);
              const ratio = dimensions.width / dimensions.height;
              setDetectedAspectRatio(ratio.toFixed(2));
            } catch (error) {
              console.error('Failed to get dimensions of stored image:', error);
            }
          }
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing from storage:', error);
        setIsInitialized(true);
      } finally {
        isLoadingImages.current = false;
      }
    };
    
    initFromStorage();
    
    // Clean up function
    return () => {
      console.log('Cleaning up image previews');
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
    if (isInitialized && !isLoadingImages.current) {
      saveTempImagesToStorage(tempImages);
    }
  }, [tempImages, isInitialized]);

  // Check if a new image's aspect ratio matches the existing ones
  const isAspectRatioConsistent = async (imageFile: File, existingRatio: number | null): Promise<boolean> => {
    if (!existingRatio) return true; // First image, no ratio to compare with
    
    try {
      // Create a URL for the image file
      const imageUrl = URL.createObjectURL(imageFile);
      
      // Get dimensions
      const dimensions = await getImageDimensions(imageUrl);
      const newRatio = dimensions.width / dimensions.height;
      
      // Revoke the URL to prevent memory leaks
      URL.revokeObjectURL(imageUrl);
      
      // Compare with tolerance
      const ratioDeviation = Math.abs(newRatio - existingRatio) / existingRatio;
      return ratioDeviation <= ASPECT_RATIO_TOLERANCE;
    } catch (error) {
      console.error('Error checking aspect ratio:', error);
      return false;
    }
  };

  // Validate images before adding them to tempImages
  const validateImages = useCallback(async (files: FileList, currentImagesCount: number): Promise<string | null> => {
    if (files.length + currentImagesCount > MAX_IMAGES) {
      return `Maximum ${MAX_IMAGES} images allowed`;
    }
  
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > MAX_FILE_SIZE) {
        return 'Image size should not exceed 5MB';
      }
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return 'Only JPEG, PNG and WebP images are allowed';
      }
    }
    
    // If we already have images, check aspect ratio consistency
    if (currentImagesCount > 0 && detectedAspectRatio) {
      // Get the current aspect ratio as a number
      const currentRatio = parseFloat(detectedAspectRatio);
      
      // Check each new file for consistent aspect ratio
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isConsistent = await isAspectRatioConsistent(file, currentRatio);
        if (!isConsistent) {
          return 'All images must have the same aspect ratio';
        }
      }
    }
    
    return null;
  }, [detectedAspectRatio]);

  // Enhanced image upload with better error handling and aspect ratio validation
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      console.log('No files provided for upload');
      return;
    }
    
    const files = e.target.files;
    console.log(`Attempting to upload ${files.length} files`);
    
    // Validate images
    validateImages(files, tempImages.length)
      .then(async (validationError) => {
        if (validationError) {
          console.error('Image validation error:', validationError);
          setUploadError(validationError);
          return;
        }
        
        try {
          // Convert FileList to array
          const filesArray = Array.from(files);
          console.log(`Preparing ${filesArray.length} images for upload`);
          
          // Compress images
          const compressedFiles = await prepareImagesForUpload(filesArray, {
            maxWidth: 1920,
            maxHeight: 1080,
            quality: 0.85,
            format: 'auto'
          });
          
          let currentTempId = nextTempId;
          const newTempImages: TempImage[] = [];
          
          for (const file of compressedFiles) {
            const imageId = currentTempId;
            currentTempId -= 1;
            
            // Create object URL for preview
            const preview = URL.createObjectURL(file);
            console.log(`Created preview for image ${imageId}: ${preview.substring(0, 50)}...`);
            
            newTempImages.push({
              id: imageId,
              file,
              preview
            });
          }
          
          // Detect aspect ratio from the first image if we don't have one yet
          if (!detectedAspectRatio && newTempImages.length > 0) {
            try {
              const dimensions = await getImageDimensions(newTempImages[0].preview);
              const ratio = dimensions.width / dimensions.height;
              setDetectedAspectRatio(ratio.toFixed(2));
              console.log(`Detected aspect ratio: ${ratio.toFixed(2)}`);
            } catch (error) {
              console.error('Failed to get dimensions of new image:', error);
            }
          }
          
          // Update state with the new images
          setTempImages(prev => {
            const updatedImages = [...prev, ...newTempImages];
            console.log(`Updated temp images array: ${updatedImages.length} total images`);
            
            // Save to localStorage immediately
            saveTempImagesToStorage(updatedImages);
            return updatedImages;
          });
          
          setNextTempId(currentTempId);
          saveNextTempIdToStorage(currentTempId);
          
          console.log(`Added ${newTempImages.length} new temporary images, next ID: ${currentTempId}`);
        } catch (error) {
          console.error('Error handling image upload:', error);
          setUploadError('Error processing images. Please try again.');
        }
      });
  }, [nextTempId, tempImages.length, validateImages, detectedAspectRatio]);

  // Enhanced delete function with better error handling
  const handleImageDelete = useCallback(async (imageId: number): Promise<boolean> => {
    try {
      // If it's a temp image (negative ID), just remove it locally
      if (imageId < 0) {
        setTempImages(prev => {
          // Find the image to remove
          const imageToRemove = prev.find(img => img.id === imageId);
          
          // Revoke object URL for the removed image to prevent memory leaks
          if (imageToRemove?.preview) {
            URL.revokeObjectURL(imageToRemove.preview);
          }
          
          // Filter out the image
          const filteredImages = prev.filter(img => img.id !== imageId);
          
          // After filtering, update localStorage
          saveTempImagesToStorage(filteredImages);
          
          // If we removed all images, reset the aspect ratio
          if (filteredImages.length === 0) {
            setDetectedAspectRatio(null);
          }
          
          return filteredImages;
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

  // Upload temp images to server
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
      // Create FormData with all images
      const imageFormData = new FormData();
      tempImages.forEach(img => {
        imageFormData.append('images', img.file);
      });
      
      // Add session ID to help with debugging
      imageFormData.append('session_id', sessionId.current);
      
      console.log(`Starting upload of ${tempImages.length} images for car slug: ${carSlug}`);
      
      // Upload the images
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
      
      // Clear the localStorage cache, but delay it to ensure no conflicts
      setTimeout(() => {
        if (uploadedImages.length === tempImages.length) {
          // If all uploaded successfully, clear temporary images
          setTempImages([]);
          clearTempImagesFromStorage();
          console.log('Cleared temporary images after successful upload');
        } else {
          // If some failed, keep the ones that didn't upload
          console.log(`Not all images uploaded (${uploadedImages.length}/${tempImages.length}), keeping remaining in local storage`);
        }
      }, 1000);
      
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
    // Revoke object URLs first to prevent memory leaks
    tempImages.forEach(img => {
      if (img.preview) {
        URL.revokeObjectURL(img.preview);
      }
    });
    
    // Clear storage and state
    clearTempImagesFromStorage();
    setTempImages([]);
    setDetectedAspectRatio(null);
    console.log('Manually cleared temporary images storage');
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
    clearTempImagesStorage,
    detectedAspectRatio
  };
};