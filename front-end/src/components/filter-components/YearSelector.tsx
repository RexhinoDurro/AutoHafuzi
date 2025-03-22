// src/components/filter-components/YearSelector.tsx
import { memo } from 'react';

interface YearSelectorProps {
  years: number[];
  selectedFromYear?: string;
  selectedToYear?: string;
  onFromYearChange: (value: string) => void;
  onToYearChange: (value: string) => void;
}

/**
 * Component for selecting year range
 * Fixed with proper accessibility labels
 */
export const YearSelector = memo(({
  years,
  selectedFromYear,
  selectedToYear,
  onFromYearChange,
  onToYearChange
}: YearSelectorProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      <div>
        <label htmlFor="registration-from-year" className="block text-sm font-medium text-gray-700 mb-1">
          Regjistrimi Nga
        </label>
        <select
          id="registration-from-year"
          value={selectedFromYear || ''}
          onChange={(e) => onFromYearChange(e.target.value)}
          className="w-full p-2 border rounded"
          aria-label="Registration from year"
        >
          <option value="">Zgjidhni vitin</option>
          {years.map((year) => (
            <option key={`from-${year}`} value={year.toString()}>
              {year}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label htmlFor="registration-to-year" className="block text-sm font-medium text-gray-700 mb-1">
          Regjistrimi Deri
        </label>
        <select
          id="registration-to-year"
          value={selectedToYear || ''}
          onChange={(e) => onToYearChange(e.target.value)}
          className="w-full p-2 border rounded"
          aria-label="Registration to year"
        >
          <option value="">Zgjidhni vitin</option>
          {years.map((year) => (
            <option key={`to-${year}`} value={year.toString()}>
              {year}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
});