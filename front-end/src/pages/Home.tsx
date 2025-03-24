import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CarCard from '../components/CarCard';
import CarFilter from '../components/CarFilter';
import { Car } from '../types/car';
import { saveLastSearch, getRecentlyViewedCarIds, getLastSearch } from '../utils/userActivityService';
import { API_ENDPOINTS } from '../config/api';

const Home = () => {
  // State definitions
  const [lastSearchCars, setLastSearchCars] = useState<Car[]>([]);
  const [interestCars, setInterestCars] = useState<Car[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchQuery, setLastSearchQuery] = useState<URLSearchParams | null>(null);
  const [interestQuery, setInterestQuery] = useState<URLSearchParams | null>(null);
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

  // Fetch latest cars as fallback for when there are no last searches
  const fetchLatestCars = async (): Promise<Car[]> => {
    try {
      // Create query for latest cars
      const latestCarsQuery = new URLSearchParams();
      latestCarsQuery.append('limit', '4');
      latestCarsQuery.append('ordering', '-created_at'); // Order by most recently added

      const response = await fetch(`${API_ENDPOINTS.CARS.LIST}?${latestCarsQuery}`);
      if (response.ok) {
        const data = await response.json();
        return data.results || [];
      } else {
        console.warn('Latest cars API request failed');
        return [];
      }
    } catch (error) {
      console.error('Error fetching latest cars:', error);
      return [];
    }
  };

  // Fetch random cars as fallback for when there are no interest-based recommendations
  const fetchRandomCars = async (): Promise<Car[]> => {
    try {
      // Create query for random cars - first try ordering by id which might be somewhat random
      const randomCarsQuery = new URLSearchParams();
      randomCarsQuery.append('limit', '8'); // Get more to shuffle
      
      const response = await fetch(`${API_ENDPOINTS.CARS.LIST}?${randomCarsQuery}`);
      if (response.ok) {
        const data = await response.json();
        // Shuffle the results to get random cars
        const shuffled = [...(data.results || [])].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 4);
      } else {
        console.warn('Random cars API request failed');
        return [];
      }
    } catch (error) {
      console.error('Error fetching random cars:', error);
      return [];
    }
  };

  // Fetch recommendations
  const fetchRecommendations = async () => {
    setRecommendationsLoading(true);
    
    try {
      // Get recently viewed car IDs to exclude them
      const recentViewIds = getRecentlyViewedCarIds();
      
      // Get last search parameters from localStorage
      const lastSearch = getLastSearch();
      
      // Fetch fallback options first - store the results directly
      const [latestCarsData, randomCarsData] = await Promise.all([fetchLatestCars(), fetchRandomCars()]);
      
      // Create query for last search recommendation
      const lastSearchQueryParams = new URLSearchParams();
      
      // Only include specific filterable fields and make sure we're sending IDs
      const allowedFields = ['make', 'model', 'variant', 'bodyType', 'fuel_type', 'gearbox'];
      Object.entries(lastSearch).forEach(([key, value]) => {
        if (
          value !== null && 
          value !== undefined && 
          value !== '' && 
          allowedFields.includes(key) && 
          key !== 'options'
        ) {
          lastSearchQueryParams.append(key, value.toString());
        }
      });
      
      lastSearchQueryParams.append('limit', '4'); // Limit to 4 cars
      setLastSearchQuery(lastSearchQueryParams);
      
      // Get user activity from localStorage for interest-based recommendations
      const userActivity = localStorage.getItem('userCarActivity');
      const activityData = userActivity ? JSON.parse(userActivity) : { makes: {}, models: {} };
      
      // Find most viewed make and model IDs, not names
      let topMakeId = null;
      let topModelId = null;
      
      if (Object.keys(activityData.makes).length > 0) {
        // Filter only numeric IDs (not name-prefixed entries)
        const makeEntries = Object.entries(activityData.makes)
          .filter(([key]) => !key.startsWith('name:') && !isNaN(Number(key)));
          
        if (makeEntries.length > 0) {
          topMakeId = makeEntries
            .sort((a, b) => (b[1] as number) - (a[1] as number))
            .map(entry => entry[0])[0];
        }
      }
      
      if (Object.keys(activityData.models).length > 0) {
        // Filter only numeric IDs (not name-prefixed entries)
        const modelEntries = Object.entries(activityData.models)
          .filter(([key]) => !key.startsWith('name:') && !isNaN(Number(key)));
          
        if (modelEntries.length > 0) {
          topModelId = modelEntries
            .sort((a, b) => (b[1] as number) - (a[1] as number))
            .map(entry => entry[0])[0];
        }
      }
      
      // Create query for interest-based recommendations
      const interestQueryParams = new URLSearchParams();
      if (topMakeId) interestQueryParams.append('make', topMakeId);
      if (topModelId) interestQueryParams.append('model', topModelId);
      interestQueryParams.append('limit', '4');
      setInterestQuery(interestQueryParams);
      
      // Make API calls - only if we have valid query parameters
      let lastSearchData = { results: [] };
      let interestData = { results: [] };
      
      // Only make the API call if we have query parameters
      if (lastSearchQueryParams.toString() !== 'limit=4') {
        const lastSearchResponse = await fetch(`${API_ENDPOINTS.CARS.LIST}?${lastSearchQueryParams}`);
        if (lastSearchResponse.ok) {
          lastSearchData = await lastSearchResponse.json();
        } else {
          console.warn('Last search API request failed');
        }
      } else {
        console.log('Skipping last search API call - no valid parameters, will use latest cars instead');
      }
      
      // Only make the API call if we have both make and model
      if (interestQueryParams.toString() !== 'limit=4') {
        const interestResponse = await fetch(`${API_ENDPOINTS.CARS.LIST}?${interestQueryParams}`);
        if (interestResponse.ok) {
          interestData = await interestResponse.json();
        } else {
          console.warn('Interest-based API request failed');
        }
      } else {
        console.log('Skipping interest API call - no valid parameters, will use random cars instead');
      }
      
      // Filter out recently viewed cars
      const filteredLastSearchCars = (lastSearchData.results || []).filter(
        (car: Car) => !recentViewIds.includes(car.id)
      );
      
      const filteredInterestCars = (interestData.results || []).filter(
        (car: Car) => !recentViewIds.includes(car.id) && 
                    !filteredLastSearchCars.some((c: Car) => c.id === car.id)
      );
      
      // Set the primary recommendation arrays
      if (filteredLastSearchCars.length > 0) {
        setLastSearchCars(filteredLastSearchCars.slice(0, 4));
      } else {
        // Use latest cars as fallback
        console.log("Using latest cars fallback:", latestCarsData.length);
        const filteredLatestCars = latestCarsData.filter(
          (car: Car) => !recentViewIds.includes(car.id)
        );
        setLastSearchCars(filteredLatestCars.slice(0, 4));
      }
      
      // Get the latest search cars that were set above
      const currentLastSearchCars = filteredLastSearchCars.length > 0 
        ? filteredLastSearchCars.slice(0, 4) 
        : latestCarsData.filter((car: Car) => !recentViewIds.includes(car.id)).slice(0, 4);
      
      if (filteredInterestCars.length > 0) {
        setInterestCars(filteredInterestCars.slice(0, 4));
      } else {
        // Use random cars as fallback
        console.log("Using random cars fallback:", randomCarsData.length);
        // Filter to avoid duplicates with what's already shown in lastSearchCars
        const filteredRandomCars = randomCarsData.filter(
          (car: Car) => !recentViewIds.includes(car.id) && 
                         !currentLastSearchCars.some((c: Car) => c.id === car.id)
        );
        setInterestCars(filteredRandomCars.slice(0, 4));
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError('Failed to load recommendations. Please try again later.');
    } finally {
      setRecommendationsLoading(false);
    }
  };

  useEffect(() => {
    // Check if search data has expired (after 30 minutes)
    const checkSearchDataExpiration = () => {
      const lastActivityTimestamp = localStorage.getItem('lastSearchActivityTime');
      
      if (lastActivityTimestamp) {
        const lastActivity = parseInt(lastActivityTimestamp, 10);
        const currentTime = Date.now();
        const thirtyMinutesInMs = 30 * 60 * 1000;
        
        // If last activity was more than 30 minutes ago, clear the search data
        if (currentTime - lastActivity > thirtyMinutesInMs) {
          localStorage.removeItem('lastCarSearch');
          localStorage.removeItem('lastSearchActivityTime');
          console.log('Search data cleared due to 30 minutes of inactivity');
        }
      }
    };
    
    // Update activity timestamp on component mount
    localStorage.setItem('lastSearchActivityTime', Date.now().toString());
    
    // Check for expiration on component mount
    checkSearchDataExpiration();
    
    // Fetch recommendations after checking expiration
    fetchRecommendations();
    
    // Setup interval to check for expiration every minute
    const intervalId = setInterval(checkSearchDataExpiration, 60 * 1000);
    
    // Cleanup function that runs when the component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-0 sm:p-6">
      <h1 className="text-3xl font-bold mb-6">Gjeni Makinën </h1>
      {/* Main Car Filter */}
      <CarFilter onFilterChange={handleFilterSubmit} />
      
      {/* Error display */}
      {error && <p className="text-center text-red-500 my-6">{error}</p>}
      
      {/* "Based on your last search" OR "Latest Cars" Recommendation Section */}
      {!recommendationsLoading && lastSearchCars.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-2 pt-4 pb-4 border border-blue-100 my-2 sm:mt-12 sm:mb-16 sm:p-8 sm:rounded-xl sm:shadow">
          <h2 className="text-2xl font-bold mb-3 ml-0.5 text-blue-800 flex items-center sm:mb-6 sm:ml-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {lastSearchQuery && lastSearchQuery.toString() !== 'limit=4' 
              ? 'Bazuar në kërkimin e fundit' 
              : 'Makina të shtuara së fundmi'}
          </h2>
          {/* Grid with 2 columns on mobile, 2 on tablet, 4 on desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-1 mx-0.5 sm:gap-4 sm:mx-0">
            {lastSearchCars.map(car => (
              <CarCard key={car.id} car={car} />
            ))}
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
      )}
      
      {/* "Cars You Might Like" OR "Randomly Selected Cars" Recommendation Section */}
      {!recommendationsLoading && interestCars.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-2 pt-4 pb-4 border border-amber-100 my-2 sm:my-16 sm:p-8 sm:rounded-xl sm:shadow">
          <h2 className="text-2xl font-bold mb-3 ml-0.5 text-amber-800 flex items-center sm:mb-6 sm:ml-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            {interestQuery && interestQuery.toString() !== 'limit=4' 
              ? 'Makina që mund t\'ju interesojnë' 
              : 'Makina të zgjedhura për ju'}
          </h2>
          {/* Grid with 2 columns on mobile, 2 on tablet, 4 on desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-1 mx-0.5 sm:gap-4 sm:mx-0">
            {interestCars.map(car => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        </div>
      )}
      
      {/* Loading state for recommendations */}
      {recommendationsLoading && (
        <div className="flex justify-center my-4 sm:my-16">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-blue-200 h-12 w-12"></div>
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-blue-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-blue-200 rounded"></div>
                <div className="h-4 bg-blue-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;