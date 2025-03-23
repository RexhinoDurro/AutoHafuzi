// src/components/ImageCarousel.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { CarImage } from '../types/car';
import { API_BASE_URL } from '../config/api';
import ResponsiveImage from './ResponsiveImage';
import { getCloudinaryUrl } from '../utils/imageService';

interface TempImage {
  id: number;
  preview: string;
}

export interface CarImageCarouselProps {
  images: (CarImage | TempImage)[];
  baseUrl?: string;
  isMobile?: boolean;
  onImageChange?: (index: number) => void;
  initialIndex?: number;
}

const CarImageCarousel: React.FC<CarImageCarouselProps> = ({ 
  images, 
  baseUrl = API_BASE_URL,
  isMobile = false,
  onImageChange,
  initialIndex = 0
}) => {
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [imageErrors] = useState<Record<number, boolean>>({});
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Constants
  const MIN_SWIPE_DISTANCE = 50;
  const FALLBACK_IMAGE_URL = `${baseUrl}/api/placeholder/800/600`;
  const THUMBNAIL_FALLBACK_URL = `${baseUrl}/api/placeholder/100/100`;
  
  // Notify parent component of image changes
  useEffect(() => {
    if (onImageChange) {
      onImageChange(selectedIndex);
    }
  }, [selectedIndex, onImageChange]);

  // Helper function to determine if an image is a temporary image
  const isTempImage = (image: CarImage | TempImage): image is TempImage => {
    return 'preview' in image;
  };

  // Helper function to get the optimized image URL
  const getImageUrl = useCallback((image: CarImage | TempImage, width = 800, height = 600): string => {
    if (isTempImage(image)) {
      return image.preview;
    }
    
    // Check if image.url is available from Cloudinary
    if ('url' in image && image.url && image.url.includes('cloudinary')) {
      return getCloudinaryUrl(image.url, width, height, 'auto');
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
    return FALLBACK_IMAGE_URL;
  }, [baseUrl]);

  // Get thumbnail URL (smaller size for better performance)
  const getThumbnailUrl = useCallback((image: CarImage | TempImage): string => {
    return getImageUrl(image, 100, 100);
  }, [getImageUrl]);

  // Navigation functions
  const goToNextImage = useCallback(() => {
    if (isTransitioning || images.length <= 1) return;
    
    setIsTransitioning(true);
    setSelectedIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
    
    // Reset transition state after animation completes
    setTimeout(() => setIsTransitioning(false), 300);
  }, [images.length, isTransitioning]);

  const goToPrevImage = useCallback(() => {
    if (isTransitioning || images.length <= 1) return;
    
    setIsTransitioning(true);
    setSelectedIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
    
    // Reset transition state after animation completes
    setTimeout(() => setIsTransitioning(false), 300);
  }, [images.length, isTransitioning]);

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
    const isLeftSwipe = distance > MIN_SWIPE_DISTANCE;
    const isRightSwipe = distance < -MIN_SWIPE_DISTANCE;
    
    if (isLeftSwipe) {
      goToNextImage();
    }
    
    if (isRightSwipe) {
      goToPrevImage();
    }
    
    // Reset touch coordinates
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevImage();
      } else if (e.key === 'ArrowRight') {
        goToNextImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [goToNextImage, goToPrevImage]);

  // Auto-advance functionality (can be toggled)
  const [autoPlay, setAutoPlay] = useState(false);
  
  useEffect(() => {
    let interval: number | undefined;
    
    if (autoPlay && images.length > 1) {
      interval = window.setInterval(goToNextImage, 5000);
    }
    
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [autoPlay, goToNextImage, images.length]);

  // Handle click on thumbnail
  const handleThumbnailClick = (index: number) => {
    if (index !== selectedIndex && !isTransitioning) {
      setIsTransitioning(true);
      setSelectedIndex(index);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  // Handle image error (for use with ResponsiveImage component)

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-48 md:h-72 bg-gray-200 flex items-center justify-center rounded">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  // Determine if we should show thumbnails based on screen size or explicit prop
  const shouldShowThumbnails = !isMobile && images.length > 1;

  return (
    <div className="w-full space-y-2">
      {/* Main selected image with swipe functionality */}
      <div 
        className="w-full h-48 md:h-72 lg:h-96 relative overflow-hidden rounded-lg shadow"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div 
          className={`absolute inset-0 transition-opacity duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
        >
          <ResponsiveImage 
            src={imageErrors[selectedIndex] ? FALLBACK_IMAGE_URL : getImageUrl(images[selectedIndex])}
            alt={`Car view ${selectedIndex + 1}`}
            width={800}
            height={600}
            className="w-full h-full object-cover"
            onLoad={() => {/* Optional loading callback */}}
            objectFit="cover"
            placeholder={FALLBACK_IMAGE_URL}
          />
        </div>
        
        {/* Navigation arrows - show on desktop or when not mobile */}
        {images.length > 1 && !isMobile && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevImage();
              }}
              className="absolute left-1 md:left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 md:p-3 rounded-full hover:bg-opacity-70 text-sm md:text-base z-10 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Previous image"
            >
              &#10094;
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNextImage();
              }}
              className="absolute right-1 md:right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 md:p-3 rounded-full hover:bg-opacity-70 text-sm md:text-base z-10 focus:outline-none focus:ring-2 focus:ring-white"
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
        
        {/* Optional autoplay toggle button */}
        <button
          onClick={() => setAutoPlay(!autoPlay)}
          className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs flex items-center"
          aria-label={autoPlay ? "Pause slideshow" : "Play slideshow"}
        >
          {autoPlay ? "■ Pause" : "▶ Play"}
        </button>
      </div>
      
      {/* Thumbnails */}
      {shouldShowThumbnails && (
        <div className="hidden md:flex space-x-2 overflow-x-auto py-2">
          {images.map((image, index) => (
            <div 
              key={image.id}
              className={`
                cursor-pointer flex-shrink-0 h-16 w-16 rounded overflow-hidden border-2 transition-all
                ${index === selectedIndex ? 'border-blue-500 scale-110' : 'border-transparent hover:border-gray-300'}
              `}
              onClick={() => handleThumbnailClick(index)}
            >
              <ResponsiveImage 
                src={imageErrors[index] ? THUMBNAIL_FALLBACK_URL : getThumbnailUrl(image)}
                alt={`Thumbnail ${index + 1}`}
                width={100}
                height={100}
                lazy={true}
                className="w-full h-full object-cover"
                objectFit="cover"
                onLoad={() => {/* Optional loading callback */}}
              />
            </div>
          ))}
        </div>
      )}
      
      {/* Mobile indicator dots */}
      {images.length > 1 && isMobile && (
        <div className="flex justify-center mt-2 md:hidden">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={`h-2 w-2 mx-1 rounded-full transition-colors ${
                index === selectedIndex ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              aria-label={`Go to image ${index + 1}`}
              aria-current={index === selectedIndex ? 'true' : 'false'}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CarImageCarousel;