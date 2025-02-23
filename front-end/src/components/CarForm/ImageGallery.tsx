import React from 'react';
import { CarImage } from '../../types/car';

interface TempImage {
  id: number;
  preview: string;
}

interface ImageGalleryProps {
  images: (CarImage | TempImage)[];
  onDeleteImage: (id: number) => void;
  isEditing: boolean;
  baseUrl?: string; // Made optional to maintain compatibility
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ 
  images, 
  onDeleteImage, 
  isEditing, 
  baseUrl = 'http://localhost:8000' // Default value
}) => {
  return (
    <div className="grid grid-cols-3 gap-4 mt-4">
      {images.map((image) => (
        <div key={image.id} className="relative">
          <img 
            src={'preview' in image ? image.preview : `${baseUrl}${image.image}`}
            alt="Car" 
            className="w-full h-48 object-cover rounded" 
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