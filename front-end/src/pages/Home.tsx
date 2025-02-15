import React, { useState, useEffect } from 'react';
import CarCard from '../components/CarCard';
import CarFilter from '../components/CarFilter';
import { Car } from '../types/car';

const Home = () => {
  const [cars, setCars] = useState<Car[]>([]);

  const fetchCars = async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters);
      const response = await fetch(`http://localhost:8000/api/cars/?${queryParams}`);
      const data = await response.json();
      setCars(data);
    } catch (error) {
      console.error('Error fetching cars:', error);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const handleFilterChange = (filters: any) => {
    fetchCars(filters);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Available Cars</h1>
      <CarFilter onFilterChange={handleFilterChange} />
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {cars.map((car) => (
          <CarCard key={car.id} car={car} />
        ))}
      </div>
    </div>
  );
};

export default Home;
