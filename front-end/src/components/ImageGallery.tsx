import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface CarImage {
  id: number;
  image: string;
  url?: string;
  is_primary?: boolean;
  order?: number;
}

interface ImageGalleryProps {
  images: CarImage[];
  onDeleteImage?: (id: number) => void;
  isEditing?: boolean;
}

const ImageGallery = ({ images, onDeleteImage, isEditing = false }: ImageGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    if (images.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  // Handle empty images array
  if (!images || images.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-100 flex items-center justify-center rounded-lg">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  // Get the correct image URL, prioritizing url property if available
  const getImageUrl = (image: CarImage) => {
    return image.url || image.image || '';
  };

  return (
    <div className="relative w-full h-96">
      <img
        src={getImageUrl(images[currentIndex])}
        alt={`Car image ${currentIndex + 1}`}
        className="w-full h-full object-cover rounded-lg"
      />
      
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white hover:bg-black/70"
            aria-label="Previous image"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white hover:bg-black/70"
            aria-label="Next image"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}
      
      {isEditing && onDeleteImage && (
        <button
          onClick={() => onDeleteImage(images[currentIndex].id)}
          className="absolute top-2 right-2 bg-red-500 p-2 rounded-full text-white hover:bg-red-600"
          aria-label="Delete image"
        >
          <X size={20} />
        </button>
      )}
      
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentIndex === index ? 'bg-white w-4' : 'bg-white/50'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;