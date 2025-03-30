// Improved ImageGallery.tsx with better error handling and logging
import React, { useState, useEffect } from 'react';
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
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const fallbackImageUrl = `${baseUrl}/api/placeholder/800/600`;

  // Log the received images on mount and when they change
  useEffect(() => {
    console.log(`ImageGallery received ${images.length} images:`, 
      images.map(img => ({
        id: img.id, 
        type: isTempImage(img) ? 'temp' : 'server',
        preview: isTempImage(img) ? img.preview.substring(0, 30) + '...' : undefined,
        url: !isTempImage(img) && 'url' in img && img.url ? img.url.substring(0, 30) + '...' : undefined
      }))
    );
  }, [images]);

  // Helper to determine if an image is a temporary image
  const isTempImage = (image: CarImage | TempImage): image is TempImage => {
    return 'preview' in image && !!image.preview && 'file' in image;
  };
  
  // Helper to get the correct image URL
  const getImageUrl = (image: CarImage | TempImage): string => {
    // First, handle temporary images
    if (isTempImage(image)) {
      console.log(`Using preview URL for temp image ${image.id}: ${image.preview.substring(0, 30)}...`);
      return image.preview;
    }
    
    // For server images with temp previews (from local editing)
    if ('tempPreview' in image && image.tempPreview) {
      console.log(`Using tempPreview for image ${image.id}`);
      return image.tempPreview;
    }
    
    // For Cloudinary-stored images
    if ('url' in image && image.url) {
      if (image.url.includes('cloudinary.com')) {
        const optimizedUrl = getCloudinaryUrl(image.url, 800, 600, 'auto');
        console.log(`Using Cloudinary URL for image ${image.id}: ${optimizedUrl.substring(0, 30)}...`);
        return optimizedUrl;
      }
      console.log(`Using direct URL for image ${image.id}: ${image.url.substring(0, 30)}...`);
      return image.url;
    }
    
    // Handle images with direct paths
    if ('image' in image && image.image) {
      if (typeof image.image === 'string') {
        if (image.image.includes('cloudinary.com')) {
          const optimizedUrl = getCloudinaryUrl(image.image, 800, 600, 'auto');
          console.log(`Using Cloudinary image path for image ${image.id}: ${optimizedUrl.substring(0, 30)}...`);
          return optimizedUrl;
        }
        
        if (image.image.startsWith('http://') || image.image.startsWith('https://')) {
          console.log(`Using direct image path for image ${image.id}: ${image.image.substring(0, 30)}...`);
          return image.image;
        }
        
        const fullUrl = `${baseUrl}${image.image.startsWith('/') ? '' : '/'}${image.image}`;
        console.log(`Using relative image path for image ${image.id}: ${fullUrl.substring(0, 30)}...`);
        return fullUrl;
      }
    }
    
    console.warn(`No valid image source found for image ${image.id}, using fallback`);
    return fallbackImageUrl;
  };
  
  // Reset image error when images change
  useEffect(() => {
    setImageErrors({});
  }, [images]);
  
  // Handle image load error
  const handleImageError = (imageId: number, url: string) => {
    console.error(`Failed to load image ${imageId} from URL: ${url}`);
    setImageErrors(prev => ({
      ...prev,
      [imageId]: true
    }));
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
  
  // Show empty state if no images
  if (images.length === 0) {
    return (
      <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg mt-4">
        <p className="text-gray-500">No images added yet</p>
      </div>
    );
  }
  
  return (
    <>
      <div className="grid grid-cols-3 gap-4 mt-4">
        {images.map((image) => {
          const imageUrl = getImageUrl(image);
          const hasError = imageErrors[image.id];
          
          return (
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
                {hasError ? (
                  <div className="flex flex-col items-center justify-center h-full w-full p-2">
                    <span className="text-red-500 text-sm">Failed to load image</span>
                    <button 
                      className="mt-2 text-blue-500 text-xs underline"
                      onClick={() => setImageErrors(prev => ({...prev, [image.id]: false}))}
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <img 
                    src={imageUrl}
                    alt={isTempImage(image) ? "Preview" : "Car"} 
                    className="rounded"
                    style={getImageStyle()}
                    onError={() => handleImageError(image.id, imageUrl)}
                  />
                )}
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
          );
        })}
      </div>
    </>
  );
};

export default ImageGallery;