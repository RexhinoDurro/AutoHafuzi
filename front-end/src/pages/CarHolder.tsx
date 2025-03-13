import React, { useState, useEffect } from 'react';
import CarHolderFilter from '../components/CarHolderFilter';
import { Car } from '../types/car';

const CarHolder: React.FC = () => {
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
    <div className="flex min-h-screen container mx-auto px-4 py-8 max-w-5xl">
      {/* Filter section - fixed width on left side */}
      <div className="w-80 mr-8">
        <CarHolderFilter onFilterChange={(filters) => fetchCars(filters)} />
      </div>

      {/* Car listing section - takes remaining width */}
      <div className="flex-grow">
        <h1 className="text-3xl font-bold mb-6">Listat e Automjeteve</h1>
        
        {loading && <p className="text-center text-gray-500">Duke ngarkuar automjetet...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        <div className="space-y-6">
          {cars.length > 0 ? (
            cars.map((car) => (
              <div 
                key={car.id} 
                className="bg-white shadow-lg overflow-hidden hover:shadow-xl transition-all"
              >
                <div className="flex" style={{ height: "240px" }}>
                  {/* Car Image - Left Side */}
                  <div className="w-1/3 p-2">
                    <div className="h-full w-full overflow-hidden flex items-center justify-center">
                      <img
                        src={
                          car.images && car.images.length > 0
                            ? (car.images[0].image.startsWith('http') 
                                ? car.images[0].image 
                                : `http://localhost:8000${car.images[0].image}`)
                            : 'placeholder-image-url'
                        }
                        alt={`${car.brand} ${car.model_name}`}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  </div>

                  {/* Car Details - Right Side */}
                  <div className="w-2/3 p-2 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="text-2xl font-bold text-gray-800">
                          {car.brand} {car.model_name}
                          {car.variant_name && (
                            <span className="text-gray-500 font-normal text-sm ml-2">
                              {car.variant_name}
                            </span>
                          )}
                        </h3>
                        <span className="text-blue-600 font-semibold text-xl">
                          {car.price === 0 ? 'I diskutueshem' : `${Number(car.price).toLocaleString()}`}
                        </span>
                      </div>

                      <div className="mt-4 flex space-x-2">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{car.year}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{car.mileage.toLocaleString()} km</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{car.fuel_type}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{car.gearbox}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{car.body_type}</span>
                      </div>

                      <p className="text-gray-600 mt-4 line-clamp-3">{car.description}</p>
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        </div>
                        <span className="text-gray-600">{car.body_type} • {car.exterior_color_name || 'N/A'}</span>
                      </div>
                      <button 
                        className="text-blue-600 hover:underline font-medium"
                        onClick={() => window.location.href = `/car/${car.id}`}
                      >
                        Shiko Detajet e Plota
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            !loading && <p className="text-center text-gray-500">Nuk u gjetën automjete.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarHolder;