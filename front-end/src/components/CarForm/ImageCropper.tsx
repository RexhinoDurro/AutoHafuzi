// src/components/CarForm/ImageCropper.tsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { AspectRatioOption } from './persistentImageStorage';

interface ImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onCropComplete: (croppedImageBlob: Blob) => Promise<void>;
  selectedAspectRatio?: AspectRatioOption;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  isOpen,
  onClose,
  imageUrl,
  onCropComplete,
  selectedAspectRatio = { label: 'Original', value: 'original', width: 0, height: 0 }
}) => {
  const [crop, setCrop] = useState<Crop>({
    unit: '%', // Always use percentage
    x: 0,
    y: 0,
    width: 100,
    height: 100
  });
  
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [isCropping, setIsCropping] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Helper function to create a centered crop with the specified aspect ratio
  const centerAspectCrop = useCallback(
    (mediaWidth: number, mediaHeight: number, aspect: number) => {
      return centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 90,
          },
          aspect,
          mediaWidth,
          mediaHeight
        ),
        mediaWidth,
        mediaHeight
      );
    },
    []
  );

  // Function to handle when the image is loaded
  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      
      // If we have a specific aspect ratio (not 'original'), set it
      if (selectedAspectRatio.value !== 'original' && selectedAspectRatio.width && selectedAspectRatio.height) {
        const aspect = selectedAspectRatio.width / selectedAspectRatio.height;
        setCrop(centerAspectCrop(width, height, aspect));
      } else {
        // Otherwise, use the full image
        setCrop({
          unit: '%',
          x: 0,
          y: 0,
          width: 100,
          height: 100,
        });
      }
    },
    [centerAspectCrop, selectedAspectRatio]
  );

  // When the selected aspect ratio changes, update the crop
  useEffect(() => {
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      
      if (selectedAspectRatio.value !== 'original' && selectedAspectRatio.width && selectedAspectRatio.height) {
        const aspect = selectedAspectRatio.width / selectedAspectRatio.height;
        setCrop(centerAspectCrop(width, height, aspect));
      } else {
        setCrop({
          unit: '%',
          x: 0,
          y: 0,
          width: 100,
          height: 100,
        });
      }
    }
  }, [selectedAspectRatio, centerAspectCrop]);

  // Generate and return a cropped image from the canvas
  const generateCroppedImage = useCallback(async (): Promise<Blob | null> => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) {
      return null;
    }

    // Get the canvas and context
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return null;
    }

    // Set canvas size to match the crop area
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    
    const pixelRatio = window.devicePixelRatio;
    
    // Calculate the actual crop dimensions on the original image
    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;
    
    // Set the canvas dimensions to match the crop size
    canvas.width = cropWidth * pixelRatio;
    canvas.height = cropHeight * pixelRatio;
    
    // Scale the context for high-DPI displays
    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = 'high';
    
    // Draw the cropped image
    ctx.drawImage(
      imgRef.current,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );
    
    // Convert canvas to blob
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        'image/jpeg',
        0.9 // quality
      );
    });
  }, [completedCrop]);

  // Handle crop confirmation
  const handleCropConfirm = async () => {
    setIsCropping(true);
    try {
      const croppedBlob = await generateCroppedImage();
      if (croppedBlob) {
        await onCropComplete(croppedBlob);
        onClose();
      }
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setIsCropping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Crop Image</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-700 mb-2">
            {selectedAspectRatio.value !== 'original' 
              ? `Aspect Ratio: ${selectedAspectRatio.width}:${selectedAspectRatio.height}` 
              : 'Free crop (no fixed aspect ratio)'}
          </p>
        </div>
        
        <div className="flex justify-center mb-4 overflow-hidden">
          <ReactCrop
            crop={crop}
            onChange={(c: Crop) => setCrop(c)}
            onComplete={(c: PixelCrop) => setCompletedCrop(c)}
            aspect={
              selectedAspectRatio.value !== 'original' && selectedAspectRatio.width && selectedAspectRatio.height
                ? selectedAspectRatio.width / selectedAspectRatio.height
                : undefined
            }
          >
            <img
              ref={imgRef}
              src={imageUrl}
              alt="Crop preview"
              onLoad={onImageLoad}
              className="max-h-[60vh]"
            />
          </ReactCrop>
        </div>
        
        {/* Hidden canvas for generating the cropped image */}
        <canvas
          ref={previewCanvasRef}
          style={{ display: 'none' }}
        />
        
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            disabled={isCropping}
          >
            Cancel
          </button>
          <button
            onClick={handleCropConfirm}
            className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${
              isCropping ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isCropping || !completedCrop?.width || !completedCrop?.height}
          >
            {isCropping ? 'Cropping...' : 'Apply Crop'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;