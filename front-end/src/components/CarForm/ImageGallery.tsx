import React from 'react';
import { CarImage } from '../../types/car';
import { API_BASE_URL } from '../../config/api';

interface TempImage {
  id: number;
  preview: string;
}

interface ImageGalleryProps {
  images: (CarImage | TempImage)[];
  onDeleteImage: (id: number) => void;
  isEditing: boolean;
  baseUrl?: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ 
  images, 
  onDeleteImage, 
  isEditing, 
  baseUrl = API_BASE_URL 
}) => {
  const fallbackImageUrl = `${baseUrl}/api/placeholder/800/600`;
  
  // Helper to determine if an image is a temporary image
  const isTempImage = (image: CarImage | TempImage): image is TempImage => {
    return 'preview' in image;
  };
  
  // Helper to get the correct image URL
  const getImageUrl = (image: CarImage | TempImage): string => {
    if (isTempImage(image)) {
      return image.preview;
    }
    
    // For Cloudinary-stored images - this is the primary way now
    if ('url' in image && image.url) {
      return image.url;
    }
    
    // Fallback for direct URLs (shouldn't be needed with Cloudinary)
    if (image.image && typeof image.image === 'string' && 
        (image.image.startsWith('http://') || image.image.startsWith('https://'))) {
      return image.image;
    }
    
    // Last resort fallback - rarely needed with Cloudinary
    return fallbackImageUrl;
  };
  
  return (
    <div className="grid grid-cols-3 gap-4 mt-4">
      {images.map((image) => (
        <div key={image.id} className="relative">
          <img 
            src={getImageUrl(image)}
            alt="Car" 
            className="w-full h-48 object-cover rounded"
            onError={(e) => {
              console.error(`Failed to load image: ${getImageUrl(image)}`);
              e.currentTarget.src = fallbackImageUrl;
            }}
          />
          {isEditing && (
            <button
              onClick={() => onDeleteImage(image.id)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  );
};