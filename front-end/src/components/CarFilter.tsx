import React, { useState, useEffect } from 'react';

interface Make {
  id: number;
  name: string;
}

interface Model {
  id: number;
  name: string;
  make: number;
}

interface FilterProps {
  onFilterChange: (filters: FilterState) => void;
}

interface FilterState {
  make?: string;
  model?: string;
  year?: string;
  min_price?: string;
  max_price?: string;
  bodyType?: string;
  fuelType?: string;
  gearbox?: string;
  max_mileage?: string;
  color?: string;
}

const CarFilter: React.FC<FilterProps> = ({ onFilterChange }) => {
  const [makes, setMakes] = useState<Make[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [filters, setFilters] = useState<FilterState>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Default filter options
  const bodyTypes = ['Sedan', 'SUV', 'Coupe', 'Hatchback', 'Wagon', 'Convertible', 'Van', 'Truck'];
  const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'LPG', 'CNG'];
  const gearboxTypes = ['Manual', 'Automatic'];
  const colors = ['Black', 'White', 'Silver', 'Gray', 'Blue', 'Red', 'Green', 'Brown', 'Yellow', 'Orange'];
  
  const priceRanges = [
    { value: '', label: 'All Prices' },
    { value: '5000', label: '€5,000' },
    { value: '10000', label: '€10,000' },
    { value: '15000', label: '€15,000' },
    { value: '20000', label: '€20,000' },
    { value: '30000', label: '€30,000' },
    { value: '50000', label: '€50,000' },
    { value: '100000', label: '€100,000+' },
  ];

  const mileageRanges = [
    { value: '', label: 'Any Mileage' },
    { value: '10000', label: '10,000 km' },
    { value: '50000', label: '50,000 km' },
    { value: '100000', label: '100,000 km' },
    { value: '150000', label: '150,000 km' },
    { value: '200000', label: '200,000 km' },
  ];

  // Get all makes when component mounts
  useEffect(() => {
    fetchMakes();
  }, []);

  // Get models when make is selected
  useEffect(() => {
    if (filters.make) {
      fetchModels(filters.make);
    } else {
      setModels([]);
      setFilters(prev => ({ ...prev, model: undefined }));
    }
  }, [filters.make]);

  const fetchMakes = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/makes/');
      const data = await response.json();
      setMakes(data);
    } catch (error) {
      console.error('Error fetching makes:', error);
    }
  };

  const fetchModels = async (makeId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/models/${makeId}/`);
      const data = await response.json();
      setModels(data);
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };

  const handleFilterChange = (name: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // Remove empty fields from filters
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
    );
    
    onFilterChange(activeFilters);
  };

  const resetFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Basic Filters */}
        <div>
          <label className="block text-sm font-medium mb-1">Make</label>
          <select
            value={filters.make || ''}
            onChange={(e) => handleFilterChange('make', e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            <option value="">All Makes</option>
            {makes.map((make) => (
              <option key={make.id} value={make.id}>
                {make.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Model</label>
          <select
            value={filters.model || ''}
            onChange={(e) => handleFilterChange('model', e.target.value)}
            className="w-full p-2 border rounded-lg"
            disabled={!filters.make}
          >
            <option value="">All Models</option>
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Year</label>
          <select
            value={filters.year || ''}
            onChange={(e) => handleFilterChange('year', e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            <option value="">All Years</option>
            {years.map((year) => (
              <option key={year} value={year.toString()}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Max Price (€)</label>
          <select
            value={filters.max_price || ''}
            onChange={(e) => handleFilterChange('max_price', e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            {priceRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Toggle for advanced filters */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-blue-600 text-sm font-medium flex items-center"
        >
          {showAdvanced ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
          <svg
            className={`ml-1 w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Body Type</label>
            <select
              value={filters.bodyType || ''}
              onChange={(e) => handleFilterChange('bodyType', e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">Any Body Type</option>
              {bodyTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Fuel Type</label>
            <select
              value={filters.fuelType || ''}
              onChange={(e) => handleFilterChange('fuelType', e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">Any Fuel Type</option>
              {fuelTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Transmission</label>
            <select
              value={filters.gearbox || ''}
              onChange={(e) => handleFilterChange('gearbox', e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">Any Transmission</option>
              {gearboxTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Color</label>
            <select
              value={filters.color || ''}
              onChange={(e) => handleFilterChange('color', e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">Any Color</option>
              {colors.map((color) => (
                <option key={color} value={color.toLowerCase()}>
                  {color}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Max Mileage</label>
            <select
              value={filters.max_mileage || ''}
              onChange={(e) => handleFilterChange('max_mileage', e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              {mileageRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Min Price (€)</label>
            <select
              value={filters.min_price || ''}
              onChange={(e) => handleFilterChange('min_price', e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">No Minimum</option>
              {priceRanges.slice(1).map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button
          onClick={handleSubmit}
          className="flex-grow bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Apply Filters
        </button>
        <button
          onClick={resetFilters}
          className="px-4 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-100"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default CarFilter;