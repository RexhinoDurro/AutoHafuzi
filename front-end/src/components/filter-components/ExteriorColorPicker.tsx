// src/components/filter-components/ExteriorColorPicker.tsx
import { memo } from 'react';
import { ExteriorColor } from '../../hooks/useCarFilter';
import { ColorOption } from './ColorOption';
import { FixedSizeGrid } from 'react-window';

interface ExteriorColorPickerProps {
  colors: ExteriorColor[];
  selectedColor?: string;
  onChange: (colorId: string) => void;
  isLoading: boolean;
}

/**
 * Component for selecting exterior colors with virtualization
 */
export const ExteriorColorPicker = memo(({
  colors,
  selectedColor,
  onChange,
  isLoading
}: ExteriorColorPickerProps) => {
  // For small color sets, render directly
  if (colors.length < 20) {
    return (
      <div className="mt-3 grid grid-cols-3 gap-2">
        {isLoading ? (
          <div className="col-span-3 text-center py-2 text-sm text-gray-500">Duke ngarkuar ngjyrat...</div>
        ) : colors && colors.length > 0 ? (
          <>
            {colors.map((color) => (
              <ColorOption
                key={color.id}
                color={color}
                isSelected={selectedColor === color.id.toString()}
                onSelect={() => onChange(color.id.toString())}
              />
            ))}
            {/* Clear selection option */}
            {selectedColor && (
              <div
                className="flex items-center p-2 border rounded cursor-pointer border-gray-200"
                onClick={() => onChange('')}
              >
                <div className="w-6 h-6 rounded-full mr-2 flex items-center justify-center border border-gray-200">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
                <span className="text-xs">Pastro</span>
              </div>
            )}
          </>
        ) : (
          <div className="col-span-3 text-center py-2 text-sm text-gray-500">Nuk ka ngjyra të jashtme të disponueshme</div>
        )}
      </div>
    );
  }

  // For large color sets, use virtualization
  const columnCount = 3;
  const rowCount = Math.ceil(colors.length / columnCount);
  
  return (
    <div className="mt-3">
      {isLoading ? (
        <div className="text-center py-2 text-sm text-gray-500">Duke ngarkuar ngjyrat...</div>
      ) : colors && colors.length > 0 ? (
        <>
          <FixedSizeGrid
            columnCount={columnCount}
            columnWidth={120}
            height={200}
            rowCount={rowCount}
            rowHeight={50}
            width={375}
          >
            {({ columnIndex, rowIndex, style }) => {
              const index = rowIndex * columnCount + columnIndex;
              if (index >= colors.length) return null;
              
              const color = colors[index];
              return (
                <div style={style}>
                  <ColorOption
                    color={color}
                    isSelected={selectedColor === color.id.toString()}
                    onSelect={() => onChange(color.id.toString())}
                  />
                </div>
              );
            }}
          </FixedSizeGrid>
          
          {/* Clear selection option */}
          {selectedColor && (
            <div
              className="flex items-center p-2 border rounded cursor-pointer border-gray-200 mt-2"
              onClick={() => onChange('')}
            >
              <div className="w-6 h-6 rounded-full mr-2 flex items-center justify-center border border-gray-200">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <span className="text-xs">Pastro</span>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-2 text-sm text-gray-500">Nuk ka ngjyra të jashtme të disponueshme</div>
      )}
    </div>
  );
});