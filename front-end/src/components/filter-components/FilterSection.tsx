import React, { ReactNode } from 'react';

interface FilterSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: ReactNode;
  className?: string;
  id?: string; // Added ID prop for accessibility
}

/**
 * Reusable collapsible section for filters
 * Enhanced with proper accessibility for toggle button
 */
export const FilterSection: React.FC<FilterSectionProps> = ({ 
  title,
  isExpanded,
  onToggle,
  children,
  className = 'p-4 border-b',
  id
}) => {
  // Generate a unique ID if not provided
  const sectionId = id || `filter-section-${title.toLowerCase().replace(/\s+/g, '-')}`;
  const contentId = `${sectionId}-content`;
  
  return (
    <div className={className}>
      <div 
        className="flex justify-between items-center cursor-pointer"
        onClick={onToggle}
      >
        <h3 className="text-lg font-semibold" id={sectionId}>{title}</h3>
        <button 
          onClick={(e) => {
            e.stopPropagation(); // Prevent double triggering
            onToggle();
          }}
          className="focus:outline-none focus:ring-2 focus:ring-blue-500 p-1 rounded"
          aria-expanded={isExpanded}
          aria-controls={contentId}
          aria-labelledby={sectionId}
        >
          <svg 
            className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
          <span className="sr-only">{isExpanded ? 'Collapse' : 'Expand'} {title}</span>
        </button>
      </div>
      
      <div 
        id={contentId}
        className={`mt-3 transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
        aria-hidden={!isExpanded}
      >
        {children}
      </div>
    </div>
  );
};