import React, { useState } from 'react';
import { CarImage } from '../types/car';
import { API_BASE_URL } from '../config/api';

interface TempImage {
  id: number;
  preview: string;
}

export interface CarImageCarouselProps {
  images: (CarImage | TempImage)[];
  baseUrl?: string;
  isMobile?: boolean;
}

const CarImageCarousel: React.FC<CarImageCarouselProps> = ({ 
  images, 
  baseUrl = API_BASE_URL,
  isMobile = false
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  
  // Helper function to determine if an image is a temporary image
  const isTempImage = (image: CarImage | TempImage): image is TempImage => {
    return 'preview' in image;
  };

  // Helper function to normalize image path
  const normalizeImagePath = (path: string): string => {
    if (!path) return `${baseUrl}/api/placeholder/800/600`;
    
    // If it's already a full URL, return it
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // Make sure baseUrl doesn't end with a slash and path starts with one
    const baseUrlFormatted = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const pathFormatted = path.startsWith('/') ? path : `/${path}`;
    
    return `${baseUrlFormatted}${pathFormatted}`;
  };

  // Helper function to get the correct image URL
  const getImageUrl = (image: CarImage | TempImage): string => {
    if (isTempImage(image)) {
      return image.preview;
    } else {
      // Check if image.url is available and use that first
      if ('url' in image && image.url) {
        return image.url;
      }
      return normalizeImagePath(image.image);
    }
  };

  // Get appropriate fallback image URLs
  const fallbackImageUrl = `${baseUrl}/api/placeholder/800/600`;
  const thumbnailFallbackUrl = `${baseUrl}/api/placeholder/100/100`;

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-48 md:h-72 bg-gray-200 flex items-center justify-center rounded">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  // Determine if we should show thumbnails based on screen size or explicit prop
  const shouldShowThumbnails = !isMobile;

  return (
    <div className="w-full">
      {/* Main selected image - adjusted height for better mobile experience */}
      <div className="w-full h-48 md:h-72 lg:h-96 relative overflow-hidden rounded-lg shadow">
        <img 
          src={imageErrors[selectedIndex] ? fallbackImageUrl : getImageUrl(images[selectedIndex])}
          alt={`Car view ${selectedIndex + 1}`} 
          className="w-full h-full object-cover"
          onError={() => {
            console.error(`Failed to load image: ${getImageUrl(images[selectedIndex])}`);
            // Set this image as errored
            setImageErrors(prev => ({...prev, [selectedIndex]: true}));
            // No need to manually set src, React will rerender with fallback
          }}
        />
        
        {/* Navigation arrows - improved touch targets for mobile */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
              }}
              className="absolute left-1 md:left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 md:p-3 rounded-full hover:bg-opacity-70 text-sm md:text-base z-10"
              aria-label="Previous image"
            >
              &#10094;
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
              }}
              className="absolute right-1 md:right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 md:p-3 rounded-full hover:bg-opacity-70 text-sm md:text-base z-10"
              aria-label="Next image"
            >
              &#10095;
            </button>
          </>
        )}
        
        {/* Image counter - made more visible */}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs md:text-sm">
          {selectedIndex + 1} / {images.length}
        </div>
      </div>
      
      {/* Thumbnails - Only show on larger screens or if explicitly not mobile */}
      {images.length > 1 && shouldShowThumbnails && (
        <div className="hidden md:flex space-x-2 overflow-x-auto py-2 mt-2">
          {images.map((image, index) => (
            <div 
              key={image.id}
              className={`
                cursor-pointer flex-shrink-0 h-16 w-16 rounded overflow-hidden border-2
                ${index === selectedIndex ? 'border-blue-500' : 'border-transparent'}
              `}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex(index);
              }}
            >
              <img 
                src={imageErrors[index] ? thumbnailFallbackUrl : getImageUrl(image)}
                alt={`Thumbnail ${index + 1}`} 
                className="w-full h-full object-cover"
                onError={() => {
                  // Set this thumbnail as errored
                  setImageErrors(prev => ({...prev, [index]: true}));
                  // No need to manually set src, React will rerender with fallback
                }}
              />
            </div>
          ))}
        </div>
      )}
      
      {/* Mobile-friendly dots indicator for small screens */}
      {images.length > 1 && isMobile && (
        <div className="flex justify-center mt-2 md:hidden">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`h-2 w-2 mx-1 rounded-full ${
                index === selectedIndex ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CarImageCarousel;