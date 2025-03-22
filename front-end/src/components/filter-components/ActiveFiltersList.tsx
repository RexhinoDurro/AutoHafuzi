// src/components/filter-components/ActiveFiltersList.tsx
import { memo } from 'react';
import { ActiveFilter } from '../../hooks/useCarFilter';

interface ActiveFiltersListProps {
  activeFilters: ActiveFilter[];
  showAllFilters: boolean;
  onToggleShowAll: () => void;
  onRemoveFilter: (key: string) => void;
  onClearAll: () => void;
}

/**
 * Component for displaying active filters
 */
export const ActiveFiltersList = memo(({
  activeFilters,
  showAllFilters,
  onToggleShowAll,
  onRemoveFilter,
  onClearAll
}: ActiveFiltersListProps) => {
  if (activeFilters.length === 0) return null;
  
  return (
    <div className="p-4 border-b">
      <h3 className="font-semibold mb-2">Filtrat e Aplikuar</h3>
      <div className="flex flex-wrap gap-2">
        {/* Show only first 3 filters if there are more than 3 and showAllFilters is false */}
        {activeFilters
          .slice(0, showAllFilters ? activeFilters.length : 3)
          .map((filter) => (
            <div
              key={filter.key}
              className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center"
            >
              <span>{filter.label}</span>
              <button
                onClick={() => onRemoveFilter(filter.key)}
                className="ml-2 text-blue-500 hover:text-blue-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          ))}
        
        {/* Show toggle button if there are more than 3 filters */}
        {activeFilters.length > 3 && (
          <button
            onClick={onToggleShowAll}
            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center hover:bg-gray-200"
          >
            {showAllFilters ? 'Show less' : `+${activeFilters.length - 3} more`}
          </button>
        )}
        
        <button
          onClick={onClearAll}
          className="text-gray-600 hover:text-gray-800 text-sm underline ml-auto"
        >
          Clear All
        </button>
      </div>
    </div>
  );
});