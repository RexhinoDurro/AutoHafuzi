// src/components/CarForm/ImageCropper.tsx - Enhanced version with better integration
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AspectRatioOption, saveSelectedAspectRatio } from './persistentImageStorage';
import { ZoomIn, ZoomOut, RotateCcw, RotateCw } from 'lucide-react';

interface ImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onCropComplete: (croppedImageBlob: Blob) => Promise<void>;
  selectedAspectRatio?: AspectRatioOption;
  currentImageId: number | null; // Used to track which image is being edited
  isTempImage?: boolean; // Flag to identify if the image is temporary or from server
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
  selectedAspectRatio = { label: 'Original', value: 'original', width: 0, height: 0 },
  currentImageId = null,
  isTempImage = false
}) => {
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState('');
  const [isCropping, setIsCropping] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  // We'll use this to keep track of the original image dimensions
  const naturalImageSizeRef = useRef({ width: 0, height: 0 });
  
  // Zoom state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [panStartPos, setPanStartPos] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  
  // Session ID for better tracking and debugging
  const sessionIdRef = useRef<string | null>(null);
  
  // Min and max zoom levels
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 5;
  const ZOOM_STEP = 0.1;

  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize crop area when image loads
  const handleImageLoad = useCallback(() => {
    if (!imageRef.current) return;
    
    const img = imageRef.current;
    const { offsetWidth, offsetHeight, naturalWidth, naturalHeight } = img;
    
    // Store both displayed and natural sizes
    setImageSize({ width: offsetWidth, height: offsetHeight });
    naturalImageSizeRef.current = { width: naturalWidth, height: naturalHeight };
    
    console.log(`Image loaded - Display: ${offsetWidth}x${offsetHeight}, Natural: ${naturalWidth}x${naturalHeight}`);
    console.log(`Working with image ID: ${currentImageId}, Temp image: ${isTempImage}`);
    console.log(`Session ID: ${sessionIdRef.current || 'N/A'}`);
    
    // Reset zoom and position
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
    setRotation(0);
    
    // Calculate initial crop area (centered, 80% of image)
    let cropWidth = offsetWidth * 0.8;
    let cropHeight = offsetHeight * 0.8;
    
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
    const x = (offsetWidth - cropWidth) / 2;
    const y = (offsetHeight - cropHeight) / 2;
    
    setCropArea({
      x,
      y,
      width: cropWidth,
      height: cropHeight
    });
  }, [selectedAspectRatio, currentImageId, isTempImage]);

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

  // Handle zoom in/out
  const handleZoom = useCallback((direction: 'in' | 'out', amount: number = ZOOM_STEP) => {
    setZoomLevel(prevZoom => {
      let newZoom;
      if (direction === 'in') {
        newZoom = Math.min(prevZoom + amount, MAX_ZOOM);
      } else {
        newZoom = Math.max(prevZoom - amount, MIN_ZOOM);
      }
      
      return newZoom;
    });
  }, []);

  // Handle mouse wheel for zooming
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!containerRef.current) return;
    
    e.preventDefault();
    
    // Zoom in or out based on wheel direction
    const direction = e.deltaY < 0 ? 'in' : 'out';
    handleZoom(direction);
  }, [handleZoom]);

  // Handle rotation
  const handleRotate = useCallback((direction: 'cw' | 'ccw') => {
    setRotation(prev => {
      let newRotation = prev;
      if (direction === 'cw') {
        newRotation = (prev + 90) % 360;
      } else {
        newRotation = (prev - 90 + 360) % 360;
      }
      return newRotation;
    });
  }, []);

  // Handle image panning (moving the image within the container)
  const handlePanStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (e.target !== imageRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX;
    const pageY = 'touches' in e ? e.touches[0].pageY : e.pageY;
    
    setIsPanning(true);
    setPanStartPos({
      x: pageX - imagePosition.x,
      y: pageY - imagePosition.y
    });
  }, [imagePosition]);

  // Handle panning movement
  const handlePanMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isPanning) return;
    
    const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX;
    const pageY = 'touches' in e ? e.touches[0].pageY : e.pageY;
    
    // Calculate new position
    const newX = pageX - panStartPos.x;
    const newY = pageY - panStartPos.y;
    
    setImagePosition({
      x: newX,
      y: newY
    });
  }, [isPanning, panStartPos]);

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

  // Handle mouse/touch move for dragging, resizing, or panning
  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (isPanning) {
      handlePanMove(e);
      return;
    }
    
    if (!isDragging && !isResizing) return;
    
    const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX;
    const pageY = 'touches' in e ? e.touches[0].pageY : e.pageY;
    
    if (isDragging) {
      // Move the crop area
      let newX = pageX - dragStartPos.x;
      let newY = pageY - dragStartPos.y;
      
      // Get the effective image size (accounting for zoom)
      const effectiveWidth = imageSize.width * zoomLevel;
      const effectiveHeight = imageSize.height * zoomLevel;
      
      // Constrain to image boundaries, accounting for zoom and position
      const leftBound = Math.max(0, -imagePosition.x / zoomLevel);
      const topBound = Math.max(0, -imagePosition.y / zoomLevel);
      const rightBound = Math.min(imageSize.width, (effectiveWidth - imagePosition.x) / zoomLevel);
      const bottomBound = Math.min(imageSize.height, (effectiveHeight - imagePosition.y) / zoomLevel);
      
      newX = Math.max(leftBound, Math.min(newX, rightBound - cropArea.width));
      newY = Math.max(topBound, Math.min(newY, bottomBound - cropArea.height));
      
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
      
      // Get the effective image size (accounting for zoom)
      const effectiveWidth = imageSize.width * zoomLevel;
      const effectiveHeight = imageSize.height * zoomLevel;
      
      // Constrain to image boundaries, accounting for zoom and position
      const leftBound = Math.max(0, -imagePosition.x / zoomLevel);
      const topBound = Math.max(0, -imagePosition.y / zoomLevel);
      const rightBound = Math.min(imageSize.width, (effectiveWidth - imagePosition.x) / zoomLevel);
      const bottomBound = Math.min(imageSize.height, (effectiveHeight - imagePosition.y) / zoomLevel);
      
      newCrop.x = Math.max(leftBound, Math.min(newCrop.x, rightBound - newCrop.width));
      newCrop.y = Math.max(topBound, Math.min(newCrop.y, bottomBound - newCrop.height));
      
      setCropArea(newCrop);
      setDragStartPos({ x: pageX, y: pageY });
    }
  }, [isDragging, isResizing, isPanning, cropArea, dragStartPos, imageSize, zoomLevel, imagePosition, handlePanMove, resizeHandle, enforceCropAspectRatio]);

  // Handle mouse/touch up to end dragging, resizing, or panning
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setIsPanning(false);
  }, []);

  // Add and remove event listeners
  useEffect(() => {
    if (isOpen) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchend', handleMouseUp);
      
      // Add wheel event listener for zooming, but only if container is available
      const container = containerRef.current;
      if (container) {
        container.addEventListener('wheel', handleWheel, { passive: false });
      }
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
      
      // Remove wheel event listener
      const container = containerRef.current;
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [isOpen, handleMouseMove, handleMouseUp, handleWheel]);

  // Enhanced generate the cropped image function with better error handling
  const generateCroppedImage = useCallback(async (): Promise<Blob | null> => {
    if (!imageRef.current || !canvasRef.current) {
      console.error('Missing image or canvas reference');
      return null;
    }
    
    const img = imageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      console.error('Could not get canvas context');
      return null;
    }
    
    // Add enhanced logging for debugging
    console.log(`===== CROP OPERATION START =====`);
    console.log(`Image ID: ${currentImageId} (${isTempImage ? 'Temporary' : 'Server'} image)`);
    console.log(`Session ID: ${sessionIdRef.current}`);
    console.log(`Crop settings: zoom=${zoomLevel}, rotation=${rotation}, position=(${imagePosition.x},${imagePosition.y})`);
    console.log(`Crop area: x=${cropArea.x}, y=${cropArea.y}, w=${cropArea.width}, h=${cropArea.height}`);
    console.log(`Natural image dimensions: ${naturalImageSizeRef.current.width}x${naturalImageSizeRef.current.height}`);
    console.log(`Displayed image dimensions: ${img.width}x${img.height}`);
    
    try {
      // Calculate the scaling factor between displayed image and natural image
      const scaleX = naturalImageSizeRef.current.width / img.width;
      const scaleY = naturalImageSizeRef.current.height / img.height;
      
      // Calculate the actual crop area in the original image coordinates
      // accounting for zoom, rotation and position
      const adjustedCropArea = {
        x: (cropArea.x * scaleX - imagePosition.x) / zoomLevel,
        y: (cropArea.y * scaleY - imagePosition.y) / zoomLevel,
        width: cropArea.width * scaleX / zoomLevel,
        height: cropArea.height * scaleY / zoomLevel
      };
      
      console.log(`Adjusted crop area: x=${adjustedCropArea.x}, y=${adjustedCropArea.y}, w=${adjustedCropArea.width}, h=${adjustedCropArea.height}`);
      
      // Set canvas size to match the crop area
      canvas.width = adjustedCropArea.width;
      canvas.height = adjustedCropArea.height;
      
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Handle rotation if needed
      if (rotation !== 0) {
        // Translate to center of canvas
        ctx.translate(canvas.width / 2, canvas.height / 2);
        // Rotate
        ctx.rotate((rotation * Math.PI) / 180);
        // Translate back
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
      }
      
      // Draw the cropped portion of the image to the canvas
      ctx.drawImage(
        img,
        adjustedCropArea.x,
        adjustedCropArea.y,
        adjustedCropArea.width,
        adjustedCropArea.height,
        0,
        0,
        canvas.width,
        canvas.height
      );
      
      // Convert canvas to blob and return a Promise
      return new Promise((resolve) => {
        canvas.toBlob(
          async (blob) => {
            if (blob) {
              console.log(`Created blob: ${blob.size} bytes, type: ${blob.type}`);
              
              // Create a completely isolated blob to prevent reference sharing
              // This is critical to fixing the issue where all images update at once
              const isolatedBlob = new Blob([await blob.arrayBuffer()], { 
                type: 'image/jpeg' 
              });
              
              console.log(`Created isolated blob: ${isolatedBlob.size} bytes`);
              console.log(`===== CROP OPERATION COMPLETE =====`);
              
              resolve(isolatedBlob);
            } else {
              console.error('Failed to create blob from canvas');
              console.log(`===== CROP OPERATION FAILED =====`);
              resolve(null);
            }
          },
          'image/jpeg',
          0.9 // quality
        );
      });
    } catch (error) {
      console.error('Error generating cropped image:', error);
      console.log(`===== CROP OPERATION ERROR =====`);
      return null;
    }
  }, [cropArea, zoomLevel, rotation, imagePosition, currentImageId, isTempImage]);

  // Enhanced handle crop confirmation
  const handleCropConfirm = async () => {
    if (isCropping) return; // Prevent multiple simultaneous crop operations
    
    setIsCropping(true);
    try {
      console.log(`Starting crop confirmation for image ID: ${currentImageId}`);
      
      const croppedBlob = await generateCroppedImage();
      if (croppedBlob) {
        // Generate a unique identifier for this crop operation
        const cropOperationId = `crop-${currentImageId}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        console.log(`Crop operation ID: ${cropOperationId}`);
        
        // Apply the crop by calling the parent component's handler
        // This will either update a temp image or a server image
        await onCropComplete(croppedBlob);
        
        // Save the selected aspect ratio to localStorage for future use
        saveSelectedAspectRatio(selectedAspectRatio.value);
        
        // Close the modal after successful crop
        onClose();
      } else {
        console.error('Failed to generate cropped image');
        alert('Failed to crop image. Please try again.');
      }
    } catch (error) {
      console.error('Error during crop operation:', error);
      alert('Error cropping image. Please try again.');
    } finally {
      setIsCropping(false);
    }
  };

  if (!isOpen) return null;

  // Calculate image transform style
  const imageTransform = `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${zoomLevel}) rotate(${rotation}deg)`;

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
        if (position === 'n' || position === 's') {
          baseStyle.left = '50%';
          baseStyle.transform = 'translateX(-50%)';
        }
        if (position === 'e' || position === 'w') {
          baseStyle.top = '50%';
          baseStyle.transform = 'translateY(-50%)';
        }
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
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Crop Image {isTempImage ? '(Preview)' : ''}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
            type="button"
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
          
          {/* Zoom and rotation controls */}
          <div className="flex space-x-4 mb-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleZoom('out')}
                className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                title="Zoom out"
                type="button"
              >
                <ZoomOut size={16} />
              </button>
              <span className="text-sm font-medium">{Math.round(zoomLevel * 100)}%</span>
              <button
                onClick={() => handleZoom('in')}
                className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                title="Zoom in"
                type="button"
              >
                <ZoomIn size={16} />
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleRotate('ccw')}
                className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                title="Rotate counter-clockwise"
                type="button"
              >
                <RotateCcw size={16} />
              </button>
              <span className="text-sm font-medium">{rotation}°</span>
              <button
                onClick={() => handleRotate('cw')}
                className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                title="Rotate clockwise"
                type="button"
              >
                <RotateCw size={16} />
              </button>
            </div>
          </div>
          
          <p className="text-sm text-gray-500">
            Tip: Use mouse wheel or pinch to zoom, drag image to pan, and drag handles to adjust crop area.
          </p>
          
          {/* Image ID info - helpful for debugging */}
          <p className="text-xs text-gray-400 mt-1">
            Image ID: {currentImageId !== null ? currentImageId : 'unknown'} 
            {isTempImage ? ' (Temporary)' : ' (Server)'}
          </p>
        </div>
        
        <div className="flex justify-center mb-4 overflow-hidden">
          <div 
            ref={containerRef} 
            className="relative"
            style={{ 
              maxHeight: '60vh', 
              maxWidth: '100%', 
              overflow: 'hidden',
              touchAction: 'none' // Prevent browser default touch actions
            }}
          >
            <div
              ref={wrapperRef}
              className="relative"
              style={{
                width: imageSize.width ? `${imageSize.width}px` : '100%',
                height: imageSize.height ? `${imageSize.height}px` : 'auto',
                overflow: 'visible'
              }}
            >
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Crop preview"
                onLoad={handleImageLoad}
                style={{
                  display: 'block',
                  transformOrigin: 'center',
                  transform: imageTransform,
                  maxHeight: '60vh',
                  maxWidth: '100%',
                  cursor: 'grab',
                  userSelect: 'none'
                }}
                onMouseDown={handlePanStart}
                onTouchStart={handlePanStart}
                draggable={false}
              />
              {renderCropOverlay()}
            </div>
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
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={handleCropConfirm}
            className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${
              isCropping ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isCropping}
            type="button"
          >
            {isCropping ? 'Cropping...' : 'Apply Crop'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImageCropper;