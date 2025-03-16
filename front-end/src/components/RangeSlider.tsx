import React, { useState, useEffect, useRef } from 'react';

interface RangeSliderProps {
  minValue: number;
  maxValue: number;
  step: number;
  currentMin: number;
  currentMax: number;
  label: string;
  unit: string;
  formatValue?: (value: number) => string;
  onChange: (min: number, max: number) => void;
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  minValue,
  maxValue,
  step,
  currentMin,
  currentMax,
  label,
  unit,
  formatValue = (value) => value.toString(),
  onChange,
}) => {
  const [min, setMin] = useState<number>(currentMin || minValue);
  const [max, setMax] = useState<number>(currentMax || maxValue);
  const [minInput, setMinInput] = useState<string>(currentMin ? formatValue(currentMin) : '');
  const [maxInput, setMaxInput] = useState<string>(currentMax ? formatValue(currentMax) : '');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [initialMin, setInitialMin] = useState<number>(min);
  const [initialMax, setInitialMax] = useState<number>(max);
  const [activeHandle, setActiveHandle] = useState<'min' | 'max' | 'range' | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const minHandleRef = useRef<HTMLDivElement>(null);
  const maxHandleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Update local state when props change (e.g., when filters are reset)
    setMin(currentMin || minValue);
    setMax(currentMax || maxValue);
    setMinInput(currentMin ? formatValue(currentMin) : '');
    setMaxInput(currentMax ? formatValue(currentMax) : '');
  }, [currentMin, currentMax, minValue, maxValue, formatValue]);

  useEffect(() => {
    // Add global mouse/touch event listeners when dragging
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }

    // Clean up event listeners
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, dragStartX, initialMin, initialMax, activeHandle]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = parseInt(e.target.value);
    setMin(newMin);
    
    // Ensure min doesn't exceed max
    if (newMin <= max) {
      onChange(newMin, max);
      setMinInput(formatValue(newMin));
    } else {
      setMin(max);
      onChange(max, max);
      setMinInput(formatValue(max));
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = parseInt(e.target.value);
    setMax(newMax);
    
    // Ensure max isn't less than min
    if (newMax >= min) {
      onChange(min, newMax);
      setMaxInput(formatValue(newMax));
    } else {
      setMax(min);
      onChange(min, min);
      setMaxInput(formatValue(min));
    }
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinInput(e.target.value);
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxInput(e.target.value);
  };

  const handleMinInputBlur = () => {
    // If input is empty, reset to min value
    if (minInput === '') {
      setMin(minValue);
      onChange(minValue, max);
      return;
    }

    // Parse the input value
    const newMin = parseInt(minInput.replace(/[^\d]/g, ''));
    
    if (isNaN(newMin)) {
      setMinInput(formatValue(min));
      return;
    }

    // Clamp value between minValue and max
    const clampedValue = Math.max(minValue, Math.min(newMin, max));
    setMin(clampedValue);
    setMinInput(formatValue(clampedValue));
    onChange(clampedValue, max);
  };

  const handleMaxInputBlur = () => {
    // If input is empty, reset to max value
    if (maxInput === '') {
      setMax(maxValue);
      onChange(min, maxValue);
      return;
    }

    // Parse the input value
    const newMax = parseInt(maxInput.replace(/[^\d]/g, ''));
    
    if (isNaN(newMax)) {
      setMaxInput(formatValue(max));
      return;
    }

    // Clamp value between min and maxValue
    const clampedValue = Math.min(maxValue, Math.max(newMax, min));
    setMax(clampedValue);
    setMaxInput(formatValue(clampedValue));
    onChange(min, clampedValue);
  };

  // Handle starting drag on track, min handle, max handle, or range
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, target: 'min' | 'max' | 'range' | 'track') => {
    e.stopPropagation();
    setIsDragging(true);
    setDragStartX(e.clientX);
    setInitialMin(min);
    setInitialMax(max);
    
    if (target === 'track') {
      // When clicking on track, determine whether to move min handle, max handle, or both
      if (sliderRef.current) {
        const rect = sliderRef.current.getBoundingClientRect();
        const clickPosition = (e.clientX - rect.left) / rect.width;
        const range = maxValue - minValue;
        const valueAtClick = minValue + Math.round(clickPosition * range / step) * step;
        
        const distanceToMin = Math.abs(valueAtClick - min);
        const distanceToMax = Math.abs(valueAtClick - max);

        if (distanceToMin <= distanceToMax) {
          setActiveHandle('min');
          // Move min handle
          setMin(valueAtClick);
          setMinInput(formatValue(valueAtClick));
          onChange(valueAtClick, max);
        } else {
          setActiveHandle('max');
          // Move max handle
          setMax(valueAtClick);
          setMaxInput(formatValue(valueAtClick));
          onChange(min, valueAtClick);
        }
      }
    } else {
      setActiveHandle(target);
    }
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>, target: 'min' | 'max' | 'range' | 'track') => {
    e.stopPropagation();
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStartX(touch.clientX);
    setInitialMin(min);
    setInitialMax(max);
    
    if (target === 'track') {
      // When touching on track, determine whether to move min handle, max handle, or both
      if (sliderRef.current) {
        const rect = sliderRef.current.getBoundingClientRect();
        const touchPosition = (touch.clientX - rect.left) / rect.width;
        const range = maxValue - minValue;
        const valueAtTouch = minValue + Math.round(touchPosition * range / step) * step;
        
        const distanceToMin = Math.abs(valueAtTouch - min);
        const distanceToMax = Math.abs(valueAtTouch - max);

        if (distanceToMin <= distanceToMax) {
          setActiveHandle('min');
          // Move min handle
          setMin(valueAtTouch);
          setMinInput(formatValue(valueAtTouch));
          onChange(valueAtTouch, max);
        } else {
          setActiveHandle('max');
          // Move max handle
          setMax(valueAtTouch);
          setMaxInput(formatValue(valueAtTouch));
          onChange(min, valueAtTouch);
        }
      }
    } else {
      setActiveHandle(target);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect();
      const deltaX = e.clientX - dragStartX;
      const deltaRatio = deltaX / rect.width;
      const range = maxValue - minValue;
      const deltaValue = Math.round(deltaRatio * range / step) * step;
      
      updateSliderBasedOnDrag(deltaValue, rect.width);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging && sliderRef.current) {
      const touch = e.touches[0];
      const rect = sliderRef.current.getBoundingClientRect();
      const deltaX = touch.clientX - dragStartX;
      const deltaRatio = deltaX / rect.width;
      const range = maxValue - minValue;
      const deltaValue = Math.round(deltaRatio * range / step) * step;
      
      updateSliderBasedOnDrag(deltaValue, rect.width);
      
      // Prevent default to avoid scrolling while dragging
      e.preventDefault();
    }
  };

  const updateSliderBasedOnDrag = (deltaValue: number, trackWidth: number) => {
    if (activeHandle === 'min') {
      // Move min handle
      const newMin = Math.max(minValue, Math.min(initialMin + deltaValue, max));
      setMin(newMin);
      setMinInput(formatValue(newMin));
      onChange(newMin, max);
    } else if (activeHandle === 'max') {
      // Move max handle
      const newMax = Math.min(maxValue, Math.max(initialMax + deltaValue, min));
      setMax(newMax);
      setMaxInput(formatValue(newMax));
      onChange(min, newMax);
    } else if (activeHandle === 'range') {
      // Move both handles while maintaining their distance
      let newMin = initialMin + deltaValue;
      let newMax = initialMax + deltaValue;
      
      // Ensure values stay within bounds
      if (newMin < minValue) {
        const adjustment = minValue - newMin;
        newMin = minValue;
        newMax = Math.min(maxValue, newMax + adjustment);
      }
      
      if (newMax > maxValue) {
        const adjustment = newMax - maxValue;
        newMax = maxValue;
        newMin = Math.max(minValue, newMin - adjustment);
      }
      
      setMin(newMin);
      setMax(newMax);
      setMinInput(formatValue(newMin));
      setMaxInput(formatValue(newMax));
      onChange(newMin, newMax);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setActiveHandle(null);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setActiveHandle(null);
  };

  // Calculate positions for rendering
  const minPosition = ((min - minValue) / (maxValue - minValue)) * 100;
  const maxPosition = ((max - minValue) / (maxValue - minValue)) * 100;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium">{label}</label>
        <div className="flex items-center space-x-2 text-sm">
          <input
            type="text"
            value={minInput}
            onChange={handleMinInputChange}
            onBlur={handleMinInputBlur}
            className="w-24 p-1 border rounded text-center"
            placeholder={`Min ${unit}`}
          />
          <span>-</span>
          <input
            type="text"
            value={maxInput}
            onChange={handleMaxInputChange}
            onBlur={handleMaxInputBlur}
            className="w-24 p-1 border rounded text-center"
            placeholder={`Max ${unit}`}
          />
        </div>
      </div>
      
      <div 
        className="relative h-6 py-2.5 cursor-pointer" 
        ref={sliderRef}
        onMouseDown={(e) => handleMouseDown(e, 'track')}
        onTouchStart={(e) => handleTouchStart(e, 'track')}
      >
        {/* Track background */}
        <div className="absolute top-2.5 left-0 right-0 h-1 bg-gray-200 rounded-full"></div>
        
        {/* Selected range */}
        <div 
          className="absolute top-2.5 h-1 bg-blue-500 rounded-full cursor-move"
          style={{ 
            left: `${minPosition}%`, 
            right: `${100 - maxPosition}%`
          }}
          onMouseDown={(e) => handleMouseDown(e, 'range')}
          onTouchStart={(e) => handleTouchStart(e, 'range')}
        ></div>
        
        {/* Min handle */}
        <div
          ref={minHandleRef}
          className="absolute top-1 w-4 h-4 bg-blue-500 rounded-full cursor-pointer transform -translate-x-1/2"
          style={{ left: `${minPosition}%` }}
          onMouseDown={(e) => handleMouseDown(e, 'min')}
          onTouchStart={(e) => handleTouchStart(e, 'min')}
        ></div>
        
        {/* Max handle */}
        <div
          ref={maxHandleRef}
          className="absolute top-1 w-4 h-4 bg-blue-500 rounded-full cursor-pointer transform -translate-x-1/2"
          style={{ left: `${maxPosition}%` }}
          onMouseDown={(e) => handleMouseDown(e, 'max')}
          onTouchStart={(e) => handleTouchStart(e, 'max')}
        ></div>
      </div>
      
      <div className="flex justify-between text-xs text-gray-500">
        <span>{formatValue(minValue)} {unit}</span>
        <span>{formatValue(maxValue)} {unit}</span>
      </div>
    </div>
  );
};

export default RangeSlider;