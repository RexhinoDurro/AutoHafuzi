// RecommendedCars.tsx with improved algorithm and forced variety (continued)
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

  // Get cache buster to force different results on each page
  const getCacheBuster = () => {
    // Use the current car ID to create variety between different detail pages
    const baseValue = currentCar?.id?.toString() || '';
    // Add a timestamp to create variety over time
    const timestamp = Math.floor(Date.now() / (1000 * 60 * 10)); // Changes every 10 minutes
    return `${baseValue}-${timestamp}`;
  };

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
        
        // Generate a cache buster to force variety
        const cacheBuster = getCacheBuster();
        
        // We'll use different queries to ensure we get diverse results
        let primaryCars: Car[] = [];
        let secondaryCars: Car[] = [];
        let tertiaryCars: Car[] = [];
        let randomCars: Car[] = [];
        
        // Define possible sort options
        const sortOptions = ['price_asc', 'price_desc', 'year_asc', 'year_desc'];
        
        // Pick random sort option based on cache buster
        const randomSortIndex = Math.abs(cacheBuster.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % sortOptions.length;
        const randomSort = sortOptions[randomSortIndex];
        
        // Track which makes we already have to ensure variety
        const alreadyIncludedMakes = new Set<string>();
        if (currentCar?.make) {
          alreadyIncludedMakes.add(currentCar.make.toString());
        }
        
        // 1. PRIMARY QUERY: Get some cars from the same segment
        // If we have a current car, use its attributes for similarity
        if (currentCar) {
          const primaryQuery = new URLSearchParams();
          primaryQuery.append('limit', '6');
          
          // Use a different attribute based on the cache buster to ensure variety
          const cacheBusterMod = parseInt(cacheBuster.slice(-1)) % 3;
          
          if (cacheBusterMod === 0 && currentCar.body_type) {
            // Body type-based
            primaryQuery.append('bodyType', currentCar.body_type);
          } else if (cacheBusterMod === 1 && currentCar.fuel_type) {
            // Fuel type-based  
            primaryQuery.append('fuel_type', currentCar.fuel_type);
          } else if (currentCar.make) {
            // Make-based (default)
            primaryQuery.append('make', currentCar.make.toString());
          }
          
          // Add cache buster to prevent stale API responses
          primaryQuery.append('_cb', cacheBuster);
          
          try {
            const primaryResponse = await fetch(`${API_ENDPOINTS.CARS.LIST}?${primaryQuery}`);
            if (primaryResponse.ok) {
              const data = await primaryResponse.json();
              // Filter out excluded cars and current car's make if needed
              primaryCars = (data.results || []).filter((car: Car) => !allExcludedIds.includes(car.id));
              
              // If we got at least 2 cars from primary query, update the excluded makes
              primaryCars.slice(0, 2).forEach((car: Car) => {
                if (car.make) alreadyIncludedMakes.add(car.make.toString());
              });
            }
          } catch (error) {
            console.error('Error in primary query:', error);
          }
        }
        
        // 2. SECONDARY QUERY: Get cars with a similar price range but different make
        if (currentCar && currentCar.price && !currentCar.discussed_price) {
          const price = typeof currentCar.price === 'number' ? currentCar.price : parseInt(currentCar.price);
          
          // Price range varies based on cache buster to ensure variety
          const minPriceFactor = 0.6 + (parseInt(cacheBuster.slice(-1)) % 4) * 0.05; // 0.6 to 0.75
          const maxPriceFactor = 1.3 + (parseInt(cacheBuster.slice(-2, -1)) % 4) * 0.05; // 1.3 to 1.45
          
          const minPrice = Math.floor(price * minPriceFactor);
          const maxPrice = Math.ceil(price * maxPriceFactor);
          
          const secondaryQuery = new URLSearchParams();
          secondaryQuery.append('limit', '6');
          secondaryQuery.append('min_price', minPrice.toString());
          secondaryQuery.append('max_price', maxPrice.toString());
          secondaryQuery.append('sort', randomSort); // Use random sort
          
          // Add cache buster
          secondaryQuery.append('_cb', cacheBuster + '-2');
          
          try {
            const secondaryResponse = await fetch(`${API_ENDPOINTS.CARS.LIST}?${secondaryQuery}`);
            if (secondaryResponse.ok) {
              const data = await secondaryResponse.json();
              
              // Filter out excluded cars, primary cars, and already included makes
              secondaryCars = (data.results || []).filter((car: Car) => 
                !allExcludedIds.includes(car.id) && 
                !primaryCars.some(c => c.id === car.id) &&
                !alreadyIncludedMakes.has(car.make?.toString() || '')
              );
              
              // Update included makes
              secondaryCars.slice(0, 2).forEach((car: Car) => {
                if (car.make) alreadyIncludedMakes.add(car.make.toString());
              });
            }
          } catch (error) {
            console.error('Error in secondary query:', error);
          }
        }
        
        // 3. TERTIARY QUERY: Get cars with different body type
        if (currentCar && currentCar.body_type) {
          // Get different body types
          const bodyTypes = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Wagon'];
          const currentBodyType = currentCar.body_type;
          const differentBodyTypes = bodyTypes.filter(type => type !== currentBodyType);
          
          // Choose one based on cache buster
          const bodyTypeIndex = parseInt(cacheBuster.slice(-2)) % differentBodyTypes.length;
          const selectedBodyType = differentBodyTypes[bodyTypeIndex];
          
          const tertiaryQuery = new URLSearchParams();
          tertiaryQuery.append('limit', '6');
          tertiaryQuery.append('bodyType', selectedBodyType);
          tertiaryQuery.append('sort', randomSort); // Use random sort
          
          // Add cache buster
          tertiaryQuery.append('_cb', cacheBuster + '-3');
          
          try {
            const tertiaryResponse = await fetch(`${API_ENDPOINTS.CARS.LIST}?${tertiaryQuery}`);
            if (tertiaryResponse.ok) {
              const data = await tertiaryResponse.json();
              
              // Filter out excluded cars, primary cars, secondary cars, and already included makes
              tertiaryCars = (data.results || []).filter((car: Car) => 
                !allExcludedIds.includes(car.id) && 
                !primaryCars.some(c => c.id === car.id) &&
                !secondaryCars.some(c => c.id === car.id) &&
                !alreadyIncludedMakes.has(car.make?.toString() || '')
              );
              
              // Update included makes
              tertiaryCars.slice(0, 2).forEach((car: Car) => {
                if (car.make) alreadyIncludedMakes.add(car.make.toString());
              });
            }
          } catch (error) {
            console.error('Error in tertiary query:', error);
          }
        }
        
        // 4. RANDOM QUERY: Get a mix of random cars to fill any gaps
        const randomQuery = new URLSearchParams();
        randomQuery.append('limit', '15'); // Request more to ensure diversity
        randomQuery.append('sort', randomSort);
        
        // Add cache buster with timestamp for pure randomness
        randomQuery.append('_cb', cacheBuster + '-' + Date.now());
        
        try {
          const randomResponse = await fetch(`${API_ENDPOINTS.CARS.LIST}?${randomQuery}`);
          if (randomResponse.ok) {
            const data = await randomResponse.json();
            
            // Filter out all cars we've already included and excluded
            randomCars = (data.results || []).filter((car: Car) => 
              !allExcludedIds.includes(car.id) && 
              !primaryCars.some(c => c.id === car.id) &&
              !secondaryCars.some(c => c.id === car.id) &&
              !tertiaryCars.some(c => c.id === car.id)
            );
            
            // Randomize the order for additional variety
            randomCars = randomCars.sort(() => 0.5 - Math.random());
          }
        } catch (error) {
          console.error('Error in random query:', error);
        }
        
        // Combine all cars into a final list, keeping at most 1-2 from each source
        // to ensure diversity
        let finalCars: Car[] = [];
        
        // Add cars from primary source (max 1-2 depending on source)
        if (primaryCars.length > 0) {
          const primaryToAdd = primaryCars.slice(0, primaryCars.length >= 4 ? 1 : 2);
          finalCars = [...finalCars, ...primaryToAdd];
        }
        
        // Add cars from secondary source (max 1)
        if (secondaryCars.length > 0) {
          finalCars = [...finalCars, secondaryCars[0]];
        }
        
        // Add cars from tertiary source (max 1)
        if (tertiaryCars.length > 0) {
          finalCars = [...finalCars, tertiaryCars[0]];
        }
        
        // Fill remaining slots with random cars
        const neededRandomCars = 4 - finalCars.length;
        if (neededRandomCars > 0 && randomCars.length > 0) {
          finalCars = [...finalCars, ...randomCars.slice(0, neededRandomCars)];
        }
        
        // If we still don't have enough cars, go back and get more from primary/secondary/tertiary
        if (finalCars.length < 4) {
          // Add more primary cars if available
          if (finalCars.length < 4 && primaryCars.length > finalCars.filter(c => primaryCars.some(pc => pc.id === c.id)).length) {
            const additionalPrimary = primaryCars.filter(c => !finalCars.some(fc => fc.id === c.id));
            finalCars = [...finalCars, ...additionalPrimary.slice(0, 4 - finalCars.length)];
          }
          
          // Add more secondary cars if still needed
          if (finalCars.length < 4 && secondaryCars.length > finalCars.filter(c => secondaryCars.some(sc => sc.id === c.id)).length) {
            const additionalSecondary = secondaryCars.filter(c => !finalCars.some(fc => fc.id === c.id));
            finalCars = [...finalCars, ...additionalSecondary.slice(0, 4 - finalCars.length)];
          }
          
          // Add more tertiary cars if still needed
          if (finalCars.length < 4 && tertiaryCars.length > finalCars.filter(c => tertiaryCars.some(tc => tc.id === c.id)).length) {
            const additionalTertiary = tertiaryCars.filter(c => !finalCars.some(fc => fc.id === c.id));
            finalCars = [...finalCars, ...additionalTertiary.slice(0, 4 - finalCars.length)];
          }
        }
        
        // Randomize the final order to prevent patterns
        finalCars = finalCars.sort(() => 0.5 - Math.random());
        
        // Log our findings
        console.log('Recommendations sourcing:', {
          primary: primaryCars.length,
          secondary: secondaryCars.length,
          tertiary: tertiaryCars.length,
          random: randomCars.length,
          final: finalCars.length,
          cacheBuster
        });
        
        // Set state with final results
        setRecommendedCars(finalCars.slice(0, 4));
        
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