// Modified ImageGallery.tsx with removal of crop functionality
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
  detectedAspectRatio?: string | null;
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
    
    // For server images with temp previews (from local editing)
    if ('tempPreview' in image && image.tempPreview) {
      return image.tempPreview;
    }
    
    // For Cloudinary-stored images
    if ('url' in image && image.url) {
      if (image.url.includes('cloudinary.com')) {
        return getCloudinaryUrl(image.url, 800, 600, 'auto');
      }
      return image.url;
    }
    
    // Handle images with direct paths
    if ('image' in image && image.image) {
      if (typeof image.image === 'string') {
        if (image.image.includes('cloudinary.com')) {
          return getCloudinaryUrl(image.image, 800, 600, 'auto');
        }
        
        if (image.image.startsWith('http://') || image.image.startsWith('https://')) {
          return image.image;
        }
        
        return `${baseUrl}${image.image.startsWith('/') ? '' : '/'}${image.image}`;
      }
    }
    
    return fallbackImageUrl;
  };
  
  // Calculate image style based on detected aspect ratio
  const getImageStyle = () => {
    if (!detectedAspectRatio) {
      return {
        width: '100%',
        height: '100%',
        objectFit: 'cover' as const
      };
    }
    
    const ratio = parseFloat(detectedAspectRatio);
    
    // Common aspect ratios
    if (ratio >= 1.7 && ratio <= 1.8) {
      // 16:9 ratio (1.77)
      return {
        width: '100%',
        height: '100%',
        objectFit: 'cover' as const
      };
    } else if (ratio >= 1.3 && ratio <= 1.4) {
      // 4:3 ratio (1.33)
      return {
        width: '100%',
        height: '100%',
        objectFit: 'cover' as const
      };
    } else if (ratio >= 0.9 && ratio <= 1.1) {
      // 1:1 ratio (square)
      return {
        width: '100%',
        height: '100%',
        objectFit: 'cover' as const
      };
    } else {
      // Custom ratio
      return {
        width: '100%',
        height: '100%',
        objectFit: 'cover' as const
      };
    }
  };
  
  return (
    <>
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
                style={getImageStyle()}
                onError={(e) => {
                  console.error(`Failed to load image: ${getImageUrl(image)}`);
                  e.currentTarget.src = fallbackImageUrl;
                }}
              />
            </div>
            
            {/* Delete button only */}
            {isEditing && (
              <div className="absolute top-2 right-2">
                <button
                  onClick={() => onDeleteImage(image.id)}
                  className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  type="button"
                  aria-label="Delete image"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
            )}
            
            {/* Display "preview" badge for temporary images */}
            {isTempImage(image) && (
              <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                Preview
              </div>
            )}
            
            {/* Display aspect ratio info if available */}
            {detectedAspectRatio && process.env.NODE_ENV === 'development' && (
              <div className="absolute bottom-2 right-2 bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-70">
                Ratio: {detectedAspectRatio}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default ImageGallery;