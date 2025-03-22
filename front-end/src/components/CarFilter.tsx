// src/components/CarFilter.tsx
import React, { useState, lazy, Suspense, useCallback } from 'react';
import { useCarFilter, FilterState } from '../hooks/useCarFilter';

// Import micro-components
import { FilterSection } from './filter-components/FilterSection';
import { MakeModelSelector } from './filter-components/MakeModelSelector';
import { YearSelector } from './filter-components/YearSelector';
import { ExteriorColorPicker } from './filter-components/ExteriorColorPicker';
import { OptionCategory } from './filter-components/OptionCategory';
import { ActionButtons } from './filter-components/ActionButtons';

// Lazy-load RangeSlider to reduce initial bundle size
const RangeSlider = lazy(() => import('./RangeSlider'));

// Loading placeholder for RangeSlider
const SliderPlaceholder = () => (
  <div className="h-12 bg-gray-100 animate-pulse rounded"></div>
);

interface CarFilterProps {
  onFilterChange: (filters: FilterState) => void;
}

const CarFilter: React.FC<CarFilterProps> = ({ onFilterChange }) => {
  const [showDetails, setShowDetails] = useState(false);

  const {
    // State
    filters,
    selectedOptions,
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
    handleSubmit,
    resetFilters
  } = useCarFilter({ useBrowserStorage: true });

  // Event handlers
  const toggleDetails = useCallback(() => {
    setShowDetails(prev => !prev);
  }, []);

  const handleFormSubmit = useCallback(() => {
    handleSubmit(onFilterChange);
  }, [handleSubmit, onFilterChange]);

  const handleReset = useCallback(() => {
    resetFilters(onFilterChange);
  }, [resetFilters, onFilterChange]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-bold mb-4">Gjej Makinën Tënde të Përsosur</h2>
      
      {/* Basic Search Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Make, Model, Variant */}
        <div className="space-y-3">
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
        </div>

        {/* First Registration From/To */}
        <div className="space-y-3">
          <YearSelector
            years={years}
            selectedFromYear={filters.first_registration_from}
            selectedToYear={filters.first_registration_to}
            onFromYearChange={(value) => handleFilterChange('first_registration_from', value)}
            onToYearChange={(value) => handleFilterChange('first_registration_to', value)}
          />
        </div>

        {/* Price Range Slider */}
        <div className="space-y-3">
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
        </div>
      </div>

      {/* Show/Hide Detailed Search Button */}
      <div className="mb-4">
        <button
          type="button"
          onClick={toggleDetails}
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
          <FilterSection 
            title="Detajet e Automjetit" 
            isExpanded={true}
            onToggle={() => {}}
            className="border-t pt-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Mileage Range Slider */}
              <div className="md:col-span-2">
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
          </FilterSection>

          {/* Options Section */}
          {Object.keys(groupedOptions).length > 0 && (
            <FilterSection 
              title="Opsionet" 
              isExpanded={true}
              onToggle={() => {}}
              className="border-t pt-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            </FilterSection>
          )}

          {/* Exterior Color Section */}
          <FilterSection 
            title="Ngjyra e Jashtme" 
            isExpanded={true}
            onToggle={() => {}}
            className="border-t pt-4"
          >
            <ExteriorColorPicker
              colors={exteriorColors}
              selectedColor={filters.exterior_color}
              onChange={(value) => handleFilterChange('exterior_color', value)}
              isLoading={loading.exteriorColors}
            />
          </FilterSection>

          {/* Interior Color Section */}
          <FilterSection 
            title="Ngjyra e Brendshme" 
            isExpanded={true}
            onToggle={() => {}}
            className="border-t pt-4"
          >
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
          </FilterSection>

          {/* Upholstery Section */}
          <FilterSection 
            title="Tapiceria" 
            isExpanded={true}
            onToggle={() => {}}
            className="border-t pt-4"
          >
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
          </FilterSection>

          {/* Fuel Section */}
          <FilterSection 
            title="Karburanti" 
            isExpanded={true}
            onToggle={() => {}}
            className="border-t pt-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Lloji i karburantit</label>
                <select
                  value={filters.fuel_type || ''}
                  onChange={(e) => handleFilterChange('fuel_type', e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Të gjitha llojet e karburanteve</option>
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
          </FilterSection>

          {/* Offer Details Section */}
          <FilterSection 
            title="Detajet e ofertës" 
            isExpanded={true}
            onToggle={() => {}}
            className="border-t pt-4"
          >
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
          </FilterSection>
        </div>
      )}

      {/* Action Buttons */}
      <ActionButtons 
        onApply={handleFormSubmit}
        onReset={handleReset}
      />
    </div>
  );
};

export default React.memo(CarFilter);