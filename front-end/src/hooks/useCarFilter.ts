// src/hooks/useCarFilter.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { API_ENDPOINTS } from '../config/api';

// Simple cache implementation
const apiCache = new Map<string, any>();

/**
 * Helper function to fetch data with caching
 */
const fetchWithCache = async (key: string, fetchFn: () => Promise<any>) => {
  if (apiCache.has(key)) {
    return apiCache.get(key);
  }
  
  try {
    const data = await fetchFn();
    apiCache.set(key, data);
    return data;
  } catch (error) {
    console.error(`Error fetching data for ${key}:`, error);
    throw error;
  }
};

// Define all types
export interface FilterState {
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

export interface Make {
  id: number;
  name: string;
}

export interface Model {
  id: number;
  name: string;
  make: number;
}

export interface Variant {
  id: number;
  name: string;
  model: number;
}

export interface ExteriorColor {
  id: number;
  name: string;
  hex_code: string;
}

export interface InteriorColor {
  id: number;
  name: string;
  hex_code: string;
}

export interface Upholstery {
  id: number;
  name: string;
}

export interface Option {
  id: number;
  name: string;
  category: string;
  category_display: string;
}

export interface ActiveFilter {
  key: string;
  value: string;
  label: string;
}

export interface UseCarFilterProps {
  onInitialLoad?: (filters: FilterState) => void;
  useBrowserStorage?: boolean; // Use IndexedDB or localStorage
}

// Constants (moved outside of hook to prevent recreation)
const PRICE_MIN = 0;
const PRICE_MAX = 200000;
const PRICE_STEP = 1000;

const MILEAGE_MIN = 0;
const MILEAGE_MAX = 300000;
const MILEAGE_STEP = 1000;

const POWER_MIN = 0;
const POWER_MAX = 1000;
const POWER_STEP = 10;

// Predefined options moved outside to prevent recreation
const BODY_TYPES = ['Sedan', 'SUV', 'Coupe', 'Hatchback', 'Wagon', 'Convertible', 'Van', 'Truck'];
const FUEL_TYPES = ['Benzinë', 'Naftë', 'Elektrik', 'Hibrid', 'LPG', 'CNG'];
const GEARBOX_TYPES = ['Manual', 'Automatik'];
const EMISSION_CLASSES = ['Euro 6', 'Euro 5', 'Euro 4', 'Euro 3', 'Euro 2', 'Euro 1'];
const DOOR_OPTIONS = [2, 3, 4, 5];
const SEAT_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 9];
const CONDITION_OPTIONS = ['E Re', 'E Përdorur'];
const CREATED_SINCE_OPTIONS = [
  { value: 'today', label: 'Sot' },
  { value: 'yesterday', label: 'Dje' },
  { value: '1week', label: '1 Javë' },
  { value: '2weeks', label: '2 Javë' },
];

// Helper to generate years once
const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 30 }, (_, i) => currentYear - i);
};
const YEARS = generateYearOptions();

/**
 * Custom hook for car filters functionality with optimizations
 */
