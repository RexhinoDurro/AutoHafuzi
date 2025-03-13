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
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Update local state when props change (e.g., when filters are reset)
    setMin(currentMin || minValue);
    setMax(currentMax || maxValue);
    setMinInput(currentMin ? formatValue(currentMin) : '');
    setMaxInput(currentMax ? formatValue(currentMax) : '');
  }, [currentMin, currentMax, minValue, maxValue, formatValue]);

  useEffect(() => {
    // Add global mouse event listeners when dragging
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    // Clean up event listeners
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStartX, initialMin, initialMax]);

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

  // Handle clicking on the slider track to jump to position
  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect();
      const clickPosition = (e.clientX - rect.left) / rect.width;
      const range = maxValue - minValue;
      const valueAtClick = minValue + Math.round(clickPosition * range / step) * step;
      
      // Determine if we should move the min or max handle (or both)
      const distanceToMin = Math.abs(valueAtClick - min);
      const distanceToMax = Math.abs(valueAtClick - max);

      if (distanceToMin <= distanceToMax) {
        // Move min handle
        setMin(valueAtClick);
        setMinInput(formatValue(valueAtClick));
        onChange(valueAtClick, max);
      } else {
        // Move max handle
        setMax(valueAtClick);
        setMaxInput(formatValue(valueAtClick));
        onChange(min, valueAtClick);
      }
    }
  };

  // Handle clicking and dragging on the blue selected range
  const handleRangeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation(); // Prevent track click from firing
    setIsDragging(true);
    setDragStartX(e.clientX);
    setInitialMin(min);
    setInitialMax(max);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect();
      const deltaX = e.clientX - dragStartX;
      const deltaRatio = deltaX / rect.width;
      const range = maxValue - minValue;
      const deltaValue = Math.round(deltaRatio * range / step) * step;
      
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
  };

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
        className="relative h-1 bg-gray-200 rounded-full cursor-pointer" 
        ref={sliderRef}
        onClick={handleTrackClick}
      >
        <div 
          className="absolute h-1 bg-blue-500 rounded-full cursor-move"
          style={{ 
            left: `${((min - minValue) / (maxValue - minValue)) * 100}%`, 
            right: `${100 - ((max - minValue) / (maxValue - minValue)) * 100}%`
          }}
          onMouseDown={handleRangeMouseDown}
        ></div>
        
        <input
          type="range"
          min={minValue}
          max={maxValue}
          step={step}
          value={min}
          onChange={handleMinChange}
          className="absolute w-full h-1 appearance-none bg-transparent pointer-events-none"
          style={{ 
            zIndex: 2,
            '--track-color': 'transparent',
            '--thumb-color': '#3B82F6',
            '--thumb-size': '14px',
          } as React.CSSProperties}
        />
        
        <input
          type="range"
          min={minValue}
          max={maxValue}
          step={step}
          value={max}
          onChange={handleMaxChange}
          className="absolute w-full h-1 appearance-none bg-transparent pointer-events-none"
          style={{ 
            zIndex: 2,
            '--track-color': 'transparent',
            '--thumb-color': '#3B82F6',
            '--thumb-size': '14px',
          } as React.CSSProperties}
        />
      </div>
      
      <div className="flex justify-between text-xs text-gray-500">
        <span>{formatValue(minValue)} {unit}</span>
        <span>{formatValue(maxValue)} {unit}</span>
      </div>
    </div>
  );
};

export default RangeSlider;