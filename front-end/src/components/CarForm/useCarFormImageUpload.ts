// src/components/CarForm/useCarFormImageUpload.ts - FIXED VERSION
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

  // FIXED: Handle image upload with proper error handling and validation
  const handleImageUpload = useCallback(async (files: FileList) => {
    setUploadError(null);
    
    if (!files || files.length === 0) {
      setUploadError('No files selected');
      return [];
    }
    
    const validationError = validateImages(files, tempImages.length);
    if (validationError) {
      setUploadError(validationError);
      return [];
    }
    
    setIsUploading(true);
    
    try {
      console.log(`Processing ${files.length} files for upload. Car slug: ${carSlug || 'none'}`);
      
      // IMMEDIATE UPLOAD PATH: If editing an existing car (we have carSlug)
      if (carSlug) {
        console.log(`Direct upload path for car slug: ${carSlug}`);
        
        if (!token) {
          throw new Error('Authentication token is missing');
        }
        
        // Create FormData with all selected files
        const imageFormData = new FormData();
        Array.from(files).forEach((file, index) => {
          console.log(`Adding file ${index}: ${file.name} (${file.size} bytes)`);
          imageFormData.append('images', file);
        });
        
        // Upload directly to the server
        console.log(`Uploading to: ${API_ENDPOINTS.CARS.IMAGES.UPLOAD(carSlug)}`);
        const response = await fetch(API_ENDPOINTS.CARS.IMAGES.UPLOAD(carSlug), {
          method: 'POST',
          headers: { 
            Authorization: `Token ${token}`,
            // Don't set Content-Type - let browser set it with boundary for FormData
          },
          body: imageFormData,
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Upload failed:', response.status, errorText);
          throw new Error(`Failed to upload images: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Upload response:', data);
        
        // Return the uploaded images info from server
        const uploadedImages = data.uploaded || [];
        console.log(`Successfully uploaded ${uploadedImages.length} images`);
        
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
        
        let currentTempId = nextTempId;
        const newTempImages: TempImage[] = [];
        
        // Process each image for local preview (no compression for temp storage)
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          console.log(`Processing temp image ${i}: ${file.name} (${file.size} bytes)`);
          
          // Detect aspect ratio
          let imageAspectRatio;
          try {
            imageAspectRatio = await detectAspectRatio(file);
            console.log(`Detected aspect ratio: ${imageAspectRatio}`);
            
            // If this is the first image, set it as the reference aspect ratio
            if (tempImages.length === 0 && newTempImages.length === 0 && !detectedAspectRatio) {
              if (isMounted.current) {
                setDetectedAspectRatio(imageAspectRatio);
                console.log(`Set reference aspect ratio: ${imageAspectRatio}`);
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
          console.log(`Created preview URL for temp image: ${preview}`);
          
          const tempImage: TempImage = {
            id: currentTempId,
            file,
            preview,
            aspectRatio: imageAspectRatio
          };
          
          newTempImages.push(tempImage);
          currentTempId -= 1;
        }
        
        console.log(`Created ${newTempImages.length} temporary images`);
        
        // Update state with new images
        if (isMounted.current) {
          setTempImages(prev => {
            const updated = [...prev, ...newTempImages];
            console.log(`Total temp images after update: ${updated.length}`);
            return updated;
          });
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

  // FIXED: Delete image - handles both temporary and server images
  const handleImageDelete = useCallback(async (imageId: number): Promise<boolean> => {
    console.log(`Attempting to delete image with ID: ${imageId}`);
    
    try {
      // TEMPORARY IMAGE: If it's a temp image (negative ID), just remove it locally
      if (imageId < 0) {
        console.log(`Deleting temporary image: ${imageId}`);
        
        setTempImages(prev => {
          const imageToDelete = prev.find(img => img.id === imageId);
          if (imageToDelete?.preview) {
            console.log(`Revoking object URL: ${imageToDelete.preview}`);
            URL.revokeObjectURL(imageToDelete.preview);
          }
          
          const filtered = prev.filter(img => img.id !== imageId);
          console.log(`Temp images after deletion: ${filtered.length}`);
          return filtered;
        });
        
        // If all images are removed, reset aspect ratio detection
        if (tempImages.length <= 1) {
          setDetectedAspectRatio(null);
          console.log('Reset aspect ratio detection - no images left');
        }
        
        return true;
      }
      // SERVER IMAGE: If it's a server-side image, delete via API
      else {
        console.log(`Deleting server image: ${imageId}`);
        
        if (!token) {
          setUploadError('Authentication token missing');
          return false;
        }
        
        setIsUploading(true);

        const deleteUrl = API_ENDPOINTS.CARS.IMAGES.DELETE(imageId);
        console.log(`Deleting from: ${deleteUrl}`);
        
        const response = await fetch(deleteUrl, {
          method: 'DELETE',
          headers: { Authorization: `Token ${token}` },
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Delete failed:', response.status, errorText);
          throw new Error(`Failed to delete image: ${response.status} - ${errorText}`);
        }
        
        console.log(`Successfully deleted server image: ${imageId}`);
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

  // FIXED: Upload all temporary images to the server - used when form is submitted
  const uploadTempImages = useCallback(async (carSlug: string): Promise<UploadedImage[]> => {
    console.log(`Starting upload of ${tempImages.length} temporary images to car: ${carSlug}`);
    
    if (!tempImages.length) {
      console.log('No temporary images to upload');
      return [];
    }
    
    if (!token) {
      setUploadError('Authentication token missing');
      return [];
    }
    
    setIsUploading(true);
    setUploadError(null);
    
    try {
      // Compress images before upload for better performance
      console.log('Compressing images before upload...');
      const compressedFiles = await prepareImagesForUpload(
        tempImages.map(img => img.file),
        {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.85
        }
      );
      
      console.log(`Compressed ${compressedFiles.length} images for upload`);
      
      const imageFormData = new FormData();
      compressedFiles.forEach((file, index) => {
        console.log(`Adding compressed file ${index}: ${file.name} (${file.size} bytes)`);
        imageFormData.append('images', file);
      });
      
      const uploadUrl = API_ENDPOINTS.CARS.IMAGES.UPLOAD(carSlug);
      console.log(`Uploading compressed images to: ${uploadUrl}`);
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 
          Authorization: `Token ${token}`,
          // Don't set Content-Type - let browser set it with boundary for FormData
        },
        body: imageFormData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed:', response.status, errorText);
        throw new Error(`Failed to upload images: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      const uploadedImages = data.uploaded || [];
      
      console.log(`Successfully uploaded ${uploadedImages.length} images`);
      
      // Clear temp images after successful upload
      tempImages.forEach(img => {
        if (img.preview) {
          console.log(`Revoking object URL after upload: ${img.preview}`);
          URL.revokeObjectURL(img.preview);
        }
      });
      
      if (isMounted.current) {
        setTempImages([]);
        console.log('Cleared temporary images after successful upload');
      }
      
      setIsUploading(false);
      return uploadedImages;
    } catch (error) {
      console.error('Error uploading temporary images:', error);
      setUploadError(
        error instanceof Error ? error.message : 'Failed to upload images'
      );
      setIsUploading(false);
      return [];
    }
  }, [tempImages, token]);

  // Clear all temporary images
  const clearTempImages = useCallback(() => {
    console.log(`Clearing ${tempImages.length} temporary images`);
    
    // Revoke all object URLs to prevent memory leaks
    tempImages.forEach(img => {
      if (img.preview) {
        console.log(`Revoking object URL: ${img.preview}`);
        URL.revokeObjectURL(img.preview);
      }
    });
    
    setTempImages([]);
    setDetectedAspectRatio(null);
    setUploadError(null);
    console.log('Cleared all temporary images and reset state');
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