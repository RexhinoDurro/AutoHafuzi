import React, { useState, useEffect } from 'react';
import CarCard from '../components/CarCard';
import CarFilter from '../components/CarFilter';
import { Car } from '../types/car';

const Home = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCars = async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const url = `http://localhost:8000/api/cars/?${queryParams}`;
      console.log('Fetching cars with URL:', url);
      console.log('Filters:', filters);

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch cars');

      const data = await response.json();
      // Fix: Extract the cars from the results array
      setCars(data.results || []);
    } catch (error) {
      console.error('Error fetching cars:', error);
      setError('Failed to load cars. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Available Cars</h1>
      <CarFilter onFilterChange={(filters) => fetchCars(filters)} />
      
      {loading && <p className="text-center text-gray-500">Loading cars...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {cars.length > 0 ? (
          cars.map((car) => <CarCard key={car.id} car={car} />)
        ) : (
          !loading && <p className="col-span-full text-center text-gray-500">No cars found.</p>
        )}
      </div>


      
    </div>
  );
};


export default Home;