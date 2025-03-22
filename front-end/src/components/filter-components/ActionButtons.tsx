// src/components/filter-components/ActionButtons.tsx
import { memo } from 'react';

interface ActionButtonsProps {
  onApply: () => void;
  onReset: () => void;
}

/**
 * Component for filter action buttons
 */
export const ActionButtons = memo(({
  onApply,
  onReset
}: ActionButtonsProps) => {
  return (
    <div className="p-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
      <button
        onClick={onApply}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full sm:flex-grow"
      >
        Apliko Filtrat
      </button>
      <button
        onClick={onReset}
        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 w-full sm:w-auto"
      >
        Rivendos
      </button>
    </div>
  );
});