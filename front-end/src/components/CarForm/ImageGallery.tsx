// src/components/CarForm/ImageGallery.tsx
import React, { useState } from 'react';
import { CarImage } from '../../types/car';
import { API_BASE_URL } from '../../config/api';
import { getCloudinaryUrl } from '../../utils/imageService';
import { TempImage } from './useCarFormImageUpload';
import { AspectRatioOption } from './persistentImageStorage';
import ImageCropper from './ImageCropper';
import { Crop, Edit2 } from 'lucide-react';

interface ImageGalleryProps {
  images: (CarImage | TempImage)[];
  onDeleteImage: (id: number) => void;
  onUpdateImage?: (id: number, imageBlob: Blob) => Promise<void>;
  isEditing: boolean;
  baseUrl?: string;
  selectedAspectRatio?: AspectRatioOption;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ 
  images, 
  onDeleteImage, 
  onUpdateImage,
  isEditing, 
  baseUrl = API_BASE_URL,
  selectedAspectRatio = { label: 'Original', value: 'original', width: 0, height: 0 }
}) => {
  const fallbackImageUrl = `${baseUrl}/api/placeholder/800/600`;

  // State for crop modal
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [currentImageId, setCurrentImageId] = useState<number | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  
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
  
  // Calculate the aspect ratio styles based on selectedAspectRatio
  const getAspectRatioStyles = () => {
    if (selectedAspectRatio.value === 'original') {
      return {
        aspectRatio: 'auto',
        objectFit: 'cover' as const,
        height: '100%',
        width: '100%'
      };
    }
    
    // For specific aspect ratios
    return {
      aspectRatio: `${selectedAspectRatio.width} / ${selectedAspectRatio.height}`,
      objectFit: 'cover' as const,
      height: '100%',
      width: '100%',
    };
  };

  // Handle opening the crop modal
  const handleOpenCropModal = (image: CarImage | TempImage) => {
    if (!onUpdateImage) return; // Only proceed if update handler is provided
    
    // Set the current image ID and URL
    setCurrentImageId(image.id);
    setCurrentImageUrl(getImageUrl(image));
    setCropModalOpen(true);

    console.log(`Opening crop modal for image ID: ${image.id}`);
  };

  // Handle crop completion - FIXED to avoid affecting other images
  const handleCropComplete = async (croppedImageBlob: Blob) => {
    if (currentImageId === null || !onUpdateImage) return;
    
    try {
      console.log(`Completing crop for image ID: ${currentImageId}`);
      
      // Create an isolated copy of the blob to prevent reference sharing
      const isolatedBlob = new Blob([await croppedImageBlob.arrayBuffer()], { 
        type: croppedImageBlob.type 
      });
      
      // Pass the blob to the parent component's update handler
      await onUpdateImage(currentImageId, isolatedBlob);
      
      // Only close the modal after successful update
      setCropModalOpen(false);
    } catch (error) {
      console.error('Error updating image after crop:', error);
      alert('Failed to update image. Please try again.');
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
                style={getAspectRatioStyles()}
                onError={(e) => {
                  console.error(`Failed to load image: ${getImageUrl(image)}`);
                  e.currentTarget.src = fallbackImageUrl;
                }}
              />
            </div>
            
            {/* Action buttons */}
            <div className="absolute top-2 right-2 flex space-x-1">
              {/* Edit button */}
              {isEditing && onUpdateImage && (
                <button
                  onClick={() => handleOpenCropModal(image)}
                  className="bg-blue-500 text-white p-1 rounded-full hover:bg-blue-600"
                  type="button"
                  aria-label="Edit image"
                >
                  <Edit2 size={16} />
                </button>
              )}
              
              {/* Crop button */}
              {isEditing && onUpdateImage && (
                <button
                  onClick={() => handleOpenCropModal(image)}
                  className="bg-green-500 text-white p-1 rounded-full hover:bg-green-600"
                  type="button"
                  aria-label="Crop image"
                >
                  <Crop size={16} />
                </button>
              )}
              
              {/* Delete button */}
              {isEditing && (
                <button
                  onClick={() => onDeleteImage(image.id)}
                  className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  type="button"
                  aria-label="Delete image"
                >
                  <span aria-hidden="true">×</span>
                </button>
              )}
            </div>
            
            {/* Display "preview" badge for temporary images */}
            {isTempImage(image) && (
              <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                Preview
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Image cropper modal */}
      {cropModalOpen && currentImageUrl && (
        <ImageCropper 
          isOpen={cropModalOpen}
          onClose={() => setCropModalOpen(false)}
          imageUrl={currentImageUrl}
          onCropComplete={handleCropComplete}
          selectedAspectRatio={selectedAspectRatio}
          currentImageId={currentImageId} // Pass image ID for better tracking
        />
      )}
    </>
  );
};

export default ImageGallery;