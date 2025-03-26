// Home.tsx with direct card implementation
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CarFilter from '../components/CarFilter';
import { Car } from '../types/car';
import { saveLastSearch } from '../utils/userActivityService';
import { API_ENDPOINTS, API_BASE_URL } from '../config/api';
import FavoriteButton from '../components/FavouriteButton';

// Direct implementation of car card to avoid dependencies
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

const Home = () => {
  // State definitions
  const [latestCars, setLatestCars] = useState<Car[]>([]);
  const [recommendedCars, setRecommendedCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Handle filter submission
  const handleFilterSubmit = (filters = {}) => {
    // Save the search parameters for recommendations
    saveLastSearch(filters);
    
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    // If filters are applied, redirect to /cars with filters
    navigate(`/cars?${queryParams}`);
  };

  // Fetch cars for home page
  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      
      try {
        // Make two separate queries for different sections
        
        // 1. Latest cars query
        const latestQuery = new URLSearchParams();
        latestQuery.append('limit', '4');
        latestQuery.append('sort', 'created_desc'); // Most recently added
        
        // 2. Featured cars query (just use a different sort)
        const featuredQuery = new URLSearchParams();
        featuredQuery.append('limit', '8'); // Request more to ensure variety
        featuredQuery.append('sort', 'price_desc'); // Sort by price descending
        
        // Run queries in parallel
        const [latestResponse, featuredResponse] = await Promise.all([
          fetch(`${API_ENDPOINTS.CARS.LIST}?${latestQuery}`),
          fetch(`${API_ENDPOINTS.CARS.LIST}?${featuredQuery}`)
        ]);
        
        // Process latest cars
        if (latestResponse.ok) {
          const latestData = await latestResponse.json();
          setLatestCars(latestData.results || []);
        }
        
        // Process featured cars
        if (featuredResponse.ok) {
          const featuredData = await featuredResponse.json();
          // Shuffle the results to get random featured cars
          const shuffled = [...(featuredData.results || [])].sort(() => 0.5 - Math.random());
          
          // Make sure we don't show the same cars as in the latest section
          const filteredFeatured = shuffled.filter(
            (featuredCar) => !latestCars.some(latestCar => latestCar.id === featuredCar.id)
          );
          
          setRecommendedCars(filteredFeatured.slice(0, 4));
        }
      } catch (error) {
        console.error('Error fetching cars for home page:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCars();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-0 sm:p-6">
      <h1 className="text-3xl font-bold mb-6">Gjeni Makinën </h1>
      
      {/* Main Car Filter */}
      <CarFilter onFilterChange={handleFilterSubmit} />
      
      {/* LATEST CARS SECTION */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-2 pt-4 pb-4 border border-blue-100 my-2 sm:mt-12 sm:mb-16 sm:p-8 sm:rounded-xl sm:shadow">
        <h2 className="text-2xl font-bold mb-3 ml-0.5 text-blue-800 flex items-center sm:mb-6 sm:ml-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {'Makina të shtuara së fundmi'}
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-1 mx-0.5 sm:gap-4 sm:mx-0">
          {loading ? (
            // Loading placeholders
            [...Array(4)].map((_, index) => (
              <div key={index} className="bg-gray-200 animate-pulse rounded-lg h-48 sm:h-56"></div>
            ))
          ) : latestCars.length > 0 ? (
            // Actual car cards
            latestCars.slice(0, 4).map(car => (
              <DirectCarCard key={car.id} car={car} />
            ))
          ) : (
            // Empty state
            [...Array(4)].map((_, index) => (
              <div key={index} className="bg-gray-100 rounded-lg p-4 h-48 sm:h-56 flex items-center justify-center">
                <p className="text-gray-400">Makina të shtuara së fundmi do të shfaqen këtu</p>
              </div>
            ))
          )}
        </div>
        
        <button
          onClick={() => navigate('/cars')}
          className="mt-3 mb-1 mx-0.5 w-full py-3 bg-blue-600 text-white font-semibold text-lg rounded-lg hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center sm:mt-8 sm:mb-0 sm:mx-0"
        >
          <span>Dëshironi të shihni më shumë makina?</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {/* FEATURED CARS SECTION */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-2 pt-4 pb-4 border border-amber-100 my-2 sm:my-16 sm:p-8 sm:rounded-xl sm:shadow">
        <h2 className="text-2xl font-bold mb-3 ml-0.5 text-amber-800 flex items-center sm:mb-6 sm:ml-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          {'Makina të zgjedhura për ju'}
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-1 mx-0.5 sm:gap-4 sm:mx-0">
          {loading ? (
            // Loading placeholders
            [...Array(4)].map((_, index) => (
              <div key={index} className="bg-gray-200 animate-pulse rounded-lg h-48 sm:h-56"></div>
            ))
          ) : recommendedCars.length > 0 ? (
            // Actual car cards
            recommendedCars.slice(0, 4).map(car => (
              <DirectCarCard key={car.id} car={car} />
            ))
          ) : (
            // Empty state
            [...Array(4)].map((_, index) => (
              <div key={index} className="bg-gray-100 rounded-lg p-4 h-48 sm:h-56 flex items-center justify-center">
                <p className="text-gray-400">Makina të zgjedhura do të shfaqen këtu</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;