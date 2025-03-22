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

const CarFilter: React.FC<FilterProps> = ({ onFilterChange }) => {
  const [makes, setMakes] = useState<Make[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [exteriorColors, setExteriorColors] = useState<ExteriorColor[]>([]);
  const [interiorColors, setInteriorColors] = useState<InteriorColor[]>([]);
  const [upholsteryTypes, setUpholsteryTypes] = useState<Upholstery[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [filters, setFilters] = useState<FilterState>({});
  const [showDetails, setShowDetails] = useState(false);
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

  // Get current year for registration date ranges
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

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
  const formatPower = (power: number) => `${power} KF`;

  // Default filter options
  const bodyTypes = ['Sedan', 'SUV', 'Coupe', 'Hatchback', 'Wagon', 'Convertible', 'Van', 'Truck'];
  const fuelTypes = ['Benzinë', 'Naftë', 'Elektrik', 'Hibrid', 'LPG', 'CNG'];
  const gearboxTypes = ['Manual', 'Automatik'];
  const emissionClasses = ['Euro 6', 'Euro 5', 'Euro 4', 'Euro 3', 'Euro 2', 'Euro 1'];
  const doorOptions = [2, 3, 4, 5];
  const seatOptions = [2, 3, 4, 5, 6, 7, 8, 9];
  const conditionOptions = ['E Re', 'E Përdorur'];
  const createdSinceOptions = [
    { value: 'today', label: 'Sot' },
    { value: 'yesterday', label: 'Dje' },
    { value: '1week', label: '1 Javë' },
    { value: '2weeks', label: '2 Javë' },
  ];

  // Initialize from last search if available
  useEffect(() => {
    // Check if we have any URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.toString()) {
      // If URL has parameters, don't apply last search
      return;
    }
    
    // Check for saved last search
    const lastSearch = getLastSearch();
    if (Object.keys(lastSearch).length > 0) {
      const newFilters = { ...filters };
      
      Object.entries(lastSearch).forEach(([key, value]) => {
        if (key === 'options' && Array.isArray(value)) {
          setSelectedOptions(value.map(v => v.toString()));
        } else if (value !== null && value !== undefined && value !== '') {
          (newFilters as any)[key] = value.toString();
          
          // If make is selected, fetch associated models
          if (key === 'make') {
            fetchModels(value.toString());
            
            // If model is also selected, fetch variants
            if (lastSearch.model) {
              fetchVariants(lastSearch.model.toString());
            }
          }
        }
      });
      
      setFilters(newFilters);
    }
  }, []);

  // Process options data when it changes
  useEffect(() => {
    if (options && Array.isArray(options) && options.length > 0) {
      const grouped = options.reduce((acc, option) => {
        const category = option.category_display || 'Tjetër';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(option);
        return acc;
      }, {} as Record<string, Option[]>);
      
      setGroupedOptions(grouped);
    }
  }, [options]);

  // Fetch data on component mount
  useEffect(() => {
    fetchMakes();
    fetchExteriorColors();
    fetchInteriorColors();
    fetchUpholsteryTypes();
    fetchOptions();
  }, []);

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
      if (!response.ok) throw new Error('Failed to fetch makes');
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
      if (!response.ok) throw new Error('Failed to fetch models');
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
      if (!response.ok) throw new Error('Failed to fetch variants');
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
      if (!response.ok) throw new Error('Failed to fetch exterior colors');
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
      if (!response.ok) throw new Error('Failed to fetch interior colors');
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
      if (!response.ok) throw new Error('Failed to fetch upholstery types');
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
      const response = await fetch(API_ENDPOINTS.OPTIONS.LIST);
      if (!response.ok) {
        throw new Error(`Failed to fetch options: ${response.status}`);
      }
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setOptions(data);
      } else {
        console.error('Options data is not an array:', data);
        setOptions([]);
      }
      setLoading(prev => ({ ...prev, options: false }));
    } catch (error) {
      console.error('Error fetching options:', error);
      setOptions([]);
      setLoading(prev => ({ ...prev, options: false }));
    }
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
    
    // Update URL with query parameters
    const searchParams = new URLSearchParams();
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(`${key}[]`, v));
      } else {
        searchParams.set(key, value as string);
      }
    });
    
    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
    window.history.pushState({}, '', newUrl);
    
    onFilterChange(activeFilters as FilterState);
  };

  const resetFilters = () => {
    setFilters({});
    setSelectedOptions([]);
    onFilterChange({});
    window.history.pushState({}, '', window.location.pathname);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-bold mb-4">Gjej Makinën Tënde të Përsosur</h2>
      
      {/* Basic Search Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Make, Model, Variant */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Marka</label>
            <select
              value={filters.make || ''}
              onChange={(e) => handleFilterChange('make', e.target.value)}
              className="w-full p-2 border rounded-lg"
              disabled={loading.makes}
            >
              <option value="">Të gjitha markat</option>
              {loading.makes ? (
                <option value="" disabled>Duke ngarkuar...</option>
              ) : makes.length > 0 ? (
                makes.map((make) => (
                  <option key={make.id} value={make.id}>
                    {make.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>Nuk ka marka të disponueshme</option>
              )}
            </select>
          </div>
  
          <div>
            <label className="block text-sm font-medium mb-1">Modeli</label>
            <select
              value={filters.model || ''}
              onChange={(e) => handleFilterChange('model', e.target.value)}
              className="w-full p-2 border rounded-lg"
              disabled={!filters.make || loading.models}
            >
              <option value="">Të gjitha modelet</option>
              {loading.models ? (
                <option value="" disabled>Duke ngarkuar...</option>
              ) : models.length > 0 ? (
                models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))
              ) : filters.make ? (
                <option value="" disabled>Nuk ka modele të disponueshme për këtë markë</option>
              ) : null}
            </select>
          </div>
  
          <div>
            <label className="block text-sm font-medium mb-1">Varianti</label>
            <select
              value={filters.variant || ''}
              onChange={(e) => handleFilterChange('variant', e.target.value)}
              className="w-full p-2 border rounded-lg"
              disabled={!filters.model || loading.variants}
            >
              <option value="">Të gjitha variantet</option>
              {loading.variants ? (
                <option value="" disabled>Duke ngarkuar...</option>
              ) : variants.length > 0 ? (
                variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.name}
                  </option>
                ))
              ) : filters.model ? (
                <option value="" disabled>Nuk ka variante të disponueshme për këtë model</option>
              ) : null}
            </select>
          </div>
        </div>
  
        {/* First Registration From/To */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Regjistrimi i parë nga</label>
            <select
              value={filters.first_registration_from || ''}
              onChange={(e) => handleFilterChange('first_registration_from', e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">Të gjitha vitet</option>
              {years.map((year) => (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              ))}
            </select>
          </div>
  
          <div>
            <label className="block text-sm font-medium mb-1">Regjistrimi i parë deri</label>
            <select
              value={filters.first_registration_to || ''}
              onChange={(e) => handleFilterChange('first_registration_to', e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">Të gjitha vitet</option>
              {years.map((year) => (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
  
        {/* Price Range Slider */}
        <div className="space-y-3">
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
        </div>
      </div>
  
      {/* Show/Hide Detailed Search Button */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="text-blue-600 text-sm font-medium flex items-center"
        >
          {showDetails ? 'Fshih kërkimin e detajuar' : 'Shfaq kërkimin e detajuar'}
          <svg
            className={`ml-1 w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
      </div>
  
      {/* Detailed Search */}
      {showDetails && (
        <div className="space-y-6">
          {/* Mileage, Body Type, Power */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Detajet e Automjetit</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Mileage Range Slider */}
              <div className="md:col-span-2">
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
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Lloji i karrocerisë</label>
                <select
                  value={filters.bodyType || ''}
                  onChange={(e) => handleFilterChange('bodyType', e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Të gjitha llojet e karocerive</option>
                  {bodyTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Power Range Slider */}
              <div className="md:col-span-2">
                <RangeSlider 
                  minValue={POWER_MIN}
                  maxValue={POWER_MAX}
                  step={POWER_STEP}
                  currentMin={filters.min_power ? parseInt(filters.min_power) : POWER_MIN}
                  currentMax={filters.max_power ? parseInt(filters.max_power) : POWER_MAX}
                  label="Fuqia"
                  unit="KF"
                  formatValue={formatPower}
                  onChange={handlePowerChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Transmisioni</label>
                <select
                  value={filters.gearbox || ''}
                  onChange={(e) => handleFilterChange('gearbox', e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Të gjitha transmisionet</option>
                  {gearboxTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Dyert</label>
                <select
                  value={filters.doors || ''}
                  onChange={(e) => handleFilterChange('doors', e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Të gjitha dyerte</option>
                  {doorOptions.map((doors) => (
                    <option key={doors} value={doors.toString()}>
                      {doors}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Ndenjëset</label>
                <select
                  value={filters.seats || ''}
                  onChange={(e) => handleFilterChange('seats', e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Të gjitha ndenjëset</option>
                  {seatOptions.map((seats) => (
                    <option key={seats} value={seats.toString()}>
                      {seats}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Gjendja</label>
                <select
                  value={filters.condition || ''}
                  onChange={(e) => handleFilterChange('condition', e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Të gjitha gjendjet</option>
                  {conditionOptions.map((condition, index) => (
                    <option key={condition} value={['new', 'used'][index]}>
                      {condition}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
  
          {/* Options Section */}
          {Object.keys(groupedOptions).length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Opsionet</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(groupedOptions).map(([category, categoryOptions]) => (
                  <div key={category} className="border p-3 rounded-lg">
                    <h4 className="font-medium mb-2">{category}</h4>
                    <div className="space-y-1">
                      {categoryOptions.map((option) => (
                        <div key={option.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`option-${option.id}`}
                            checked={selectedOptions.includes(option.id.toString())}
                            onChange={() => handleOptionChange(option.id.toString())}
                            className="mr-2"
                          />
                          <label htmlFor={`option-${option.id}`} className="text-sm">
                            {option.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
  
          {/* Exterior Color Section */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Ngjyra e Jashtme</h3>
            {loading.exteriorColors ? (
              <p className="text-sm text-gray-500">Duke ngarkuar ngjyrat...</p>
            ) : exteriorColors.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
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
                    <span className="text-xs text-center">Pastro</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Nuk ka ngjyra të disponueshme</p>
            )}
          </div>
  
          {/* Interior Color Section */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Ngjyra e Brendshme</h3>
            {loading.interiorColors ? (
              <p className="text-sm text-gray-500">Duke ngarkuar ngjyrat...</p>
            ) : interiorColors.length > 0 ? (
              <div>
                <select
                  value={filters.interior_color || ''}
                  onChange={(e) => handleFilterChange('interior_color', e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Të gjitha ngjyrë interiori</option>
                  {/* Group interior colors by name */}
                  {Array.from(new Set(interiorColors.map(color => color.name))).map((colorName) => (
                    <option key={colorName} value={colorName}>
                      {colorName}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Nuk ka ngjyra të disponueshme</p>
            )}
          </div>
  
          {/* Upholstery Section - New separate section */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Tapiceria</h3>
            {loading.upholstery ? (
              <p className="text-sm text-gray-500">Duke ngarkuar tapiceritë...</p>
            ) : upholsteryTypes.length > 0 ? (
              <div>
                <select
                  value={filters.upholstery || ''}
                  onChange={(e) => handleFilterChange('upholstery', e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Të gjitha tapiceri</option>
                  {upholsteryTypes.map((upholstery) => (
                    <option key={upholstery.id} value={upholstery.id.toString()}>
                      {upholstery.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Nuk ka tapiceri të disponueshme</p>
            )}
          </div>
  
          {/* Fuel Section */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Karburanti</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Lloji i karburantit</label>
                <select
                  value={filters.fuel_type || ''}
                  onChange={(e) => handleFilterChange('fuel_type', e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Të gjitha llojet e  karburanteve</option>
                  {fuelTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Klasa e emetimeve</label>
                <select
                  value={filters.emission_class || ''}
                  onChange={(e) => handleFilterChange('emission_class', e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Të gjitha klasat e emetimeve</option>
                  {emissionClasses.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
  
          {/* Offer Details Section */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Detajet e ofertës</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Online që prej</label>
              <select
                value={filters.created_since || ''}
                onChange={(e) => handleFilterChange('created_since', e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Të gjitha kohët</option>
                {createdSinceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
  
      {/* Action Buttons */}
      <div className="mt-6 flex gap-2">
        <button
          onClick={handleSubmit}
          className="flex-grow bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Apliko filtrat
        </button>
        <button
          onClick={resetFilters}
          className="px-4 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-100"
        >
          Rivendos
        </button>
      </div>
    </div>
  );
}
  export default CarFilter