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

interface Variant {
  id: number;
  name: string;
  model: number;
}

interface FilterProps {
  onFilterChange: (filters: FilterState) => void;
}

interface FilterState {
  make?: string;
  model?: string;
  variant?: string;
  year?: string;
  min_price?: string;
  max_price?: string;
  bodyType?: string;
  fuelType?: string;
  gearbox?: string;
  max_mileage?: string;
  color?: string;
}

const CarHolderFilter: React.FC<FilterProps> = ({ onFilterChange }) => {
  const [makes, setMakes] = useState<Make[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [filters, setFilters] = useState<FilterState>({});
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    make: true,
    price: false,
    details: false
  });

  // Predefined options
  const bodyTypes = ['Sedan', 'SUV', 'Coupe', 'Hatchback', 'Wagon', 'Convertible', 'Van', 'Truck'];
  const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'LPG', 'CNG'];
  const gearboxTypes = ['Manual', 'Automatic'];
  const colors = ['Black', 'White', 'Silver', 'Gray', 'Blue', 'Red', 'Green', 'Brown', 'Yellow', 'Orange'];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  const priceRanges = [
    { value: '', label: 'Any Price' },
    { value: '5000', label: '€5,000' },
    { value: '10000', label: '€10,000' },
    { value: '20000', label: '€20,000' },
    { value: '50000', label: '€50,000' },
    { value: '100000', label: '€100,000+' },
  ];

  // Fetch and filter logic (similar to previous filter)
  useEffect(() => {
    fetchMakes();
  }, []);

  useEffect(() => {
    if (filters.make) {
      fetchModels(filters.make);
    } else {
      setModels([]);
      setVariants([]);
      setFilters(prev => ({ ...prev, model: undefined, variant: undefined }));
    }
  }, [filters.make]);

  useEffect(() => {
    if (filters.model) {
      fetchVariants(filters.model);
    } else {
      setVariants([]);
      setFilters(prev => ({ ...prev, variant: undefined }));
    }
  }, [filters.model]);

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

  const fetchVariants = async (modelId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/variants/${modelId}/`);
      const data = await response.json();
      setVariants(data);
    } catch (error) {
      console.error('Error fetching variants:', error);
    }
  };

  const handleFilterChange = (name: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSubmit = () => {
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
    );
    
    onFilterChange(activeFilters);
  };

  const resetFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
      {/* Make and Model Section */}
      <div className="border-b pb-4">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection('make')}
        >
          <h3 className="text-lg font-semibold">Make & Model</h3>
          <svg 
            className={`w-5 h-5 transform transition-transform ${expandedSections.make ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
        {expandedSections.make && (
          <div className="mt-2 space-y-2">
            <select
              value={filters.make || ''}
              onChange={(e) => handleFilterChange('make', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">All Makes</option>
              {makes.map((make) => (
                <option key={make.id} value={make.id.toString()}>
                  {make.name}
                </option>
              ))}
            </select>
            <select
              value={filters.model || ''}
              onChange={(e) => handleFilterChange('model', e.target.value)}
              className="w-full p-2 border rounded"
              disabled={!filters.make}
            >
              <option value="">All Models</option>
              {models.map((model) => (
                <option key={model.id} value={model.id.toString()}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Price Section */}
      <div className="border-b pb-4">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection('price')}
        >
          <h3 className="text-lg font-semibold">Price Range</h3>
          <svg 
            className={`w-5 h-5 transform transition-transform ${expandedSections.price ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
        {expandedSections.price && (
          <div className="mt-2 space-y-2">
            <select
              value={filters.min_price || ''}
              onChange={(e) => handleFilterChange('min_price', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Min Price</option>
              {priceRanges.slice(1).map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
            <select
              value={filters.max_price || ''}
              onChange={(e) => handleFilterChange('max_price', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Max Price</option>
              {priceRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Additional Details Section */}
      <div>
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection('details')}
        >
          <h3 className="text-lg font-semibold">Additional Details</h3>
          <svg 
            className={`w-5 h-5 transform transition-transform ${expandedSections.details ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
        {expandedSections.details && (
          <div className="mt-2 space-y-2">
            <select
              value={filters.bodyType || ''}
              onChange={(e) => handleFilterChange('bodyType', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Body Type</option>
              {bodyTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              value={filters.fuelType || ''}
              onChange={(e) => handleFilterChange('fuelType', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Fuel Type</option>
              {fuelTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              value={filters.gearbox || ''}
              onChange={(e) => handleFilterChange('gearbox', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Transmission</option>
              {gearboxTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button 
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Apply Filters
        </button>
        <button 
          onClick={resetFilters}
          className="w-full bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300 transition"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default CarHolderFilter;