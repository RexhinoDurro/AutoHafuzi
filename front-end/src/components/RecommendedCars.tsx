// RecommendedCars.tsx with direct links approach
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car } from '../types/car';
import { API_ENDPOINTS } from '../config/api'; 
import { API_BASE_URL } from '../config/api';
import FavoriteButton from './FavouriteButton';

interface RecommendedCarsProps {
  currentCar?: Car;
  excludeCarIds?: number[];
  alwaysShow?: boolean;
}

// Direct car card instead of using the regular component
const DirectCarCard = ({ car }: { car: Car }) => {
  // Get primary image URL
  const getPrimaryImageUrl = () => {
    if (!car.images || car.images.length === 0) {
      return `${API_BASE_URL}/api/placeholder/400/300`;
    }
    
    const primaryImage = car.images.find(img => img.is_primary);
    const image = primaryImage || car.images[0];
    
    return image.url || image.image || `${API_BASE_URL}/api/placeholder/400/300`;
  };

  // Create direct URL to force full page load
  const carUrl = `/car/${car.slug || car.id}`;

  return (
    <a href={carUrl} className="block car-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative w-full h-40">
        <img
          src={getPrimaryImageUrl()}
          alt={`${car.brand} ${car.model_name}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `${API_BASE_URL}/api/placeholder/400/300`;
          }}
        />
        
        <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
          <FavoriteButton 
            carId={car.id} 
            size={20} 
            className="bg-white bg-opacity-70 p-1 rounded-full"
          />
        </div>
      </div>
      
      <div className="p-3">
        <h3 className="font-bold text-lg mb-1">
          {car.brand} {car.model_name} {car.variant_name}
        </h3>
        
        <div className="text-gray-700 text-sm mb-2">
          <span>{car.first_registration_year || 'N/A'}</span>
          <span className="mx-1">•</span>
          <span>{car.mileage?.toLocaleString() || 'N/A'} km</span>
          <span className="mx-1">•</span>
          <span>{car.fuel_type}</span>
        </div>
        
        <div className="flex justify-between items-center mt-2">
          <span className="font-bold text-blue-600">
            {car.discussed_price 
              ? "I diskutueshem" 
              : `€${typeof car.price === 'number' 
                    ? car.price.toLocaleString() 
                    : parseInt(car.price as unknown as string).toLocaleString()}`
            }
          </span>
          
          <span className="text-sm text-blue-600 hover:text-blue-800">
            Shiko →
          </span>
        </div>
      </div>
    </a>
  );
};

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
            <DirectCarCard key={car.id} car={car} />
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