export function useCarFilter({ onInitialLoad, useBrowserStorage = false }: UseCarFilterProps = {}) {
  // State definitions
  const [filters, setFilters] = useState<FilterState>({});
  const [makes, setMakes] = useState<Make[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [exteriorColors, setExteriorColors] = useState<ExteriorColor[]>([]);
  const [interiorColors, setInteriorColors] = useState<InteriorColor[]>([]);
  const [upholsteryTypes, setUpholsteryTypes] = useState<Upholstery[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [loading, setLoading] = useState({
    makes: false,
    models: false,
    variants: false,
    exteriorColors: false,
    interiorColors: false,
    upholstery: false,
    options: false
  });

  // Format functions memoized to prevent recreation
  const formatPrice = useCallback((price: number) => `€${price.toLocaleString()}`, []);
  const formatMileage = useCallback((mileage: number) => `${mileage.toLocaleString()} km`, []);
  const formatPower = useCallback((power: number) => `${power} KF`, []);

  // Grouped options memoized to avoid recalculation
  const groupedOptions = useMemo(() => {
    if (!options || !Array.isArray(options) || options.length === 0) {
      return {};
    }
    
    return options.reduce((acc, option) => {
      const category = option.category_display || 'Tjetër';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(option);
      return acc;
    }, {} as Record<string, Option[]>);
  }, [options]);

  // Helper function for browser storage (localStorage or future IndexedDB support)
  const saveToStorage = useCallback((key: string, data: any) => {
    if (!useBrowserStorage) return;
    
    try {
      localStorage.setItem(key, JSON.stringify(data));
      localStorage.setItem(`${key}_timestamp`, Date.now().toString());
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [useBrowserStorage]);

  const getFromStorage = useCallback((key: string, expiryMinutes = 30) => {
    if (!useBrowserStorage) return null;
    
    try {
      const timestamp = localStorage.getItem(`${key}_timestamp`);
      if (!timestamp) return null;
      
      const storedTime = parseInt(timestamp, 10);
      const currentTime = Date.now();
      const expiryTime = expiryMinutes * 60 * 1000;
      
      if (currentTime - storedTime > expiryTime) {
        // Expired data
        localStorage.removeItem(key);
        localStorage.removeItem(`${key}_timestamp`);
        return null;
      }
      
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }, [useBrowserStorage]);

  // Enhanced API fetch functions
  const fetchMakes = useCallback(async () => {
    const cacheKey = 'makes';
    
    // Try from cache first (if enabled)
    const cachedData = getFromStorage(cacheKey);
    if (cachedData) {
      setMakes(cachedData);
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, makes: true }));
      
      const data = await fetchWithCache(cacheKey, async () => {
        const response = await fetch(API_ENDPOINTS.MAKES);
        if (!response.ok) throw new Error('Failed to fetch makes');
        return response.json();
      });
      
      setMakes(data);
      saveToStorage(cacheKey, data);
    } catch (error) {
      console.error('Error fetching makes:', error);
    } finally {
      setLoading(prev => ({ ...prev, makes: false }));
    }
  }, [getFromStorage, saveToStorage]);

  const fetchModels = useCallback(async (makeId: string) => {
    if (!makeId) return;
    
    const cacheKey = `models_${makeId}`;
    
    // Try from cache first (if enabled)
    const cachedData = getFromStorage(cacheKey);
    if (cachedData) {
      setModels(cachedData);
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, models: true }));
      
      const data = await fetchWithCache(cacheKey, async () => {
        const response = await fetch(API_ENDPOINTS.MODELS.LIST_BY_MAKE(makeId));
        if (!response.ok) throw new Error('Failed to fetch models');
        return response.json();
      });
      
      setModels(data);
      saveToStorage(cacheKey, data);
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      setLoading(prev => ({ ...prev, models: false }));
    }
  }, [getFromStorage, saveToStorage]);

  const fetchVariants = useCallback(async (modelId: string) => {
    if (!modelId) return;
    
    const cacheKey = `variants_${modelId}`;
    
    // Try from cache first (if enabled)
    const cachedData = getFromStorage(cacheKey);
    if (cachedData) {
      setVariants(cachedData);
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, variants: true }));
      
      const data = await fetchWithCache(cacheKey, async () => {
        const response = await fetch(API_ENDPOINTS.VARIANTS.LIST_BY_MODEL(modelId));
        if (!response.ok) throw new Error('Failed to fetch variants');
        return response.json();
      });
      
      setVariants(data);
      saveToStorage(cacheKey, data);
    } catch (error) {
      console.error('Error fetching variants:', error);
    } finally {
      setLoading(prev => ({ ...prev, variants: false }));
    }
  }, [getFromStorage, saveToStorage]);

  const fetchExteriorColors = useCallback(async () => {
    const cacheKey = 'exterior_colors';
    
    // Try from cache first (if enabled)
    const cachedData = getFromStorage(cacheKey);
    if (cachedData) {
      setExteriorColors(cachedData);
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, exteriorColors: true }));
      
      const data = await fetchWithCache(cacheKey, async () => {
        const response = await fetch(API_ENDPOINTS.EXTERIOR_COLORS);
        if (!response.ok) throw new Error('Failed to fetch exterior colors');
        return response.json();
      });
      
      setExteriorColors(data);
      saveToStorage(cacheKey, data);
    } catch (error) {
      console.error('Error fetching exterior colors:', error);
    } finally {
      setLoading(prev => ({ ...prev, exteriorColors: false }));
    }
  }, [getFromStorage, saveToStorage]);

  const fetchInteriorColors = useCallback(async () => {
    const cacheKey = 'interior_colors';
    
    // Try from cache first (if enabled)
    const cachedData = getFromStorage(cacheKey);
    if (cachedData) {
      setInteriorColors(cachedData);
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, interiorColors: true }));
      
      const data = await fetchWithCache(cacheKey, async () => {
        const response = await fetch(API_ENDPOINTS.INTERIOR_COLORS);
        if (!response.ok) throw new Error('Failed to fetch interior colors');
        return response.json();
      });
      
      setInteriorColors(data);
      saveToStorage(cacheKey, data);
    } catch (error) {
      console.error('Error fetching interior colors:', error);
    } finally {
      setLoading(prev => ({ ...prev, interiorColors: false }));
    }
  }, [getFromStorage, saveToStorage]);

  const fetchUpholsteryTypes = useCallback(async () => {
    const cacheKey = 'upholstery';
    
    // Try from cache first (if enabled)
    const cachedData = getFromStorage(cacheKey);
    if (cachedData) {
      setUpholsteryTypes(cachedData);
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, upholstery: true }));
      
      const data = await fetchWithCache(cacheKey, async () => {
        const response = await fetch(API_ENDPOINTS.UPHOLSTERY);
        if (!response.ok) throw new Error('Failed to fetch upholstery types');
        return response.json();
      });
      
      setUpholsteryTypes(data);
      saveToStorage(cacheKey, data);
    } catch (error) {
      console.error('Error fetching upholstery types:', error);
    } finally {
      setLoading(prev => ({ ...prev, upholstery: false }));
    }
  }, [getFromStorage, saveToStorage]);

  const fetchOptions = useCallback(async () => {
    const cacheKey = 'options';
    
    // Try from cache first (if enabled)
    const cachedData = getFromStorage(cacheKey);
    if (cachedData) {
      setOptions(cachedData);
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, options: true }));
      
      const data = await fetchWithCache(cacheKey, async () => {
        const response = await fetch(API_ENDPOINTS.OPTIONS.LIST);
        if (!response.ok) {
          throw new Error('Failed to fetch options');
        }
        const responseData = await response.json();
        return Array.isArray(responseData) ? responseData : [];
      });
      
      setOptions(data);
      saveToStorage(cacheKey, data);
    } catch (error) {
      console.error('Error fetching options:', error);
      setOptions([]);
    } finally {
      setLoading(prev => ({ ...prev, options: false }));
    }
  }, [getFromStorage, saveToStorage]);

  // Fetch all data
  const fetchData = useCallback(() => {
    fetchMakes();
    fetchExteriorColors();
    fetchInteriorColors();
    fetchUpholsteryTypes();
    fetchOptions();
  }, [fetchMakes, fetchExteriorColors, fetchInteriorColors, fetchUpholsteryTypes, fetchOptions]);

  // Process URL parameters or last search
  useEffect(() => {
    const processInitialFilters = () => {
      // First check URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const initialFilters: FilterState = {};
      const initialSelectedOptions: string[] = [];

      // Check if we have any URL parameters
      if (urlParams.toString()) {
        // If URL has parameters, use those
        urlParams.forEach((value, key) => {
          if (key.endsWith('[]')) {
            const baseKey = key.slice(0, -2);
            if (baseKey === 'options') {
              initialSelectedOptions.push(value);
            }
          } else {
            (initialFilters as any)[key] = value;
          }
        });
      } else {
        // Otherwise, check for saved last search
        const lastSearch = getFromStorage('lastCarSearch') || {};
        
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

      // If we have filters, update active filters display
      if (Object.keys(initialFilters).length > 0) {
        const makeId = initialFilters.make;
        if (makeId) {
          fetchModels(makeId.toString());
          
          const modelId = initialFilters.model;
          if (modelId) {
            fetchVariants(modelId.toString());
          }
        }
        
        // Notify parent component if provided
        if (onInitialLoad) {
          onInitialLoad(initialFilters);
        }
      }
    };

    processInitialFilters();
    fetchData();
  }, [fetchData, fetchModels, fetchVariants, getFromStorage, onInitialLoad]);

  // Get models when make is selected
  useEffect(() => {
    if (filters.make) {
      fetchModels(filters.make);
    } else {
      setModels([]);
      setVariants([]);
      setFilters(prev => ({ ...prev, model: undefined, variant: undefined }));
    }
  }, [filters.make, fetchModels]);

  // Get variants when model is selected
  useEffect(() => {
    if (filters.model) {
      fetchVariants(filters.model);
    } else {
      setVariants([]);
      setFilters(prev => ({ ...prev, variant: undefined }));
    }
  }, [filters.model, fetchVariants]);

  // Update active filters when data and filters are available
  const updateActiveFilters = useCallback(() => {
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
            label = `Marka: ${make.name}`;
          }
          break;
        case 'model':
          const model = models && models.find(m => m.id.toString() === value);
          if (model) {
            label = `Modeli: ${model.name}`;
          }
          break;
        case 'variant':
          const variant = variants && variants.find(v => v.id.toString() === value);
          if (variant) {
            label = `Varianti: ${variant.name}`;
          }
          break;
        case 'first_registration_from':
          label = `Viti nga: ${value}`;
          break;
        case 'first_registration_to':
          label = `Viti deri: ${value}`;
          break;
        case 'min_price':
          label = `Çmimi min: €${parseInt(value).toLocaleString()}`;
          break;
        case 'max_price':
          label = `Çmimi max: €${parseInt(value).toLocaleString()}`;
          break;
        case 'min_mileage':
          label = `Kilometrazhi min: ${parseInt(value).toLocaleString()} km`;
          break;
        case 'max_mileage':
          label = `Kilometrazhi max: ${parseInt(value).toLocaleString()} km`;
          break;
        case 'bodyType':
          label = `Tipi i karrocerisë: ${value}`;
          break;
        case 'min_power':
          label = `Fuqia min: ${value} KF`;
          break;
        case 'max_power':
          label = `Fuqia max: ${value} KF`;
          break;
        case 'gearbox':
          label = `Transmisioni: ${value}`;
          break;
        case 'doors':
          label = `Dyert: ${value}`;
          break;
        case 'seats':
          label = `Ndenjëset: ${value}`;
          break;
        case 'condition':
          label = `Gjendja: ${value === 'new' ? 'E Re' : 'E Përdorur'}`;
          break;
        case 'exterior_color':
          const extColor = exteriorColors && exteriorColors.find(c => c.id.toString() === value);
          if (extColor) {
            label = `Ngjyra e jashtme: ${extColor.name}`;
          } else {
            label = `Ngjyra e jashtme: ${value}`;
          }
          break;
        case 'interior_color':
          label = `Ngjyra e brendshme: ${value}`;
          break;
        case 'upholstery':
          const upholstery = upholsteryTypes && upholsteryTypes.find(u => u.id.toString() === value);
          if (upholstery) {
            label = `Tapiceria: ${upholstery.name}`;
          } else {
            label = `Tapiceria: ${value}`;
          }
          break;
        case 'fuel_type':
          label = `Karburanti: ${value}`;
          break;
        case 'emission_class':
          label = `Klasa e emisioneve: ${value}`;
          break;
        case 'created_since':
          const createdOption = CREATED_SINCE_OPTIONS.find(o => o.value === value);
          if (createdOption) {
            label = `Krijuar që prej: ${createdOption.label}`;
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
                  label: `Opsioni: ${option.name}`
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
  }, [filters, makes, models, variants, exteriorColors, interiorColors, upholsteryTypes, options]);

  // Call updateActiveFilters when relevant dependencies change
  useEffect(() => {
    updateActiveFilters();
  }, [filters, makes, models, variants, exteriorColors, interiorColors, upholsteryTypes, options, updateActiveFilters]);

  // Event handlers
  const handleFilterChange = useCallback((name: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  }, []);

  const handlePriceChange = useCallback((min: number, max: number) => {
    setFilters(prev => ({
      ...prev,
      min_price: min === PRICE_MIN ? undefined : min.toString(),
      max_price: max === PRICE_MAX ? undefined : max.toString()
    }));
  }, []);

  const handleMileageChange = useCallback((min: number, max: number) => {
    setFilters(prev => ({
      ...prev,
      min_mileage: min === MILEAGE_MIN ? undefined : min.toString(),
      max_mileage: max === MILEAGE_MAX ? undefined : max.toString()
    }));
  }, []);

  const handlePowerChange = useCallback((min: number, max: number) => {
    setFilters(prev => ({
      ...prev,
      min_power: min === POWER_MIN ? undefined : min.toString(),
      max_power: max === POWER_MAX ? undefined : max.toString()
    }));
  }, []);

  const handleOptionChange = useCallback((optionId: string) => {
    setSelectedOptions(prev => {
      if (prev.includes(optionId)) {
        return prev.filter(id => id !== optionId);
      } else {
        return [...prev, optionId];
      }
    });
  }, []);

  const removeFilter = useCallback((key: string) => {
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
  }, []);

  const updateUrl = useCallback(() => {
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
  }, [filters]);

  const prepareFilters = useCallback(() => {
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
    
    return activeFilters as FilterState;
  }, [filters, selectedOptions]);

  const handleSubmit = useCallback((onFilterChange: (filters: FilterState) => void) => {
    const activeFilters = prepareFilters();
    
    // Save the search parameters for recommendations
    saveToStorage('lastCarSearch', activeFilters);
    saveToStorage('lastSearchActivityTime', Date.now());
    
    // Update URL
    updateUrl();
    
    // Call the provided filter change callback
    onFilterChange(activeFilters);
  }, [prepareFilters, saveToStorage, updateUrl]);

  const resetFilters = useCallback((onFilterChange: (filters: FilterState) => void) => {
    setFilters({});
    setSelectedOptions([]);
    setActiveFilters([]);
    window.history.pushState({}, '', window.location.pathname);
    onFilterChange({});
  }, []);

  // Return all required state and handlers
  return {
    // State
    filters,
    selectedOptions,
    activeFilters,
    makes,
    models,
    variants,
    exteriorColors,
    interiorColors,
    upholsteryTypes,
    options,
    groupedOptions,
    loading,
    
    // Constants
    PRICE_MIN,
    PRICE_MAX,
    PRICE_STEP,
    MILEAGE_MIN,
    MILEAGE_MAX,
    MILEAGE_STEP,
    POWER_MIN,
    POWER_MAX,
    POWER_STEP,
    bodyTypes: BODY_TYPES,
    fuelTypes: FUEL_TYPES,
    gearboxTypes: GEARBOX_TYPES,
    emissionClasses: EMISSION_CLASSES,
    doorOptions: DOOR_OPTIONS,
    seatOptions: SEAT_OPTIONS,
    conditionOptions: CONDITION_OPTIONS,
    years: YEARS,
    createdSinceOptions: CREATED_SINCE_OPTIONS,
    
    // Formatting functions
    formatPrice,
    formatMileage,
    formatPower,
    
    // Actions
    handleFilterChange,
    handlePriceChange,
    handleMileageChange,
    handlePowerChange,
    handleOptionChange,
    removeFilter,
    handleSubmit,
    resetFilters,
    updateActiveFilters,
    prepareFilters
  };
}