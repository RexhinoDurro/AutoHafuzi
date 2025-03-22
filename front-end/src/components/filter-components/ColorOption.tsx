// src/components/filter-components/ColorOption.tsx
import { memo } from 'react';
import { ExteriorColor } from '../../hooks/useCarFilter';

interface ColorOptionProps {
  color: ExteriorColor;
  isSelected: boolean;
  onSelect: () => void;
}

/**
 * Component for a single color option
 */
export const ColorOption = memo(({
  color,
  isSelected,
  onSelect
}: ColorOptionProps) => {
  return (
    <div
      className={`flex items-center p-2 border rounded cursor-pointer ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
      }`}
      onClick={onSelect}
    >
      <div
        className="w-6 h-6 rounded-full mr-2 border border-gray-200"
        style={{ backgroundColor: color.hex_code }}
      ></div>
      <span className="text-xs">{color.name}</span>
    </div>
  );
});
