// RecommendedCars.tsx with improved recommendation algorithm
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
        
        <div className="absolute top-2 right-2 z-10" onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}>
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
        
        // We'll use three different approaches to get diverse recommendations
        let similarBrandCars: Car[] = [];
        let similarPriceCars: Car[] = [];
        let similarBodyTypeCars: Car[] = [];
        let randomCars: Car[] = [];
        
        // Step 1: Try to find cars from the same brand/make
        if (currentCar && currentCar.make) {
          const makeQuery = new URLSearchParams();
          makeQuery.append('limit', '6');
          makeQuery.append('make', currentCar.make.toString());
          
          const makeResponse = await fetch(`${API_ENDPOINTS.CARS.LIST}?${makeQuery}`);
          if (makeResponse.ok) {
            const makeData = await makeResponse.json();
            similarBrandCars = makeData.results || [];
            
            // Filter out the current car and any other excluded cars
            similarBrandCars = similarBrandCars.filter((car: Car) => 
              !allExcludedIds.includes(car.id)
            );
          }
        }
        
        // Step 2: Try to find cars with similar price range (±20%)
        if (currentCar && currentCar.price && !currentCar.discussed_price) {
          const price = typeof currentCar.price === 'number' ? currentCar.price : parseInt(currentCar.price);
          
          // Set a wider price range for better diversity
          const minPrice = Math.floor(price * 0.7);  // 30% lower
          const maxPrice = Math.ceil(price * 1.3);   // 30% higher
          
          const priceQuery = new URLSearchParams();
          priceQuery.append('limit', '6');
          priceQuery.append('min_price', minPrice.toString());
          priceQuery.append('max_price', maxPrice.toString());
          
          // If we already have cars from the same brand, exclude that brand to ensure diversity
          if (similarBrandCars.length > 0 && currentCar.make) {
            // Note: This feature would require backend support to exclude a make
            // If backend doesn't support this, we'll handle filtering later
          }
          
          const priceResponse = await fetch(`${API_ENDPOINTS.CARS.LIST}?${priceQuery}`);
          if (priceResponse.ok) {
            const priceData = await priceResponse.json();
            similarPriceCars = priceData.results || [];
            
            // Filter out the current car, excluded cars, and any cars already in similarBrandCars
            similarPriceCars = similarPriceCars.filter((car: Car) => 
              !allExcludedIds.includes(car.id) && 
              !similarBrandCars.some(c => c.id === car.id)
            );
            
            // If we have brand cars, try to filter price cars to different makes
            if (similarBrandCars.length > 0 && currentCar.make) {
              // Keep some from same make, but prefer different makes
              const differentMakeCars = similarPriceCars.filter(
                (car: Car) => car.make?.toString() !== currentCar.make?.toString()
              );
              
              // If we have enough different make cars, prioritize those
              if (differentMakeCars.length >= 2) {
                similarPriceCars = differentMakeCars;
              }
            }
          }
        }
        
        // Step 3: Try to find cars with the same body type
        if (currentCar && currentCar.body_type) {
          const bodyTypeQuery = new URLSearchParams();
          bodyTypeQuery.append('limit', '6');
          bodyTypeQuery.append('bodyType', currentCar.body_type);
          
          const bodyTypeResponse = await fetch(`${API_ENDPOINTS.CARS.LIST}?${bodyTypeQuery}`);
          if (bodyTypeResponse.ok) {
            const bodyTypeData = await bodyTypeResponse.json();
            similarBodyTypeCars = bodyTypeData.results || [];
            
            // Filter out the current car, excluded cars, and cars already in other lists
            similarBodyTypeCars = similarBodyTypeCars.filter((car: Car) => 
              !allExcludedIds.includes(car.id) && 
              !similarBrandCars.some(c => c.id === car.id) &&
              !similarPriceCars.some(c => c.id === car.id)
            );
            
            // Similar to price cars, if we have brand cars, try to filter body type cars to different makes
            if (similarBrandCars.length > 0 && currentCar.make) {
              const differentMakeCars = similarBodyTypeCars.filter(
                (car: Car) => car.make?.toString() !== currentCar.make?.toString()
              );
              
              if (differentMakeCars.length >= 2) {
                similarBodyTypeCars = differentMakeCars;
              }
            }
          }
        }
        
        // Step 4: Get some random cars to ensure we always have enough
        const randomQuery = new URLSearchParams();
        randomQuery.append('limit', '10');
        
        // If we're coming from Home page (no currentCar), get latest vehicles instead of random
        if (!currentCar) {
          randomQuery.append('sort', 'created_desc');
        }
        
        const randomResponse = await fetch(`${API_ENDPOINTS.CARS.LIST}?${randomQuery}`);
        if (randomResponse.ok) {
          const randomData = await randomResponse.json();
          randomCars = randomData.results || [];
          
          // Filter out the current car, excluded cars, and cars already in other lists
          randomCars = randomCars.filter((car: Car) => 
            !allExcludedIds.includes(car.id) && 
            !similarBrandCars.some(c => c.id === car.id) &&
            !similarPriceCars.some(c => c.id === car.id) &&
            !similarBodyTypeCars.some(c => c.id === car.id)
          );
          
          // If we have enough cars, randomize their order
          if (randomCars.length > 4) {
            randomCars = randomCars
              .sort(() => 0.5 - Math.random())
              .slice(0, 8);
          }
        }
        
        // Now combine all cars with a priority order to ensure diversity
        let finalCars: Car[] = [];
        
        // If we have brand cars, start with 1-2 of those
        if (similarBrandCars.length > 0) {
          finalCars = [...finalCars, ...similarBrandCars.slice(0, 2)];
        }
        
        // Then add 1-2 price-similar cars if we have them
        if (similarPriceCars.length > 0) {
          finalCars = [...finalCars, ...similarPriceCars.slice(0, 2)];
        }
        
        // Then add 1-2 body-type-similar cars if we have them
        if (similarBodyTypeCars.length > 0) {
          finalCars = [...finalCars, ...similarBodyTypeCars.slice(0, 2)];
        }
        
        // If we still need more cars, add random cars
        if (finalCars.length < 4 && randomCars.length > 0) {
          const neededCars = 4 - finalCars.length;
          finalCars = [...finalCars, ...randomCars.slice(0, neededCars)];
        }
        
        // Special case: If we couldn't get enough cars with the specialized queries,
        // just use all random cars
        if (finalCars.length < 4 && randomCars.length >= 4) {
          finalCars = randomCars.slice(0, 4);
        }
        
        // Limit to 4 cars and set state
        setRecommendedCars(finalCars.slice(0, 4));
        
        // If we still don't have 4 cars, make another random query with different parameters
        if (finalCars.length < 4) {
          const backupQuery = new URLSearchParams();
          backupQuery.append('limit', '10');
          
          // Try different sort to get more varied results
          backupQuery.append('sort', 'price_desc');
          
          const backupResponse = await fetch(`${API_ENDPOINTS.CARS.LIST}?${backupQuery}`);
          if (backupResponse.ok) {
            const backupData = await backupResponse.json();
            let backupCars = backupData.results || [];
            
            // Filter out the current car, excluded cars, and cars already in finalCars
            backupCars = backupCars.filter((car: Car) => 
              !allExcludedIds.includes(car.id) && 
              !finalCars.some(c => c.id === car.id)
            );
            
            // If we have enough, add the remaining cars needed
            if (backupCars.length > 0) {
              const neededCars = 4 - finalCars.length;
              finalCars = [...finalCars, ...backupCars.slice(0, neededCars)];
              setRecommendedCars(finalCars);
            }
          }
        }
        
        // Log the sources of our recommendations for debugging
        console.log('Recommendation sources:', {
          similarBrandCars: similarBrandCars.length,
          similarPriceCars: similarPriceCars.length,
          similarBodyTypeCars: similarBodyTypeCars.length,
          randomCars: randomCars.length,
          finalCount: finalCars.length
        });
        
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