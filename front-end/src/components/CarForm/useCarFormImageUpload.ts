// front-end/src/components/CarForm/useCarFormImageUpload.ts - Enhanced version
import { useState, useCallback, useEffect, useRef } from 'react';
import { getStoredAuth } from '../../utils/auth';
import { API_ENDPOINTS } from '../../config/api';
import { prepareImagesForUpload } from '../../utils/imageService';
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
  handleImageUpload: (files: FileList) => Promise<void>;
  handleImageDelete: (imageId: number) => Promise<boolean>;
  handleImageUpdate: (imageId: number, newImageBlob: Blob) => Promise<void>;
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
  

// Save temp images to localStorage when they change - improve to always save
useEffect(() => {
  if (isInitialized) {
    // Always save when tempImages changes regardless of loading state
    saveTempImagesToStorage(tempImages);
    console.log(`Saved ${tempImages.length} temporary images to localStorage`);
  }
}, [tempImages, isInitialized]);



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

  // Enhanced image upload with better error handling
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
      const newTempImages: TempImage[] = [];
      
      for (const file of compressedFiles) {
        const imageId = currentTempId;
        currentTempId -= 1;
        
        // Create object URL for preview
        const preview = URL.createObjectURL(file);
        
        newTempImages.push({
          id: imageId,
          file,
          preview
        });
      }
      
      // Update state with the new images
      setTempImages(prev => {
        const updatedImages = [...prev, ...newTempImages];
        // Save to localStorage immediately
        saveTempImagesToStorage(updatedImages);
        return updatedImages;
      });
      
      setNextTempId(currentTempId);
      saveNextTempIdToStorage(currentTempId);
      
      console.log(`Added ${newTempImages.length} new temporary images`);
    } catch (error) {
      console.error('Error handling image upload:', error);
      setUploadError('Error processing images. Please try again.');
    }
  }, [nextTempId, tempImages.length, validateImages]);

  // Update an existing temporary image
  const handleImageUpdate = useCallback(async (imageId: number, newImageBlob: Blob) => {
    setUploadError(null);
    
    try {
      console.log(`Updating image with ID: ${imageId}`);
      
      // Create an isolated copy of the blob to prevent reference sharing
      const blobCopy = new Blob([await newImageBlob.arrayBuffer()], { 
        type: newImageBlob.type 
      });
      
      // Check if the image is a temporary one or server one
      if (imageId < 0) {
        // It's a temporary image, update it locally
        // Create a unique filename with timestamp and ID to prevent conflicts
        const uniqueFilename = `cropped-image-${Date.now()}-${imageId}.jpg`;
        
        const file = new File([blobCopy], uniqueFilename, {
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        
        // Create a new unique preview URL for this file only
        const preview = URL.createObjectURL(file);
        
        console.log(`Created new preview URL for image ${imageId}`);
        
        // Update the temp images array - carefully to only modify the target image
        setTempImages(prev => {
          // Create a map of existing IDs to detect and prevent duplicate updates
          const idMap = new Map(prev.map(img => [img.id, true]));
          
          // Make sure the image exists
          if (!idMap.has(imageId)) {
            console.warn(`Attempted to update non-existent image ID: ${imageId}`);
            return prev;
          }
          
          const updatedImages = prev.map(img => {
            if (img.id === imageId) {
              // Revoke the old preview URL to prevent memory leaks
              if (img.preview) {
                URL.revokeObjectURL(img.preview);
                console.log(`Revoked old preview URL for ${imageId}`);
              }
              
              // Return a completely new object with the updated file and preview
              return { 
                id: img.id, // Keep the same ID
                file, // New file
                preview // New preview URL
              };
            }
            
            // Return all other images completely unchanged
            return img;
          });
          
          // Save the updated array to localStorage
          saveTempImagesToStorage(updatedImages);
          console.log(`Saved updated image ${imageId} to localStorage`);
          
          return updatedImages;
        });
      } else {
        // It's a server-side image, we need to upload the cropped version
        if (!token) {
          throw new Error('Authentication token missing');
        }
        
        console.log(`Updating server image with ID: ${imageId}`);
        
        const formData = new FormData();
        formData.append('image', blobCopy, `cropped-server-${imageId}-${Date.now()}.jpg`);
        
        // Use a generic endpoint that updates any image by its ID
        const response = await fetch(API_ENDPOINTS.CARS.IMAGES.UPDATE(imageId), {
          method: 'PUT', // Use PUT to update
          headers: { Authorization: `Token ${token}` },
          body: formData
        });
        
        if (!response.ok) {
          throw new Error(`Failed to update image: ${response.status}`);
        }
        
        console.log('Server image updated successfully');
      }
    } catch (error) {
      console.error('Error updating image:', error);
      setUploadError(error instanceof Error ? error.message : 'Error updating image');
      throw error; // Re-throw to allow the caller to handle it
    }
  }, [token, setTempImages]);

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

  // Enhanced upload function with progress tracking
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
    console.log('Manually cleared temporary images storage');
  }, [tempImages]);

  return {
    tempImages,
    nextTempId,
    isUploading,
    uploadError,
    handleImageUpload,
    handleImageDelete,
    handleImageUpdate,
    setTempImages,
    setNextTempId,
    uploadTempImages,
    clearTempImagesStorage
  };
};