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

interface ExteriorColor {
  id: number;
  name: string;
  hex_code: string;
}

interface InteriorColor {
  id: number;
  name: string;
  upholstery: string;
  hex_code: string;
}

interface Option {
  id: number;
  name: string;
  category: string;
  category_display: string;
}

interface FilterProps {
  onFilterChange: (filters: FilterState) => void;
}

interface FilterState {
  make?: string;
  model?: string;
  variant?: string;
  first_registration_from?: string;
  first_registration_to?: string;
  min_price?: string;
  max_price?: string;
  min_mileage?: string;
  max_mileage?: string;
  bodyType?: string;
  min_power?: string;
  max_power?: string;
  gearbox?: string;
  doors?: string;
  seats?: string;
  condition?: string;
  options?: string[];
  exterior_color?: string;
  interior_color?: string;
  interior_upholstery?: string;
  fuel_type?: string;
  emission_class?: string;
  created_since?: string;
}

interface ActiveFilter {
  key: string;
  value: string;
  label: string;
}

const CarHolderFilter: React.FC<FilterProps> = ({ onFilterChange }) => {
  const [makes, setMakes] = useState<Make[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [exteriorColors, setExteriorColors] = useState<ExteriorColor[]>([]);
  const [interiorColors, setInteriorColors] = useState<InteriorColor[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [filters, setFilters] = useState<FilterState>({});
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    make: true,
    price: false,
    details: false,
    exteriorColor: false,
    interior: false,
    options: false
  });
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [groupedOptions, setGroupedOptions] = useState<Record<string, Option[]>>({});

  // Predefined options
  const bodyTypes = ['Sedan', 'SUV', 'Coupe', 'Hatchback', 'Wagon', 'Convertible', 'Van', 'Truck'];
  const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'LPG', 'CNG'];
  const gearboxTypes = ['Manual', 'Automatic'];
  const emissionClasses = ['Euro 6', 'Euro 5', 'Euro 4', 'Euro 3', 'Euro 2', 'Euro 1'];
  const doorOptions = [2, 3, 4, 5];
  const seatOptions = [2, 3, 4, 5, 6, 7, 8, 9];
  const conditionOptions = ['New', 'Used'];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);
  const createdSinceOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: '1week', label: '1 Week' },
    { value: '2weeks', label: '2 Weeks' },
  ];

  const priceRanges = [
    { value: '', label: 'Any Price' },
    { value: '5000', label: '€5,000' },
    { value: '10000', label: '€10,000' },
    { value: '20000', label: '€20,000' },
    { value: '50000', label: '€50,000' },
    { value: '100000', label: '€100,000+' },
  ];

  const powerRanges = [
    { value: '', label: 'Any HP' },
    { value: '100', label: '100 HP' },
    { value: '150', label: '150 HP' },
    { value: '200', label: '200 HP' },
    { value: '250', label: '250 HP' },
    { value: '300', label: '300 HP' },
    { value: '400', label: '400 HP' },
    { value: '500', label: '500 HP+' },
  ];

  const mileageRanges = [
    { value: '', label: 'Any Mileage' },
    { value: '10000', label: '10,000 km' },
    { value: '50000', label: '50,000 km' },
    { value: '100000', label: '100,000 km' },
    { value: '150000', label: '150,000 km' },
    { value: '200000', label: '200,000 km' },
  ];

  // Process options data when it changes
  useEffect(() => {
    if (options && Array.isArray(options) && options.length > 0) {
      const grouped = options.reduce((acc, option) => {
        const category = option.category_display || 'Other';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(option);
        return acc;
      }, {} as Record<string, Option[]>);
      
      setGroupedOptions(grouped);
    }
  }, [options]);

  // Initialize filters from URL params
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const initialFilters: FilterState = {};
    const initialSelectedOptions: string[] = [];

    searchParams.forEach((value, key) => {
      if (key.endsWith('[]')) {
        const baseKey = key.slice(0, -2);
        if (baseKey === 'options') {
          initialSelectedOptions.push(value);
        }
      } else {
        (initialFilters as any)[key] = value;
      }
    });

    if (initialSelectedOptions.length > 0) {
      initialFilters.options = initialSelectedOptions;
    }

    setFilters(initialFilters);
    setSelectedOptions(initialSelectedOptions);
    fetchData();
  }, []);

  // Update active filters when data and filters are available
  useEffect(() => {
    updateActiveFilters();
  }, [filters, makes, models, variants, exteriorColors, interiorColors, options]);

  // Fetch all necessary data
  const fetchData = async () => {
    fetchMakes();
    fetchExteriorColors();
    fetchInteriorColors();
    fetchOptions();
    
    // If make is in URL, fetch models
    const urlParams = new URLSearchParams(window.location.search);
    const makeId = urlParams.get('make');
    if (makeId) {
      fetchModels(makeId);
      
      // If model is in URL, fetch variants
      const modelId = urlParams.get('model');
      if (modelId) {
        fetchVariants(modelId);
      }
    }
  };

  // Get models when make is selected
  useEffect(() => {
    if (filters.make) {
      fetchModels(filters.make);
    } else {
      setModels([]);
      setVariants([]);
      setFilters(prev => ({ ...prev, model: undefined, variant: undefined }));
    }
  }, [filters.make]);

  // Get variants when model is selected
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

  const fetchExteriorColors = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/exterior-colors/');
      const data = await response.json();
      setExteriorColors(data);
    } catch (error) {
      console.error('Error fetching exterior colors:', error);
    }
  };

  const fetchInteriorColors = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/interior-colors/');
      const data = await response.json();
      setInteriorColors(data);
    } catch (error) {
      console.error('Error fetching interior colors:', error);
    }
  };

  const fetchOptions = async () => {
    try {
      // Try first with /options/list/ endpoint as in CarFilter
      const response = await fetch('http://localhost:8000/api/options/list/');
      if (!response.ok) {
        // Fallback to /options/ endpoint
        const fallbackResponse = await fetch('http://localhost:8000/api/options/');
        if (!fallbackResponse.ok) {
          throw new Error('Failed to fetch options');
        }
        const fallbackData = await fallbackResponse.json();
        setOptions(Array.isArray(fallbackData) ? fallbackData : []);
        return;
      }
      const data = await response.json();
      setOptions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching options:', error);
      setOptions([]);
    }
  };

  // Update the active filters display
  const updateActiveFilters = () => {
    const newActiveFilters: ActiveFilter[] = [];

    Object.entries(filters).forEach(([key, value]) => {
      if (!value || (Array.isArray(value) && value.length === 0)) {
        return;
      }

      let label = '';

      switch (key) {
        case 'make':
          const make = makes.find(m => m.id.toString() === value);
          if (make) {
            label = `Make: ${make.name}`;
          }
          break;
        case 'model':
          const model = models.find(m => m.id.toString() === value);
          if (model) {
            label = `Model: ${model.name}`;
          }
          break;
        case 'variant':
          const variant = variants.find(v => v.id.toString() === value);
          if (variant) {
            label = `Variant: ${variant.name}`;
          }
          break;
        case 'first_registration_from':
          label = `Year From: ${value}`;
          break;
        case 'first_registration_to':
          label = `Year To: ${value}`;
          break;
        case 'min_price':
          label = `Min Price: €${parseInt(value).toLocaleString()}`;
          break;
        case 'max_price':
          label = `Max Price: €${parseInt(value).toLocaleString()}`;
          break;
        case 'min_mileage':
          label = `Min Mileage: ${parseInt(value).toLocaleString()} km`;
          break;
        case 'max_mileage':
          label = `Max Mileage: ${parseInt(value).toLocaleString()} km`;
          break;
        case 'bodyType':
          label = `Body Type: ${value}`;
          break;
        case 'min_power':
          label = `Min Power: ${value} HP`;
          break;
        case 'max_power':
          label = `Max Power: ${value} HP`;
          break;
        case 'gearbox':
          label = `Transmission: ${value}`;
          break;
        case 'doors':
          label = `Doors: ${value}`;
          break;
        case 'seats':
          label = `Seats: ${value}`;
          break;
        case 'condition':
          label = `Condition: ${value.charAt(0).toUpperCase() + value.slice(1)}`;
          break;
        case 'exterior_color':
          const extColor = exteriorColors.find(c => c.id.toString() === value);
          if (extColor) {
            label = `Exterior Color: ${extColor.name}`;
          } else {
            label = `Exterior Color: ${value}`;
          }
          break;
        case 'interior_color':
          label = `Interior Color: ${value}`;
          break;
        case 'interior_upholstery':
          label = `Upholstery: ${value}`;
          break;
        case 'fuel_type':
          label = `Fuel Type: ${value}`;
          break;
        case 'emission_class':
          label = `Emission Class: ${value}`;
          break;
        case 'created_since':
          const createdOption = createdSinceOptions.find(o => o.value === value);
          if (createdOption) {
            label = `Online Since: ${createdOption.label}`;
          }
          break;
        case 'options':
          if (Array.isArray(value)) {
            value.forEach(optionId => {
              const option = options.find(o => o.id.toString() === optionId);
              if (option) {
                newActiveFilters.push({
                  key: `options-${optionId}`,
                  value: optionId,
                  label: `Option: ${option.name}`
                });
              }
            });
            return; // Skip adding options to avoid duplicates
          }
          break;
        default:
          label = `${key}: ${value}`;
      }

      if (label) {
        newActiveFilters.push({ key, value: value as string, label });
      }
    });

    setActiveFilters(newActiveFilters);
  };

  const handleFilterChange = (name: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleOptionChange = (optionId: string) => {
    setSelectedOptions(prev => {
      if (prev.includes(optionId)) {
        return prev.filter(id => id !== optionId);
      } else {
        return [...prev, optionId];
      }
    });
  };

  const removeFilter = (key: string) => {
    if (key.startsWith('options-')) {
      const optionId = key.split('-')[1];
      setSelectedOptions(prev => prev.filter(id => id !== optionId));
      
      // Update filters.options as well
      setFilters(prev => ({
        ...prev,
        options: prev.options?.filter(id => id !== optionId)
      }));
    } else {
      setFilters(prev => ({ ...prev, [key]: undefined }));
    }
    
    // Update URL
    updateUrl();
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSubmit = () => {
    // Add selected options to filters
    const filtersWithOptions = {
      ...filters,
      options: selectedOptions.length > 0 ? selectedOptions : undefined
    };
    
    // Remove empty fields from filters
    const activeFilters = Object.fromEntries(
      Object.entries(filtersWithOptions).filter(([_, value]) => {
        if (Array.isArray(value)) {
          return value.length > 0;
        }
        return value !== undefined && value !== '';
      })
    );
    
    // Update URL
    updateUrl();
    
    onFilterChange(activeFilters as FilterState);
  };

  const updateUrl = () => {
    const searchParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        if (key === 'options' && Array.isArray(value)) {
          value.forEach(v => searchParams.append(`${key}[]`, v));
        } else {
          searchParams.set(key, value as string);
        }
      }
    });
    
    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
    window.history.pushState({}, '', newUrl);
  };

  const resetFilters = () => {
    setFilters({});
    setSelectedOptions([]);
    setActiveFilters([]);
    window.history.pushState({}, '', window.location.pathname);
    onFilterChange({});
  };

  return (
    <div className="bg-white rounded-lg shadow-md mb-6">
      {/* Active Filters Section */}
      {activeFilters.length > 0 && (
        <div className="p-4 border-b">
          <h3 className="font-semibold mb-2">Applied Filters</h3>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <div
                key={filter.key}
                className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center"
              >
                <span>{filter.label}</span>
                <button
                  onClick={() => removeFilter(filter.key)}
                  className="ml-2 text-blue-500 hover:text-blue-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            ))}
            <button
              onClick={resetFilters}
              className="text-gray-600 hover:text-gray-800 text-sm underline"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Make and Model Section */}
      <div className="p-4 border-b">
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
            <select
              value={filters.variant || ''}
              onChange={(e) => handleFilterChange('variant', e.target.value)}
              className="w-full p-2 border rounded"
              disabled={!filters.model}
            >
              <option value="">All Variants</option>
              {variants.map((variant) => (
                <option key={variant.id} value={variant.id.toString()}>
                  {variant.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Registration & Price Section */}
      <div className="p-4 border-b">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection('price')}
        >
          <h3 className="text-lg font-semibold">Registration & Price</h3>
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
          <div className="mt-2 space-y-2 grid grid-cols-1 md:grid-cols-2 gap-2">
            <select
              value={filters.first_registration_from || ''}
              onChange={(e) => handleFilterChange('first_registration_from', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Registration From</option>
              {years.map((year) => (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              ))}
            </select>
            <select
              value={filters.first_registration_to || ''}
              onChange={(e) => handleFilterChange('first_registration_to', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Registration To</option>
              {years.map((year) => (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              ))}
            </select>
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
              {priceRanges.slice(1).map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Additional Details Section */}
      <div className="p-4 border-b">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection('details')}
        >
          <h3 className="text-lg font-semibold">Vehicle Details</h3>
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
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
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
              value={filters.condition || ''}
              onChange={(e) => handleFilterChange('condition', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Condition</option>
              {conditionOptions.map((condition) => (
                <option key={condition} value={condition.toLowerCase()}>
                  {condition}
                </option>
              ))}
            </select>
            <select
              value={filters.min_mileage || ''}
              onChange={(e) => handleFilterChange('min_mileage', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Min Mileage</option>
              {mileageRanges.slice(1).map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
            <select
              value={filters.max_mileage || ''}
              onChange={(e) => handleFilterChange('max_mileage', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Max Mileage</option>
              {mileageRanges.slice(1).map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
            <select
              value={filters.min_power || ''}
              onChange={(e) => handleFilterChange('min_power', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Min Power</option>
              {powerRanges.slice(1).map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
            <select
              value={filters.max_power || ''}
              onChange={(e) => handleFilterChange('max_power', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Max Power</option>
              {powerRanges.slice(1).map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
            <select
              value={filters.fuel_type || ''}
              onChange={(e) => handleFilterChange('fuel_type', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Fuel Type</option>
              {fuelTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              value={filters.emission_class || ''}
              onChange={(e) => handleFilterChange('emission_class', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Emission Class</option>
              {emissionClasses.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
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
            <select
              value={filters.doors || ''}
              onChange={(e) => handleFilterChange('doors', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Doors</option>
              {doorOptions.map((doors) => (
                <option key={doors} value={doors.toString()}>
                  {doors}
                </option>
              ))}
            </select>
            <select
              value={filters.seats || ''}
              onChange={(e) => handleFilterChange('seats', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Seats</option>
              {seatOptions.map((seats) => (
                <option key={seats} value={seats.toString()}>
                  {seats}
                </option>
              ))}
            </select>
            <select
              value={filters.created_since || ''}
              onChange={(e) => handleFilterChange('created_since', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Listed Since</option>
              {createdSinceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Exterior Colors Section */}
      <div className="p-4 border-b">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection('exteriorColor')}
        >
          <h3 className="text-lg font-semibold">Exterior Colors</h3>
          <svg 
            className={`w-5 h-5 transform transition-transform ${expandedSections.exteriorColor ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
        {expandedSections.exteriorColor && (
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {exteriorColors.map((color) => (
              <div
                key={color.id}
                className={`flex flex-col items-center p-2 border rounded-lg cursor-pointer ${
                  filters.exterior_color === color.id.toString() ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => handleFilterChange('exterior_color', color.id.toString())}
              >
                <div
                  className="w-8 h-8 rounded-full mb-1"
                  style={{ backgroundColor: color.hex_code }}
                ></div>
                <span className="text-xs text-center">{color.name}</span>
              </div>
            ))}
            {/* Clear selection option */}
            {filters.exterior_color && (
              <div
                className="flex flex-col items-center p-2 border rounded-lg cursor-pointer border-gray-200"
                onClick={() => handleFilterChange('exterior_color', '')}
              >
                <div className="w-8 h-8 rounded-full mb-1 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
                <span className="text-xs text-center">Clear</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Interior Colors Section */}
      <div className="p-4 border-b">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection('interior')}
        >
          <h3 className="text-lg font-semibold">Interior</h3>
          <svg 
            className={`w-5 h-5 transform transition-transform ${expandedSections.interior ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
        {expandedSections.interior && (
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Interior Color</label>
              <select
                value={filters.interior_color || ''}
                onChange={(e) => handleFilterChange('interior_color', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Any Interior Color</option>
                {Array.from(new Set(interiorColors.map(color => color.name))).map((colorName) => (
                  <option key={colorName} value={colorName}>
                    {colorName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Upholstery</label>
              <select
                value={filters.interior_upholstery || ''}
                onChange={(e) => handleFilterChange('interior_upholstery', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Any Upholstery</option>
                {Array.from(new Set(interiorColors.map(color => color.upholstery))).map((upholstery) => (
                  <option key={upholstery} value={upholstery}>
                    {upholstery}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Options Section */}
      <div className="p-4 border-b">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection('options')}
        >
          <h3 className="text-lg font-semibold">Options</h3>
          <svg 
            className={`w-5 h-5 transform transition-transform ${expandedSections.options ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
        {expandedSections.options && (
          <div className="mt-4">
            {Object.keys(groupedOptions).length > 0 ? (
              Object.entries(groupedOptions).map(([category, categoryOptions]) => (
                <div key={category} className="mb-4">
                  <h4 className="font-medium mb-2 text-gray-700">{category}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                    {categoryOptions.map((option) => (
                      <div key={option.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`option-${option.id}`}
                          checked={selectedOptions.includes(option.id.toString())}
                          onChange={() => handleOptionChange(option.id.toString())}
                          className="mr-2 h-4 w-4"
                        />
                        <label htmlFor={`option-${option.id}`} className="text-sm">
                          {option.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">Loading options...</p>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-4 flex space-x-2">
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex-grow"
        >
          Apply Filters
        </button>
        <button
          onClick={resetFilters}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default CarHolderFilter;