// src/components/CarForm/ImageGallery.tsx - Fixed version with better error handling
import React, { useState } from 'react';
import { CarImage } from '../../types/car';
import { API_BASE_URL } from '../../config/api';
import { getCloudinaryUrl } from '../../utils/imageService';
import { TempImage } from './useCarFormImageUpload';

interface ImageGalleryProps {
  images: (CarImage | TempImage)[];
  onDeleteImage: (id: number) => void;
  isEditing: boolean;
  baseUrl?: string;
  detectedAspectRatio?: number | null;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ 
  images, 
  onDeleteImage, 
  isEditing, 
  baseUrl = API_BASE_URL,
  detectedAspectRatio = null
}) => {
  const [loadErrors, setLoadErrors] = useState<Record<number, boolean>>({});
  const placeholderImageUrl = `${baseUrl}/api/placeholder/800/600`;
  
  // Helper to determine if an image is a temporary image
  const isTempImage = (image: CarImage | TempImage): image is TempImage => {
    return 'preview' in image;
  };
  
  // Helper to get the correct image URL
  const getImageUrl = (image: CarImage | TempImage): string => {
    // First, handle temporary images
    if (isTempImage(image)) {
      return image.preview;
    }
    
    // For Cloudinary-stored images - this is the primary way now
    if ('url' in image && image.url) {
      // Apply Cloudinary optimizations for better loading
      if (image.url.includes('cloudinary.com')) {
        return getCloudinaryUrl(image.url, 800, 600, 'auto');
      }
      return image.url;
    }
    
    // Handle images with direct paths
    if ('image' in image && image.image) {
      if (typeof image.image === 'string') {
        // Apply Cloudinary optimizations
        if (image.image.includes('cloudinary.com')) {
          return getCloudinaryUrl(image.image, 800, 600, 'auto');
        }
        
        // Handle direct URLs
        if (image.image.startsWith('http://') || image.image.startsWith('https://')) {
          return image.image;
        }
        
        // Handle relative paths
        return `${baseUrl}${image.image.startsWith('/') ? '' : '/'}${image.image}`;
      }
    }
    
    // Last resort fallback - rarely needed with Cloudinary
    return placeholderImageUrl;
  };
  
  // Handle image loading error
  const handleImageError = (imageId: number) => {
    console.error(`Failed to load image with ID: ${imageId}`);
    setLoadErrors(prev => ({
      ...prev,
      [imageId]: true
    }));
  };
  
  // Calculate the aspect ratio styles based on detectedAspectRatio
  const getAspectRatioStyles = () => {
    if (!detectedAspectRatio) {
      return {
        objectFit: 'cover' as const,
        height: '100%',
        width: '100%'
      };
    }
    
    // For specific aspect ratios
    if (detectedAspectRatio >= 1.7) {
      // Widescreen images (16:9, etc.)
      return {
        objectFit: 'contain' as const,
        width: '100%',
        height: 'auto',
        maxHeight: '100%'
      };
    } else if (detectedAspectRatio <= 0.65) {
      // Portrait/vertical images (9:16, etc.)
      return {
        objectFit: 'contain' as const,
        height: '100%',
        width: 'auto',
        maxWidth: '100%'
      };
    } else {
      // Standard images (4:3, 1:1, etc.)
      return {
        objectFit: 'contain' as const,
        height: '100%',
        width: '100%'
      };
    }
  };
  
  return (
    <div className="grid grid-cols-3 gap-4 mt-4">
      {images.map((image) => (
        <div key={image.id} className="relative">
          <div 
            className="w-full h-48 overflow-hidden rounded" 
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#f1f1f1'
            }}
          >
            {loadErrors[image.id] ? (
              // Fallback for failed images
              <div className="flex flex-col items-center justify-center text-gray-500 p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 18h16" />
                </svg>
                <p className="text-xs text-center">Image could not be loaded</p>
              </div>
            ) : (
              <img 
                src={getImageUrl(image)}
                alt={isTempImage(image) ? "Preview" : "Car"} 
                className="rounded"
                style={getAspectRatioStyles()}
                onError={() => handleImageError(image.id)}
              />
            )}
          </div>
          {isEditing && (
            <button
              onClick={() => onDeleteImage(image.id)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
              type="button"
              aria-label="Delete image"
            >
              ×
            </button>
          )}
          {/* Display "preview" badge for temporary images */}
          {isTempImage(image) && (
            <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
              Preview
            </div>
          )}
        </div>
      ))}
      {images.length === 0 && (
        <div className="col-span-3 p-6 text-center text-gray-500 border border-dashed border-gray-300 rounded">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 18h16" />
          </svg>
          <p>No images uploaded yet</p>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;