import React, { useState } from 'react';
import { CarImage } from '../types/car';

interface TempImage {
  id: number;
  preview: string;
}

interface CarImageCarouselProps {
  images: (CarImage | TempImage)[];
  baseUrl?: string;
}

export const CarImageCarousel: React.FC<CarImageCarouselProps> = ({ 
  images, 
  baseUrl = 'http://localhost:8000' 
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Helper function to determine if an image is a temporary image
  const isTempImage = (image: CarImage | TempImage): image is TempImage => {
    return 'preview' in image;
  };

  // Helper function to get the correct image URL
  const getImageUrl = (image: CarImage | TempImage): string => {
    if (isTempImage(image)) {
      return image.preview;
    } else {
      // Check if image.image already contains http:// or https://
      if (image.image.startsWith('http://') || image.image.startsWith('https://')) {
        return image.image;
      }
      // Make sure image.image doesn't start with a slash if baseUrl ends with one
      const imagePath = image.image.startsWith('/') ? image.image : `/${image.image}`;
      return `${baseUrl}${imagePath}`;
    }
  };

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-200 flex items-center justify-center rounded">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main selected image */}
      <div className="w-full h-96 relative overflow-hidden rounded-lg shadow">
        <img 
          src={getImageUrl(images[selectedIndex])}
          alt={`Car view ${selectedIndex + 1}`} 
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error(`Failed to load image: ${getImageUrl(images[selectedIndex])}`);
            e.currentTarget.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
          }}
        />
        
        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setSelectedIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
              aria-label="Previous image"
            >
              &#10094;
            </button>
            <button
              onClick={() => setSelectedIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
              aria-label="Next image"
            >
              &#10095;
            </button>
          </>
        )}
        
        {/* Image counter */}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
          {selectedIndex + 1} / {images.length}
        </div>
      </div>
      
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto py-2">
          {images.map((image, index) => (
            <div 
              key={image.id}
              className={`
                cursor-pointer flex-shrink-0 h-20 w-20 rounded overflow-hidden border-2
                ${index === selectedIndex ? 'border-blue-500' : 'border-transparent'}
              `}
              onClick={() => setSelectedIndex(index)}
            >
              <img 
                src={getImageUrl(image)}
                alt={`Thumbnail ${index + 1}`} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/100x100?text=Thumbnail';
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CarImageCarousel;