import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CarImage } from '../types/car';
import { API_BASE_URL } from '../config/api';
import ResponsiveImage from './ResponsiveImage';
import { getCloudinaryUrl } from '../utils/imageService';
import { TempImage } from './CarForm/useCarFormImageUpload';

export interface CarImageCarouselProps {
  images: (CarImage | TempImage)[];
  baseUrl?: string;
  isMobile?: boolean; // Kept for backward compatibility
  onImageChange?: (index: number) => void;
  initialIndex?: number;
  detectedAspectRatio?: number | null; // Changed from string to number
}

const CarImageCarousel: React.FC<CarImageCarouselProps> = ({ 
  images, 
  baseUrl = API_BASE_URL,
  isMobile = false, // We keep this for compatibility but don't use it directly
  onImageChange,
  initialIndex = 0,
  detectedAspectRatio = null
}) => {
  // We can use isMobile in a console.log to avoid the TS warning
  // or we could remove it from the props if not needed by any callers
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // This is just to use the variable to avoid the TS warning
      // It won't affect production code
      console.debug('Image gallery rendered in', isMobile ? 'mobile' : 'desktop', 'mode');
    }
  }, [isMobile]);
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [imageErrors] = useState<Record<number, boolean>>({});
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState<Set<number>>(new Set());
  
  // Refs for tracking and cleanup
  const preloadedImagesRef = useRef<HTMLImageElement[]>([]);
  
  // Constants
  const MIN_SWIPE_DISTANCE = 50;
  const FALLBACK_IMAGE_URL = `${baseUrl}/api/placeholder/800/600`;
  const THUMBNAIL_FALLBACK_URL = `${baseUrl}/api/placeholder/100/100`;
  const PRELOAD_COUNT = 5; // Number of images to preload ahead
  
  // Notify parent component of image changes
  useEffect(() => {
    if (onImageChange) {
      onImageChange(selectedIndex);
    }
  }, [selectedIndex, onImageChange]);

  // Helper to determine if an image is a temporary image
  const isTempImage = (image: CarImage | TempImage): image is TempImage => {
    return 'preview' in image;
  };

  // Helper to get the correct image URL
  const getImageUrl = useCallback((image: CarImage | TempImage, width = 800, height = 600): string => {
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
        return getCloudinaryUrl(image.url, width, height, 'auto');
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
    
    return FALLBACK_IMAGE_URL;
  }, [baseUrl]);

  // Get thumbnail URL (smaller size for better performance)
  const getThumbnailUrl = useCallback((image: CarImage | TempImage): string => {
    return getImageUrl(image, 100, 100);
  }, [getImageUrl]);

  // Calculate appropriate image styles based on detected aspect ratio
  const getImageStyles = useCallback((): React.CSSProperties => {
    if (!detectedAspectRatio) {
      return {
        width: '100%',
        height: '100%',
        objectFit: 'contain' as const
      };
    }
    
    // Now we can use detectedAspectRatio directly since it's a number
    const ratio = detectedAspectRatio;
    
    // Container aspect ratio (16:9)
    const containerRatio = 16 / 9;
    
    // Determine the rendering strategy based on the image's aspect ratio
    if (ratio >= containerRatio) {
      // Wider than container - fit width
      return {
        width: '100%',
        height: 'auto',
        objectFit: 'contain' as const,
        maxHeight: '100%'
      };
    } else {
      // Taller than container - fit height
      return {
        width: 'auto',
        height: '100%',
        objectFit: 'contain' as const,
        maxWidth: '100%'
      };
    }
  }, [detectedAspectRatio]);

  // Get the objectFit value for ResponsiveImage component
  const getObjectFitValue = useCallback((): "fill" | "contain" | "cover" | "none" | "scale-down" => {
    // Container aspect ratio (16:9)
    const containerRatio = 16 / 9;
    
    if (!detectedAspectRatio) {
      return 'contain';
    }
    
    const ratio = detectedAspectRatio;
    
    if (ratio >= containerRatio) {
      // Wider than container - ensure full width is visible
      return 'contain';
    } else {
      // Taller than container - ensure full height is visible
      return 'contain';
    }
  }, [detectedAspectRatio]);
  
  // Preload images function
  const preloadImages = useCallback(() => {
    // Clear previous preloaded images to prevent memory leaks
    preloadedImagesRef.current.forEach(img => {
      if (img && img.parentNode) {
        img.parentNode.removeChild(img);
      }
    });
    preloadedImagesRef.current = [];
    
    // Determine which images to preload (current + next PRELOAD_COUNT)
    const newPreloadedImages = new Set<number>();
    newPreloadedImages.add(selectedIndex); // Current image
    
    // Add next images
    for (let i = 1; i <= PRELOAD_COUNT; i++) {
      const nextIndex = (selectedIndex + i) % images.length;
      newPreloadedImages.add(nextIndex);
    }
    
    // Create and load image elements
    newPreloadedImages.forEach(index => {
      if (index >= 0 && index < images.length) {
        const imgUrl = getImageUrl(images[index]);
        const img = new Image();
        img.src = imgUrl;
        img.style.display = 'none'; // Hide the preloaded images
        document.body.appendChild(img); // Add to DOM to ensure loading
        preloadedImagesRef.current.push(img);
      }
    });
    
    setPreloadedImages(newPreloadedImages);
  }, [selectedIndex, images, getImageUrl]);

  // Preload images when selected index changes or on component mount
  useEffect(() => {
    preloadImages();
    
    return () => {
      // Cleanup preloaded images on unmount
      preloadedImagesRef.current.forEach(img => {
        if (img && img.parentNode) {
          img.parentNode.removeChild(img);
        }
      });
    };
  }, [selectedIndex, preloadImages]);

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

  // Handle click on thumbnail
  const handleThumbnailClick = (index: number) => {
    if (index !== selectedIndex && !isTransitioning) {
      setIsTransitioning(true);
      setSelectedIndex(index);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-48 md:h-72 bg-gray-200 flex items-center justify-center rounded">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  // Always show thumbnails, regardless of device
  const shouldShowThumbnails = images.length > 1;

  // Get objectFit value only (not using imageStyles directly)
  const objectFitValue = getObjectFitValue();

  // Get image styles
  const imageStyles = getImageStyles();

  return (
    <div className="w-full space-y-2">
      {/* Main selected image with swipe functionality */}
      <div 
        className="w-full h-48 md:h-72 lg:h-96 relative overflow-hidden rounded-lg shadow bg-gray-100 flex items-center justify-center"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div 
          className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%'
          }}
        >
          <ResponsiveImage 
            src={imageErrors[selectedIndex] ? FALLBACK_IMAGE_URL : getImageUrl(images[selectedIndex])}
            alt={`Car view ${selectedIndex + 1}`}
            width={800}
            height={600}
            objectFit={objectFitValue}
            onLoad={() => {/* Optional loading callback */}}
            placeholder={FALLBACK_IMAGE_URL}
            style={imageStyles}
          />
        </div>
        
        {/* Navigation arrows - show on all devices */}
        {images.length > 1 && (
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
        
        {/* Image counter */}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs md:text-sm">
          {selectedIndex + 1} / {images.length}
        </div>
        
        {/* Aspect ratio info if available - only in development mode */}
        {detectedAspectRatio && process.env.NODE_ENV === 'development' && (
          <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
            Ratio: {detectedAspectRatio.toFixed(2)}:1
          </div>
        )}
      </div>
      
      {/* Thumbnails - show on all devices */}
      {shouldShowThumbnails && (
        <div className="flex space-x-2 overflow-x-auto py-2">
          {images.map((image, index) => (
            <div 
              key={image.id}
              className={`
                cursor-pointer flex-shrink-0 h-14 w-14 md:h-16 md:w-16 rounded overflow-hidden border-2 transition-all flex items-center justify-center bg-gray-100
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
                objectFit={objectFitValue}
                onLoad={() => {/* Optional loading callback */}}
                style={imageStyles}
              />
            </div>
          ))}
        </div>
      )}
      
      {/* Hidden preloader container for images - these aren't displayed */}
      <div style={{ display: 'none' }} aria-hidden="true">
        {Array.from(preloadedImages).map((index) => (
          <img 
            key={`preload-${index}`}
            src={getImageUrl(images[index])}
            alt=""
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
};

export default CarImageCarousel;