// src/components/CarHolderFilter.tsx
import React, { useState, Suspense, lazy, useCallback } from 'react';
import { useCarFilter, FilterState } from '../hooks/useCarFilter';

// Import micro-components
import { FilterSection } from './filter-components/FilterSection';
import { MakeModelSelector } from './filter-components/MakeModelSelector';
import { YearSelector } from './filter-components/YearSelector';
import { ExteriorColorPicker } from './filter-components/ExteriorColorPicker';
import { OptionCategory } from './filter-components/OptionCategory';
import { ActiveFiltersList } from './filter-components/ActiveFiltersList';
import { ActionButtons } from './filter-components/ActionButtons';

// Lazy-load RangeSlider to reduce initial bundle size
const RangeSlider = lazy(() => import('./RangeSlider'));

// Loading placeholder for RangeSlider
const SliderPlaceholder = () => (
  <div className="h-12 bg-gray-100 animate-pulse rounded"></div>
);

interface CarHolderFilterProps {
  onFilterChange: (filters: FilterState) => void;
}

const CarHolderFilter: React.FC<CarHolderFilterProps> = ({ onFilterChange }) => {
  const [showAllFilters, setShowAllFilters] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    make: true,
    price: false,
    details: false,
    exteriorColor: false,
    interior: false,
    upholstery: false,
    options: false
  });

  const {
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
    bodyTypes,
    fuelTypes,
    gearboxTypes,
    emissionClasses,
    doorOptions,
    seatOptions,
    conditionOptions,
    years,
    createdSinceOptions,
    
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
    resetFilters
  } = useCarFilter({ useBrowserStorage: true });

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  const toggleShowAllFilters = useCallback(() => {
    setShowAllFilters(prev => !prev);
  }, []);

  const handleFormSubmit = useCallback(() => {
    handleSubmit(onFilterChange);
  }, [handleSubmit, onFilterChange]);

  const handleReset = useCallback(() => {
    resetFilters(onFilterChange);
  }, [resetFilters, onFilterChange]);

  return (
    <div className="bg-white rounded-lg shadow-md mb-6 max-w-7xl mx-auto">
      {/* Active Filters Section */}
      <ActiveFiltersList
        activeFilters={activeFilters}
        showAllFilters={showAllFilters}
        onToggleShowAll={toggleShowAllFilters}
        onRemoveFilter={removeFilter}
        onClearAll={handleReset}
      />

      {/* Make and Model Section */}
      <FilterSection 
        title="Marka & Modeli" 
        isExpanded={expandedSections.make}
        onToggle={() => toggleSection('make')}
      >
        <MakeModelSelector
          makes={makes}
          models={models}
          variants={variants}
          selectedMake={filters.make}
          selectedModel={filters.model}
          selectedVariant={filters.variant}
          onMakeChange={(value) => handleFilterChange('make', value)}
          onModelChange={(value) => handleFilterChange('model', value)}
          onVariantChange={(value) => handleFilterChange('variant', value)}
          loading={{
            makes: loading.makes,
            models: loading.models,
            variants: loading.variants
          }}
        />
      </FilterSection>

      {/* Price and Registration Section */}
      <FilterSection 
        title="Çmimi & Regjistrimi" 
        isExpanded={expandedSections.price}
        onToggle={() => toggleSection('price')}
      >
        <div className="space-y-4">
          {/* Price Range Slider */}
          <Suspense fallback={<SliderPlaceholder />}>
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
          </Suspense>
          
          {/* Registration Year */}
          <YearSelector
            years={years}
            selectedFromYear={filters.first_registration_from}
            selectedToYear={filters.first_registration_to}
            onFromYearChange={(value) => handleFilterChange('first_registration_from', value)}
            onToYearChange={(value) => handleFilterChange('first_registration_to', value)}
          />
        </div>
      </FilterSection>

      {/* Vehicle Details Section */}
      <FilterSection 
        title="Detajet e Automjetit" 
        isExpanded={expandedSections.details}
        onToggle={() => toggleSection('details')}
      >
        <div className="space-y-4">
          {/* Mileage Range Slider */}
          <Suspense fallback={<SliderPlaceholder />}>
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
          </Suspense>
          
          {/* Power Range Slider */}
          <Suspense fallback={<SliderPlaceholder />}>
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
          </Suspense>
          
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
              {conditionOptions.map((condition, index) => (
                <option key={condition} value={['new', 'used'][index]}>
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
      </FilterSection>

      {/* Exterior Colors Section */}
      <FilterSection 
        title="Ngjyrat e Jashtme" 
        isExpanded={expandedSections.exteriorColor}
        onToggle={() => toggleSection('exteriorColor')}
        className="p-3 border-b"
      >
        <ExteriorColorPicker
          colors={exteriorColors}
          selectedColor={filters.exterior_color}
          onChange={(value) => handleFilterChange('exterior_color', value)}
          isLoading={loading.exteriorColors}
        />
      </FilterSection>

      {/* Interior Colors Section */}
      <FilterSection 
        title="Ngjyra e Brendshme" 
        isExpanded={expandedSections.interior}
        onToggle={() => toggleSection('interior')}
        className="p-3 border-b"
      >
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
      </FilterSection>

      {/* Upholstery Section */}
      <FilterSection 
        title="Tapiceria" 
        isExpanded={expandedSections.upholstery}
        onToggle={() => toggleSection('upholstery')}
        className="p-3 border-b"
      >
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
      </FilterSection>

      {/* Options Section */}
      <FilterSection 
        title="Opsionet" 
        isExpanded={expandedSections.options}
        onToggle={() => toggleSection('options')}
        className="p-3 border-b"
      >
        {loading.options ? (
          <div className="text-center py-4 text-sm text-gray-500">Duke ngarkuar opsionet...</div>
        ) : Object.keys(groupedOptions).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(groupedOptions).map(([category, categoryOptions]) => (
              <OptionCategory
                key={category}
                category={category}
                options={categoryOptions}
                selectedOptions={selectedOptions}
                onOptionChange={handleOptionChange}
              />
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 text-center py-2">Nuk ka opsione të disponueshme</p>
        )}
      </FilterSection>
      
      {/* Action Buttons */}
      <ActionButtons 
        onApply={handleFormSubmit}
        onReset={handleReset}
      />
    </div>
  );
};

export default React.memo(CarHolderFilter);