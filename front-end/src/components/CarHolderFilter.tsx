import React, { useState, useEffect } from 'react';
import RangeSlider from './RangeSlider';
import { getLastSearch, saveLastSearch } from '../utils/userActivityService';
import { API_ENDPOINTS } from '../config/api';

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
  hex_code: string;
}

interface Upholstery {
  id: number;
  name: string;
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
  upholstery?: string;
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
  const [upholsteryTypes, setUpholsteryTypes] = useState<Upholstery[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [filters, setFilters] = useState<FilterState>({});
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    make: true,
    price: false,
    details: false,
    exteriorColor: false,
    interior: false,
    upholstery: false,
    options: false
  });
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [groupedOptions, setGroupedOptions] = useState<Record<string, Option[]>>({});
  const [loading, setLoading] = useState({
    makes: false,
    models: false,
    variants: false,
    exteriorColors: false,
    interiorColors: false,
    upholstery: false,
    options: false
  });
  const [showAllFilters, setShowAllFilters] = useState(false);

  // Range slider constants
  const PRICE_MIN = 0;
  const PRICE_MAX = 200000;
  const PRICE_STEP = 1000;

  const MILEAGE_MIN = 0;
  const MILEAGE_MAX = 300000;
  const MILEAGE_STEP = 1000;

  const POWER_MIN = 0;
  const POWER_MAX = 1000;
  const POWER_STEP = 10;

  // Format functions for range sliders
  const formatPrice = (price: number) => `€${price.toLocaleString()}`;
  const formatMileage = (mileage: number) => `${mileage.toLocaleString()} km`;
  const formatPower = (power: number) => `${power} HP`;

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

  // Toggle function for showing all filters
  const toggleShowAllFilters = () => {
    setShowAllFilters(!showAllFilters);
  };

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

  // Initialize filters from URL params or last search
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const initialFilters: FilterState = {};
    const initialSelectedOptions: string[] = [];

    // First check URL parameters
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

    // If no URL parameters, check for saved last search
    if (Object.keys(initialFilters).length === 0) {
      const lastSearch = getLastSearch();
      Object.entries(lastSearch).forEach(([key, value]) => {
        if (key === 'options' && Array.isArray(value)) {
          initialSelectedOptions.push(...value.map(v => v.toString()));
        } else if (value !== null && value !== undefined && value !== '') {
          (initialFilters as any)[key] = value.toString();
        }
      });
    }

    if (initialSelectedOptions.length > 0) {
      initialFilters.options = initialSelectedOptions;
    }

    setFilters(initialFilters);
    setSelectedOptions(initialSelectedOptions);

    // If we have filters from either source, update active filters display
    if (Object.keys(initialFilters).length > 0) {
      const makeId = initialFilters.make;
      if (makeId) {
        fetchModels(makeId.toString());

        const modelId = initialFilters.model;
        if (modelId) {
          fetchVariants(modelId.toString());
        }
      }
    }

    fetchData();
  }, []);

  // Update active filters when data and filters are available
  useEffect(() => {
    updateActiveFilters();
  }, [filters, makes, models, variants, exteriorColors, interiorColors, upholsteryTypes, options]);

  // Fetch all necessary data
  const fetchData = async () => {
    fetchMakes();
    fetchExteriorColors();
    fetchInteriorColors();
    fetchUpholsteryTypes();
    fetchOptions();
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
      setLoading(prev => ({ ...prev, makes: true }));
      const response = await fetch(API_ENDPOINTS.MAKES);
      const data = await response.json();
      setMakes(data);
      setLoading(prev => ({ ...prev, makes: false }));
    } catch (error) {
      console.error('Error fetching makes:', error);
      setLoading(prev => ({ ...prev, makes: false }));
    }
  };

  const fetchModels = async (makeId: string) => {
    try {
      setLoading(prev => ({ ...prev, models: true }));
      const response = await fetch(API_ENDPOINTS.MODELS.LIST_BY_MAKE(makeId));
      const data = await response.json();
      setModels(data);
      setLoading(prev => ({ ...prev, models: false }));
    } catch (error) {
      console.error('Error fetching models:', error);
      setLoading(prev => ({ ...prev, models: false }));
    }
  };

  const fetchVariants = async (modelId: string) => {
    try {
      setLoading(prev => ({ ...prev, variants: true }));
      const response = await fetch(API_ENDPOINTS.VARIANTS.LIST_BY_MODEL(modelId));
      const data = await response.json();
      setVariants(data);
      setLoading(prev => ({ ...prev, variants: false }));
    } catch (error) {
      console.error('Error fetching variants:', error);
      setLoading(prev => ({ ...prev, variants: false }));
    }
  };

  const fetchExteriorColors = async () => {
    try {
      setLoading(prev => ({ ...prev, exteriorColors: true }));
      const response = await fetch(API_ENDPOINTS.EXTERIOR_COLORS);
      const data = await response.json();
      setExteriorColors(data);
      setLoading(prev => ({ ...prev, exteriorColors: false }));
    } catch (error) {
      console.error('Error fetching exterior colors:', error);
      setLoading(prev => ({ ...prev, exteriorColors: false }));
    }
  };

  const fetchInteriorColors = async () => {
    try {
      setLoading(prev => ({ ...prev, interiorColors: true }));
      const response = await fetch(API_ENDPOINTS.INTERIOR_COLORS);
      const data = await response.json();
      setInteriorColors(data);
      setLoading(prev => ({ ...prev, interiorColors: false }));
    } catch (error) {
      console.error('Error fetching interior colors:', error);
      setLoading(prev => ({ ...prev, interiorColors: false }));
    }
  };

  const fetchUpholsteryTypes = async () => {
    try {
      setLoading(prev => ({ ...prev, upholstery: true }));
      const response = await fetch(API_ENDPOINTS.UPHOLSTERY);
      const data = await response.json();
      setUpholsteryTypes(data);
      setLoading(prev => ({ ...prev, upholstery: false }));
    } catch (error) {
      console.error('Error fetching upholstery types:', error);
      setLoading(prev => ({ ...prev, upholstery: false }));
    }
  };

  const fetchOptions = async () => {
    try {
      setLoading(prev => ({ ...prev, options: true }));
      // Try first with /options/list/ endpoint as in CarFilter
      const response = await fetch(API_ENDPOINTS.OPTIONS.LIST);
      if (!response.ok) {
        // Fallback to /options/ endpoint
        const fallbackResponse = await fetch(API_ENDPOINTS.OPTIONS.ADD);
        if (!fallbackResponse.ok) {
          throw new Error('Failed to fetch options');
        }
        const fallbackData = await fallbackResponse.json();
        setOptions(Array.isArray(fallbackData) ? fallbackData : []);
        setLoading(prev => ({ ...prev, options: false }));
        return;
      }
      const data = await response.json();
      setOptions(Array.isArray(data) ? data : []);
      setLoading(prev => ({ ...prev, options: false }));
    } catch (error) {
      console.error('Error fetching options:', error);
      setOptions([]);
      setLoading(prev => ({ ...prev, options: false }));
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
          const make = makes && makes.find(m => m.id.toString() === value);
          if (make) {
            label = `Make: ${make.name}`;
          }
          break;
        case 'model':
          const model = models && models.find(m => m.id.toString() === value);
          if (model) {
            label = `Model: ${model.name}`;
          }
          break;
        case 'variant':
          const variant = variants && variants.find(v => v.id.toString() === value);
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
          const extColor = exteriorColors && exteriorColors.find(c => c.id.toString() === value);
          if (extColor) {
            label = `Exterior Color: ${extColor.name}`;
          } else {
            label = `Exterior Color: ${value}`;
          }
          break;
        case 'interior_color':
          label = `Interior Color: ${value}`;
          break;
        case 'upholstery':
          const upholstery = upholsteryTypes && upholsteryTypes.find(u => u.id.toString() === value);
          if (upholstery) {
            label = `Upholstery: ${upholstery.name}`;
          } else {
            label = `Upholstery: ${value}`;
          }
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

  const handlePriceChange = (min: number, max: number) => {
    setFilters(prev => ({
      ...prev,
      min_price: min === PRICE_MIN ? undefined : min.toString(),
      max_price: max === PRICE_MAX ? undefined : max.toString()
    }));
  };

  const handleMileageChange = (min: number, max: number) => {
    setFilters(prev => ({
      ...prev,
      min_mileage: min === MILEAGE_MIN ? undefined : min.toString(),
      max_mileage: max === MILEAGE_MAX ? undefined : max.toString()
    }));
  };

  const handlePowerChange = (min: number, max: number) => {
    setFilters(prev => ({
      ...prev,
      min_power: min === POWER_MIN ? undefined : min.toString(),
      max_power: max === POWER_MAX ? undefined : max.toString()
    }));
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

    // Save the search parameters for recommendations
    saveLastSearch(activeFilters as any);

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
    <div className="bg-white rounded-lg shadow-md mb-6 max-w-7xl mx-auto">
      {activeFilters.length > 0 && (
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
                    onClick={() => removeFilter(filter.key)}
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
                onClick={toggleShowAllFilters}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center hover:bg-gray-200"
              >
                {showAllFilters ? 'Show less' : `+${activeFilters.length - 3} more`}
              </button>
            )}
            
            <button
              onClick={resetFilters}
              className="text-gray-600 hover:text-gray-800 text-sm underline ml-auto"
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
          <h3 className="text-lg font-semibold">Marka & Modeli</h3>
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
              disabled={loading.makes}
            >
              <option value="">Të gjitha Markat</option>
              {loading.makes ? (
                <option value="" disabled>Duke ngarkuar...</option>
              ) : makes && makes.length > 0 ? (
                makes.map((make) => (
                  <option key={make.id} value={make.id.toString()}>
                    {make.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>Nuk ka marka të disponueshme</option>
              )}
            </select>
            <select
              value={filters.model || ''}
              onChange={(e) => handleFilterChange('model', e.target.value)}
              className="w-full p-2 border rounded"
              disabled={!filters.make || loading.models}
            >
              <option value="">Të gjitha Modelet</option>
              {loading.models ? (
                <option value="" disabled>Duke ngarkuar...</option>
              ) : models && models.length > 0 ? (
                models.map((model) => (
                  <option key={model.id} value={model.id.toString()}>
                    {model.name}
                  </option>
                ))
              ) : filters.make ? (
                <option value="" disabled>Nuk ka modele të disponueshme për këtë markë</option>
              ) : null}
            </select>
            <select
              value={filters.variant || ''}
              onChange={(e) => handleFilterChange('variant', e.target.value)}
              className="w-full p-2 border rounded"
              disabled={!filters.model || loading.variants}
            >
              <option value="">Të gjitha Variantet</option>
              {loading.variants ? (
                <option value="" disabled>Duke ngarkuar...</option>
              ) : variants && variants.length > 0 ? (
                variants.map((variant) => (
                  <option key={variant.id} value={variant.id.toString()}>
                    {variant.name}
                  </option>
                ))
              ) : filters.model ? (
                <option value="" disabled>Nuk ka variante të disponueshme për këtë model</option>
              ) : null}
            </select>
          </div>
        )}
      </div>
  
      {/* Price and Registration Section */}
      <div className="p-4 border-b">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection('price')}
        >
          <h3 className="text-lg font-semibold">Çmimi & Regjistrimi</h3>
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
          <div className="mt-2 space-y-4">
            {/* Price Range Slider */}
            <RangeSlider 
              minValue={PRICE_MIN}
              maxValue={PRICE_MAX}
              step={PRICE_STEP}
              currentMin={filters.min_price ? parseInt(filters.min_price) : PRICE_MIN}
              currentMax={filters.max_price ? parseInt(filters.max_price) : PRICE_MAX}
              label="Çmimi (€)"
              unit="€"
              formatValue={formatPrice}
              onChange={handlePriceChange}
            />
            
            {/* Registration Year */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <select
                value={filters.first_registration_from || ''}
                onChange={(e) => handleFilterChange('first_registration_from', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Regjistrimi Nga</option>
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
                <option value="">Regjistrimi Deri</option>
                {years.map((year) => (
                  <option key={year} value={year.toString()}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
  
      {/* Vehicle Details Section */}
      <div className="p-4 border-b">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection('details')}
        >
          <h3 className="text-lg font-semibold">Detajet e Automjetit</h3>
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
          <div className="mt-2 space-y-4">
            {/* Mileage Range Slider */}
            <RangeSlider 
              minValue={MILEAGE_MIN}
              maxValue={MILEAGE_MAX}
              step={MILEAGE_STEP}
              currentMin={filters.min_mileage ? parseInt(filters.min_mileage) : MILEAGE_MIN}
              currentMax={filters.max_mileage ? parseInt(filters.max_mileage) : MILEAGE_MAX}
              label="Kilometrazhi"
              unit="km"
              formatValue={formatMileage}
              onChange={handleMileageChange}
            />
            
            {/* Power Range Slider */}
            <RangeSlider 
              minValue={POWER_MIN}
              maxValue={POWER_MAX}
              step={POWER_STEP}
              currentMin={filters.min_power ? parseInt(filters.min_power) : POWER_MIN}
              currentMax={filters.max_power ? parseInt(filters.max_power) : POWER_MAX}
              label="Fuqia"
              unit="HP"
              formatValue={formatPower}
              onChange={handlePowerChange}
            />
            
            {/* Other Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={filters.bodyType || ''}
                onChange={(e) => handleFilterChange('bodyType', e.target.value)}
                className="w-full p-1 text-sm border rounded"
              >
                <option value="">Lloji i Karrocerisë</option>
                {bodyTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              
              <select
                value={filters.condition || ''}
                onChange={(e) => handleFilterChange('condition', e.target.value)}
                className="w-full p-1 text-sm border rounded"
              >
                <option value="">Gjendja</option>
                {conditionOptions.map((condition) => (
                  <option key={condition} value={condition.toLowerCase()}>
                    {condition}
                  </option>
                ))}
              </select>
              
              <select
                value={filters.fuel_type || ''}
                onChange={(e) => handleFilterChange('fuel_type', e.target.value)}
                className="w-full p-1 text-sm border rounded"
              >
                <option value="">Lloji i Karburantit</option>
                {fuelTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              
              <select
                value={filters.gearbox || ''}
                onChange={(e) => handleFilterChange('gearbox', e.target.value)}
                className="w-full p-1 text-sm border rounded"
              >
                <option value="">Transmetimi</option>
                {gearboxTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              
              <select
                value={filters.doors || ''}
                onChange={(e) => handleFilterChange('doors', e.target.value)}
                className="w-full p-1 text-sm border rounded"
              >
                <option value="">Dyert</option>
                {doorOptions.map((doors) => (
                  <option key={doors} value={doors.toString()}>
                    {doors}
                  </option>
                ))}
              </select>
              
              <select
                value={filters.seats || ''}
                onChange={(e) => handleFilterChange('seats', e.target.value)}
                className="w-full p-1 text-sm border rounded"
              >
                <option value="">Sedilet</option>
                {seatOptions.map((seats) => (
                  <option key={seats} value={seats.toString()}>
                    {seats}
                  </option>
                ))}
              </select>
              
              <select
                value={filters.emission_class || ''}
                onChange={(e) => handleFilterChange('emission_class', e.target.value)}
                className="w-full p-1 text-sm border rounded"
              >
                <option value="">Klasa e Emisioneve</option>
                {emissionClasses.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
              
              <select
                value={filters.created_since || ''}
                onChange={(e) => handleFilterChange('created_since', e.target.value)}
                className="w-full p-1 text-sm border rounded"
              >
                <option value="">Listuar Që</option>
                {createdSinceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
  
      {/* Exterior Colors Section */}
      <div className="p-3 border-b">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection('exteriorColor')}
        >
          <h3 className="text-base font-semibold">Ngjyrat e Jashtme</h3>
          <svg 
            className={`w-4 h-4 transform transition-transform ${expandedSections.exteriorColor ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
        {expandedSections.exteriorColor && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {loading.exteriorColors ? (
              <div className="col-span-3 text-center py-2 text-sm text-gray-500">Duke ngarkuar ngjyrat...</div>
            ) : exteriorColors && exteriorColors.length > 0 ? (
              exteriorColors.map((color) => (
                <div
                  key={color.id}
                  className={`flex items-center p-2 border rounded cursor-pointer ${
                    filters.exterior_color === color.id.toString() ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => handleFilterChange('exterior_color', color.id.toString())}
                >
                  <div
                    className="w-6 h-6 rounded-full mr-2 border border-gray-200"
                    style={{ backgroundColor: color.hex_code }}
                  ></div>
                  <span className="text-xs">{color.name}</span>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-2 text-sm text-gray-500">Nuk ka ngjyra të jashtme të disponueshme</div>
            )}
            {/* Clear selection option */}
            {filters.exterior_color && (
              <div
                className="flex items-center p-2 border rounded cursor-pointer border-gray-200"
                onClick={() => handleFilterChange('exterior_color', '')}
              >
                <div className="w-6 h-6 rounded-full mr-2 flex items-center justify-center border border-gray-200">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
                <span className="text-xs">Pastro</span>
              </div>
            )}
          </div>
        )}
      </div>
  
      {/* Interior Colors Section */}
      <div className="p-3 border-b">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection('interior')}
        >
          <h3 className="text-base font-semibold">Ngjyra e Brendshme</h3>
          <svg 
            className={`w-4 h-4 transform transition-transform ${expandedSections.interior ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
        {expandedSections.interior && (
          <div className="mt-3 space-y-3">
            {loading.interiorColors ? (
              <div className="text-center py-2 text-sm text-gray-500">Duke ngarkuar ngjyrat...</div>
            ) : interiorColors && interiorColors.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {Array.from(new Set(interiorColors.map(color => color.name))).map((colorName) => (
                  <div
                    key={colorName}
                    className={`p-2 border rounded cursor-pointer ${
                      filters.interior_color === colorName ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => handleFilterChange('interior_color', colorName)}
                  >
                    <span className="block text-xs">{colorName}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-2 text-sm text-gray-500">Nuk ka ngjyra të brendshme të disponueshme</div>
            )}
          </div>
        )}
      </div>
  
      {/* Upholstery Section - New separate section */}
      <div className="p-3 border-b">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection('upholstery')}
        >
          <h3 className="text-base font-semibold">Tapiceria</h3>
          <svg 
            className={`w-4 h-4 transform transition-transform ${expandedSections.upholstery ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
        {expandedSections.upholstery && (
          <div className="mt-3 space-y-3">
            {loading.upholstery ? (
              <div className="text-center py-2 text-sm text-gray-500">Duke ngarkuar tapicerinë...</div>
            ) : upholsteryTypes && upholsteryTypes.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {upholsteryTypes.map((upholstery) => (
                  <div
                    key={upholstery.id}
                    className={`p-2 border rounded cursor-pointer ${
                      filters.upholstery === upholstery.id.toString() ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => handleFilterChange('upholstery', upholstery.id.toString())}
                  >
                    <span className="block text-xs">{upholstery.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-2 text-sm text-gray-500">Nuk ka opsione tapicerie të disponueshme</div>
            )}
          </div>
        )}
      </div>
  
      {/* Options Section */}
      <div className="p-3 border-b">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection('options')}
        >
          <h3 className="text-base font-semibold">Opsionet</h3>
          <svg 
            className={`w-4 h-4 transform transition-transform ${expandedSections.options ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
        {expandedSections.options && (
          <div className="mt-3">
            {loading.options ? (
              <div className="text-center py-4 text-sm text-gray-500">Duke ngarkuar opsionet...</div>
            ) : Object.keys(groupedOptions).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(groupedOptions).map(([category, categoryOptions]) => (
                  <div key={category} className="border p-2 rounded">
                    <h4 className="font-medium mb-2 text-gray-700 text-xs">{category}</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {categoryOptions.map((option) => (
                        <div key={option.id} className="flex items-center bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            id={`option-${option.id}`}
                            checked={selectedOptions.includes(option.id.toString())}
                            onChange={() => handleOptionChange(option.id.toString())}
                            className="mr-2 h-4 w-4"
                          />
                          <label htmlFor={`option-${option.id}`} className="text-xs">
                            {option.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 text-center py-2">Nuk ka opsione të disponueshme</p>
            )}
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="p-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full sm:flex-grow"
        >
          Apliko Filtrat
        </button>
        <button
          onClick={resetFilters}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 w-full sm:w-auto"
        >
          Rivendos
        </button>
      </div>
    </div>
  );
};

export default CarHolderFilter;