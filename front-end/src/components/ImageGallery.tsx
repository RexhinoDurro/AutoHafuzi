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
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;
  
  // Helper function to determine if an image is a temporary image
  const isTempImage = (image: CarImage | TempImage): image is TempImage => {
    return 'preview' in image;
  };

  // Helper function to get the optimized image URL
  const getImageUrl = (image: CarImage | TempImage, width = 800, height = 600): string => {
    if (isTempImage(image)) {
      return image.preview;
    }
    
    // Check if image.url is available from Cloudinary
    if ('url' in image && image.url && image.url.includes('cloudinary')) {
      // Add optimized transformations for Cloudinary
      const parts = image.url.split('/upload/');
      if (parts.length === 2) {
        return `${parts[0]}/upload/w_${width},h_${height},c_fill,q_auto,f_auto/${parts[1]}`;
      }
      return image.url;
    }
    
    // For direct HTTP URLs
    if (image.image && typeof image.image === 'string' && 
        (image.image.startsWith('http://') || image.image.startsWith('https://'))) {
      return image.image;
    }
    
    // Default case for relative URLs - prepend the baseUrl
    if (typeof image.image === 'string') {
      return `${baseUrl}${image.image.startsWith('/') ? '' : '/'}${image.image}`;
    }
    
    // Complete fallback
    return `${baseUrl}/api/placeholder/${width}/${height}`;
  };

  // Get thumbnail URL (smaller size for better performance)
  const getThumbnailUrl = (image: CarImage | TempImage): string => {
    return getImageUrl(image, 100, 100);
  };

  // Touch handlers for swipe functionality
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && images.length > 1) {
      // Navigate to next image
      setSelectedIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
    }
    
    if (isRightSwipe && images.length > 1) {
      // Navigate to previous image
      setSelectedIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
    }
    
    // Reset touch coordinates
    setTouchStart(null);
    setTouchEnd(null);
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
      {/* Main selected image with swipe functionality */}
      <div 
        className="w-full h-48 md:h-72 lg:h-96 relative overflow-hidden rounded-lg shadow"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <img 
          src={imageErrors[selectedIndex] ? fallbackImageUrl : getImageUrl(images[selectedIndex])}
          alt={`Car view ${selectedIndex + 1}`} 
          width="800"
          height="600"
          className="w-full h-full object-cover"
          onError={() => {
            console.error(`Failed to load image: ${getImageUrl(images[selectedIndex])}`);
            // Set this image as errored
            setImageErrors(prev => ({...prev, [selectedIndex]: true}));
          }}
        />
        
        {/* Navigation arrows - show on desktop or when not mobile */}
        {images.length > 1 && !isMobile && (
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
        
        {/* Swipe indicator for mobile */}
        {images.length > 1 && isMobile && (
          <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
            Swipe to navigate
          </div>
        )}
        
        {/* Image counter */}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs md:text-sm">
          {selectedIndex + 1} / {images.length}
        </div>
      </div>
      
      {/* Thumbnails */}
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
                src={imageErrors[index] ? thumbnailFallbackUrl : getThumbnailUrl(image)}
                alt={`Thumbnail ${index + 1}`} 
                width="100"
                height="100"
                loading="lazy" 
                className="w-full h-full object-cover"
                onError={() => {
                  // Set this thumbnail as errored
                  setImageErrors(prev => ({...prev, [index]: true}));
                }}
              />
            </div>
          ))}
        </div>
      )}
      
      {/* Mobile indicator */}
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