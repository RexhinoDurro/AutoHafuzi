// src/components/CarForm/ImageCropper.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AspectRatioOption } from './persistentImageStorage';

interface ImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onCropComplete: (croppedImageBlob: Blob) => Promise<void>;
  selectedAspectRatio?: AspectRatioOption;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  isOpen,
  onClose,
  imageUrl,
  onCropComplete,
  selectedAspectRatio = { label: 'Original', value: 'original', width: 0, height: 0 }
}) => {
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState('');
  const [isCropping, setIsCropping] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize crop area when image loads
  const handleImageLoad = useCallback(() => {
    if (!imageRef.current) return;
    
    const img = imageRef.current;
    const { width, height } = img;
    
    setImageSize({ width, height });
    
    // Calculate initial crop area (centered, 80% of image)
    let cropWidth = width * 0.8;
    let cropHeight = height * 0.8;
    
    // Apply aspect ratio if specified
    if (selectedAspectRatio.value !== 'original' && selectedAspectRatio.width && selectedAspectRatio.height) {
      const aspectRatio = selectedAspectRatio.width / selectedAspectRatio.height;
      
      if (cropWidth / cropHeight > aspectRatio) {
        // Width is too large for the aspect ratio
        cropWidth = cropHeight * aspectRatio;
      } else {
        // Height is too large for the aspect ratio
        cropHeight = cropWidth / aspectRatio;
      }
    }
    
    // Center the crop area
    const x = (width - cropWidth) / 2;
    const y = (height - cropHeight) / 2;
    
    setCropArea({
      x,
      y,
      width: cropWidth,
      height: cropHeight
    });
  }, [selectedAspectRatio]);

  // Enforce aspect ratio during crop area changes
  const enforceCropAspectRatio = useCallback((newCrop: CropArea): CropArea => {
    if (selectedAspectRatio.value === 'original' || !selectedAspectRatio.width || !selectedAspectRatio.height) {
      return newCrop;
    }
    
    const aspectRatio = selectedAspectRatio.width / selectedAspectRatio.height;
    let { x, y, width, height } = newCrop;
    
    // Adjust based on which dimension is being changed
    if (resizeHandle.includes('e') || resizeHandle.includes('w')) {
      // Horizontal resize - adjust height
      height = width / aspectRatio;
    } else if (resizeHandle.includes('n') || resizeHandle.includes('s')) {
      // Vertical resize - adjust width
      width = height * aspectRatio;
    }
    
    return { x, y, width, height };
  }, [resizeHandle, selectedAspectRatio]);

  // Handle mouse/touch down for dragging
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent, action: string) => {
    e.preventDefault();
    
    const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX;
    const pageY = 'touches' in e ? e.touches[0].pageY : e.pageY;
    
    if (action === 'move') {
      setIsDragging(true);
      setDragStartPos({
        x: pageX - cropArea.x,
        y: pageY - cropArea.y
      });
    } else {
      setIsResizing(true);
      setResizeHandle(action);
      setDragStartPos({
        x: pageX,
        y: pageY
      });
    }
  };

  // Handle mouse/touch move for dragging or resizing
  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging && !isResizing) return;
    
    const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX;
    const pageY = 'touches' in e ? e.touches[0].pageY : e.pageY;
    
    if (isDragging) {
      // Move the crop area
      let newX = pageX - dragStartPos.x;
      let newY = pageY - dragStartPos.y;
      
      // Constrain to image boundaries
      newX = Math.max(0, Math.min(newX, imageSize.width - cropArea.width));
      newY = Math.max(0, Math.min(newY, imageSize.height - cropArea.height));
      
      setCropArea(prev => ({
        ...prev,
        x: newX,
        y: newY
      }));
    } else if (isResizing) {
      // Calculate the position difference
      const diffX = pageX - dragStartPos.x;
      const diffY = pageY - dragStartPos.y;
      
      // Update crop area based on which handle is being dragged
      let newCrop = { ...cropArea };
      
      if (resizeHandle.includes('n')) {
        newCrop.y += diffY;
        newCrop.height -= diffY;
      }
      if (resizeHandle.includes('e')) {
        newCrop.width += diffX;
      }
      if (resizeHandle.includes('s')) {
        newCrop.height += diffY;
      }
      if (resizeHandle.includes('w')) {
        newCrop.x += diffX;
        newCrop.width -= diffX;
      }
      
      // Ensure minimum dimensions
      const minSize = 20;
      if (newCrop.width < minSize) {
        if (resizeHandle.includes('w')) {
          newCrop.x = cropArea.x + cropArea.width - minSize;
        }
        newCrop.width = minSize;
      }
      if (newCrop.height < minSize) {
        if (resizeHandle.includes('n')) {
          newCrop.y = cropArea.y + cropArea.height - minSize;
        }
        newCrop.height = minSize;
      }
      
      // Enforce aspect ratio if needed
      newCrop = enforceCropAspectRatio(newCrop);
      
      // Constrain to image boundaries
      newCrop.x = Math.max(0, Math.min(newCrop.x, imageSize.width - newCrop.width));
      newCrop.y = Math.max(0, Math.min(newCrop.y, imageSize.height - newCrop.height));
      
      setCropArea(newCrop);
      setDragStartPos({ x: pageX, y: pageY });
    }
  }, [isDragging, isResizing, cropArea, dragStartPos, imageSize, resizeHandle, enforceCropAspectRatio]);

  // Handle mouse/touch up to end dragging or resizing
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  // Add and remove event listeners
  useEffect(() => {
    if (isOpen) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchend', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isOpen, handleMouseMove, handleMouseUp]);

  // Generate the cropped image
  const generateCroppedImage = useCallback((): Promise<Blob | null> => {
    if (!imageRef.current || !canvasRef.current) {
      return Promise.resolve(null);
    }
    
    const img = imageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return Promise.resolve(null);
    }
    
    // Calculate the scaling factor between displayed image and natural image
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;
    
    // Set canvas size to match the crop area in original image dimensions
    canvas.width = cropArea.width * scaleX;
    canvas.height = cropArea.height * scaleY;
    
    // Draw the cropped portion of the image to the canvas
    ctx.drawImage(
      img,
      cropArea.x * scaleX,
      cropArea.y * scaleY,
      cropArea.width * scaleX,
      cropArea.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
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
  }, [cropArea]);

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

  // Render the crop overlay with handles
  const renderCropOverlay = () => {
    // Calculate the overlay dimensions
    const overlayStyle: React.CSSProperties = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
    };
    
    // Calculate crop area styles
    const cropStyle: React.CSSProperties = {
      position: 'absolute',
      top: `${cropArea.y}px`,
      left: `${cropArea.x}px`,
      width: `${cropArea.width}px`,
      height: `${cropArea.height}px`,
      border: '1px solid white',
      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
      cursor: 'move',
      pointerEvents: 'auto',
    };
    
    // Handle styles
    const handleStyle = (position: string): React.CSSProperties => {
      const isCorner = position.length === 2;
      const size = 10;
      
      let cursor = 'default';
      if (position === 'n' || position === 's') cursor = 'ns-resize';
      if (position === 'e' || position === 'w') cursor = 'ew-resize';
      if (position === 'nw' || position === 'se') cursor = 'nwse-resize';
      if (position === 'ne' || position === 'sw') cursor = 'nesw-resize';
      
      const baseStyle: React.CSSProperties = {
        position: 'absolute',
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: 'white',
        border: '1px solid #333',
        pointerEvents: 'auto',
        cursor,
      };
      
      // Position based on handle location
      if (position.includes('n')) baseStyle.top = '-5px';
      if (position.includes('e')) baseStyle.right = '-5px';
      if (position.includes('s')) baseStyle.bottom = '-5px';
      if (position.includes('w')) baseStyle.left = '-5px';
      
      // Center handles for edge (non-corner) handles
      if (!isCorner) {
        if (position === 'n' || position === 's') baseStyle.left = '50%';
        if (position === 'n' || position === 's') baseStyle.transform = 'translateX(-50%)';
        if (position === 'e' || position === 'w') baseStyle.top = '50%';
        if (position === 'e' || position === 'w') baseStyle.transform = 'translateY(-50%)';
      }
      
      return baseStyle;
    };
    
    return (
      <div style={overlayStyle}>
        <div
          style={cropStyle}
          onMouseDown={(e) => handleMouseDown(e, 'move')}
          onTouchStart={(e) => handleMouseDown(e, 'move')}
        >
          {/* Rule of thirds guide */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gridTemplateRows: '1fr 1fr 1fr',
            pointerEvents: 'none',
          }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{
                position: 'absolute',
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                ...(i < 2 
                  ? { left: `${(i + 1) * 33.33}%`, top: 0, width: '1px', height: '100%' } 
                  : { top: `${(i - 1) * 33.33}%`, left: 0, height: '1px', width: '100%' })
              }} />
            ))}
          </div>
          
          {/* Resize handles */}
          {['n', 'e', 's', 'w', 'nw', 'ne', 'se', 'sw'].map(pos => (
            <div
              key={pos}
              style={handleStyle(pos)}
              onMouseDown={(e) => handleMouseDown(e, pos)}
              onTouchStart={(e) => handleMouseDown(e, pos)}
            />
          ))}
        </div>
      </div>
    );
  };

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
          <div 
            ref={containerRef} 
            className="relative"
            style={{ maxHeight: '60vh', maxWidth: '100%' }}
          >
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Crop preview"
              onLoad={handleImageLoad}
              className="max-h-[60vh] max-w-full"
              style={{ display: 'block' }}
            />
            {renderCropOverlay()}
          </div>
        </div>
        
        {/* Hidden canvas for generating the cropped image */}
        <canvas
          ref={canvasRef}
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
            disabled={isCropping}
          >
            {isCropping ? 'Cropping...' : 'Apply Crop'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;