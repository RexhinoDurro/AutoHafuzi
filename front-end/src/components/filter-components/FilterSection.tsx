import React, { ReactNode } from 'react';

interface FilterSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: ReactNode;
  className?: string;
}

/**
 * Reusable collapsible section for filters
 */
export const FilterSection: React.FC<FilterSectionProps> = ({ 
  title,
  isExpanded,
  onToggle,
  children,
  className = 'p-4 border-b'
}) => {
  return (
    <div className={className}>
      <div 
        className="flex justify-between items-center cursor-pointer"
        onClick={onToggle}
      >
        <h3 className="text-lg font-semibold">{title}</h3>
        <svg 
          className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
      {isExpanded && <div className="mt-3">{children}</div>}
    </div>
  );
};