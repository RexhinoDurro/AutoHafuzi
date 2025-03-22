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
      <select
        value={selectedFromYear || ''}
        onChange={(e) => onFromYearChange(e.target.value)}
        className="w-full p-2 border rounded"
      >
        <option value="">Regjistrimi Nga</option>
        {years.map((year) => (
          <option key={`from-${year}`} value={year.toString()}>
            {year}
          </option>
        ))}
      </select>
      
      <select
        value={selectedToYear || ''}
        onChange={(e) => onToYearChange(e.target.value)}
        className="w-full p-2 border rounded"
      >
        <option value="">Regjistrimi Deri</option>
        {years.map((year) => (
          <option key={`to-${year}`} value={year.toString()}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
});