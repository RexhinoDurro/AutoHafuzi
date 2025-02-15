// src/components/CarFilter.tsx
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
  onFilterChange: (filters: any) => void;
}

const CarFilter: React.FC<FilterProps> = ({ onFilterChange }) => {
  const [makes, setMakes] = useState<Make[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedMake, setSelectedMake] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  const priceRanges = [
    { value: '', label: 'All Prices' },
    { value: '5000', label: '€5,000' },
    { value: '10000', label: '€10,000' },
    { value: '15000', label: '€15,000' },
    { value: '20000', label: '€20,000' },
    { value: '25000', label: '€25,000' },
    { value: '30000', label: '€30,000' },
    { value: '40000', label: '€40,000' },
    { value: '50000', label: '€50,000' },
    { value: '60000', label: '€60,000' },
    { value: '70000', label: '€70,000' },
    { value: '80000', label: '€80,000' },
    { value: '90000', label: '€90,000' },
    { value: '100000', label: '€100,000' },
    { value: '150000', label: '€150,000' },
    { value: '200000', label: '€200,000' },
  ];

  // Function to format number with commas
  const formatNumber = (num: string) => {
    // Remove any existing commas and non-numeric characters except decimal point
    const cleanNum = num.replace(/[^0-9.]/g, '');
    // Format with commas
    const parts = cleanNum.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  // Handle price input change
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.value;
    
    if (e.target.type === 'text') {
      // For manual input, format the number
      const formattedValue = formatNumber(value);
      setMaxPrice(formattedValue);
    } else {
      // For dropdown selection
      const formattedValue = value ? formatNumber(value) : '';
      setMaxPrice(formattedValue);
    }
  };
  // Get all makes when component mounts
  useEffect(() => {
    fetchMakes();
  }, []);

  // Get models when make is selected
  useEffect(() => {
    if (selectedMake) {
      fetchModels(selectedMake);
    } else {
      setModels([]);
      setSelectedModel('');
    }
  }, [selectedMake]);

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

  const handleFilterChange = () => {
    const numericPrice = maxPrice ? parseFloat(maxPrice.replace(/,/g, '')) : null;
    onFilterChange({
      make: selectedMake,
      model: selectedModel,
      year: selectedYear,
      max_price: numericPrice,
    });
  };

  // Generate year options (e.g., last 30 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Make</label>
          <select
            value={selectedMake}
            onChange={(e) => setSelectedMake(e.target.value)}
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
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full p-2 border rounded-lg"
            disabled={!selectedMake}
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
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            <option value="">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Max Price (€)</label>
          <div className="flex gap-2">
            <select
              value={maxPrice.replace(/,/g, '')}
              onChange={handlePriceChange}
              className="w-full p-2 border rounded-lg"
            >
              {priceRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={maxPrice}
              onChange={handlePriceChange}
              className="w-full p-2 border rounded-lg"
              placeholder="Custom price"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleFilterChange}
        className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
      >
        Apply Filters
      </button>
    </div>
  );
};

export default CarFilter;