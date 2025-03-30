// Modified ImageGallery.tsx to support detected aspect ratio
import React from 'react';
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
  const fallbackImageUrl = `${baseUrl}/api/placeholder/800/600`;
  
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
    return fallbackImageUrl;
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
            <img 
              src={getImageUrl(image)}
              alt={isTempImage(image) ? "Preview" : "Car"} 
              className="rounded"
              style={getAspectRatioStyles()}
              onError={(e) => {
                console.error(`Failed to load image: ${getImageUrl(image)}`);
                e.currentTarget.src = fallbackImageUrl;
              }}
            />
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
    </div>
  );
};

export default ImageGallery;