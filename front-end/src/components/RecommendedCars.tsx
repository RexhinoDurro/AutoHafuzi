// RecommendedCars.tsx with direct navigation approach
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car } from '../types/car';
import { API_ENDPOINTS } from '../config/api'; 
import CarCard from './CarCard';

interface RecommendedCarsProps {
  currentCar?: Car;
  excludeCarIds?: number[];
  alwaysShow?: boolean;
}

const RecommendedCars: React.FC<RecommendedCarsProps> = ({ 
  currentCar, 
  excludeCarIds = [], 
  alwaysShow = false 
}) => {
  const [recommendedCars, setRecommendedCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecommendedCars = async () => {
      setLoading(true);
      setError(null);

      try {
        // Combine explicitly excluded IDs with current car ID if present
        const allExcludedIds = [...excludeCarIds];
        if (currentCar?.id) {
          allExcludedIds.push(currentCar.id);
        }
        
        // Prepare query parameters for similar cars
        const query: Record<string, string> = {
          limit: '8' // Request more than we need in case some are excluded
        };
        
        // If we have a current car, use its attributes for similarity
        if (currentCar) {
          // Prioritize finding cars of the same make
          if (currentCar.make) {
            query.make = currentCar.make.toString();
          }
          
          // Then same body type
          if (currentCar.body_type) {
            query.bodyType = currentCar.body_type;
          }
          
          // Then similar price range (±20%)
          if (currentCar.price && !currentCar.discussed_price) {
            const price = typeof currentCar.price === 'number' ? currentCar.price : parseInt(currentCar.price);
            const minPrice = Math.floor(price * 0.8);
            const maxPrice = Math.ceil(price * 1.2);
            query.min_price = minPrice.toString();
            query.max_price = maxPrice.toString();
          }
          
          // Then similar fuel type
          if (currentCar.fuel_type) {
            query.fuel_type = currentCar.fuel_type;
          }
        } else {
          // If no current car, use activity data for recommendations
          const lastSearch = localStorage.getItem('lastCarSearch');
          const lastSearchParams = lastSearch ? JSON.parse(lastSearch) : {};
          
          const userActivity = localStorage.getItem('userCarActivity');
          const activityData = userActivity ? JSON.parse(userActivity) : { makes: {}, models: {} };
          
          let topMake = null;
          
          if (Object.keys(activityData.makes).length > 0) {
            topMake = Object.entries(activityData.makes)
              .sort((a, b) => (b[1] as number) - (a[1] as number))
              .map(entry => entry[0])[0];
              
            if (topMake && topMake.startsWith('name:')) {
              query.search = topMake.substring(5);
            } else if (topMake) {
              query.make = topMake;
            }
          }
          
          if (lastSearchParams.fuel_type) {
            query.fuel_type = lastSearchParams.fuel_type.toString();
          }
          
          if (lastSearchParams.bodyType) {
            query.bodyType = lastSearchParams.bodyType.toString();
          }
        }

        const queryParams = new URLSearchParams();
        Object.entries(query).forEach(([key, value]) => {
          queryParams.append(key, value);
        });
        
        const response = await fetch(`${API_ENDPOINTS.CARS.LIST}?${queryParams}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch recommended cars');
        }
        
        const data = await response.json();
        let cars = data.results || [];
        
        cars = cars.filter((car: Car) => !allExcludedIds.includes(car.id));
        
        if (cars.length < 4 && currentCar && currentCar.make) {
          const backupQuery = { ...query };
          delete backupQuery.make;
          
          const backupQueryParams = new URLSearchParams();
          Object.entries(backupQuery).forEach(([key, value]) => {
            backupQueryParams.append(key, value);
          });
          
          const backupResponse = await fetch(`${API_ENDPOINTS.CARS.LIST}?${backupQueryParams}`);
          
          if (backupResponse.ok) {
            const backupData = await backupResponse.json();
            let backupCars = backupData.results || [];
            
            backupCars = backupCars.filter((car: Car) => 
              !allExcludedIds.includes(car.id) && 
              !cars.some((c: Car) => c.id === car.id)
            );
            
            cars = [...cars, ...backupCars];
          }
        }
        
        setRecommendedCars(cars.slice(0, 4));
      } catch (error) {
        console.error('Error fetching recommended cars:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch recommended cars');
        setRecommendedCars([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendedCars();
  }, [currentCar, excludeCarIds, navigate]);

  // Custom handler for car card clicks
  const handleCarClick = (car: Car) => {
    // Get the target URL
    const targetUrl = `/car/${car.slug || car.id.toString()}`;
    
    // Use direct browser navigation to completely refresh the page
    window.location.href = targetUrl;
  };
  
  if (loading) {
    return alwaysShow ? (
      <div className="mt-12 space-y-10">
        <h3 className="text-2xl font-bold mb-6">Makina të Ngjashme</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-gray-200 animate-pulse h-64 rounded-lg"></div>
          ))}
        </div>
      </div>
    ) : null;
  }
  
  if (error && !alwaysShow) {
    return null;
  }
  
  if (recommendedCars.length === 0 && !alwaysShow) {
    return null;
  }
  
  const carsToShow = recommendedCars.length > 0 ? recommendedCars : [];
  const emptySlots = 4 - carsToShow.length;
  
  return (
    <div className="mt-12 space-y-4">
      <h3 className="text-2xl font-bold mb-6">Makina të Ngjashme</h3>
      
      {carsToShow.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {carsToShow.map(car => (
            <div key={car.id} 
                 className="cursor-pointer" 
                 onClick={() => handleCarClick(car)}>
              <CarCard 
                key={car.id} 
                car={car} 
                onClick={(e) => {
                  e.preventDefault();
                  handleCarClick(car);
                }}
              />
            </div>
          ))}
          
          {alwaysShow && emptySlots > 0 && [...Array(emptySlots)].map((_, index) => (
            <div key={`empty-${index}`} className="bg-gray-100 rounded-lg p-4 h-64 flex items-center justify-center">
              <p className="text-gray-400">Makina të ngjashme do të shfaqen këtu</p>
            </div>
          ))}
        </div>
      ) : alwaysShow ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-gray-100 rounded-lg p-4 h-64 flex items-center justify-center">
              <p className="text-gray-400">Makina të ngjashme do të shfaqen këtu</p>
            </div>
          ))}
        </div>
      ) : null}
      
      <button
        onClick={() => navigate('/cars')}
        className="mt-6 w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
      >
        Dëshironi të shihni më shumë makina?
      </button>
    </div>
  );
};

export default RecommendedCars;