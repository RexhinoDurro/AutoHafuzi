// src/components/filter-components/OptionCategory.tsx
import { memo } from 'react';
import { Option } from '../../hooks/useCarFilter';

interface OptionCategoryProps {
  category: string;
  options: Option[];
  selectedOptions: string[];
  onOptionChange: (optionId: string) => void;
}

/**
 * Component for a category of options
 */
export const OptionCategory = memo(({
  category,
  options,
  selectedOptions,
  onOptionChange
}: OptionCategoryProps) => {
  return (
    <div className="border p-2 rounded">
      <h4 className="font-medium mb-2 text-gray-700 text-xs">{category}</h4>
      <div className="grid grid-cols-1 gap-2">
        {options.map((option) => (
          <div key={option.id} className="flex items-center bg-gray-50 p-2 rounded">
            <input
              type="checkbox"
              id={`option-${option.id}`}
              checked={selectedOptions.includes(option.id.toString())}
              onChange={() => onOptionChange(option.id.toString())}
              className="mr-2 h-4 w-4"
            />
            <label htmlFor={`option-${option.id}`} className="text-xs">
              {option.name}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
});