import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CarCard from './CarCard';
import { Car } from '../types/car';

interface RecommendedCarsProps {
  excludeCarIds?: number[];
}

const RecommendedCars: React.FC<RecommendedCarsProps> = ({ excludeCarIds = [] }) => {
  const [lastSearchCars, setLastSearchCars] = useState<Car[]>([]);
  const [interestedCars, setInterestedCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecommendedCars = async () => {
      setLoading(true);
      try {
        // Get last search parameters from localStorage
        const lastSearch = localStorage.getItem('lastCarSearch');
        const lastSearchParams = lastSearch ? JSON.parse(lastSearch) : {};
        
        // Get user activity from localStorage
        const userActivity = localStorage.getItem('userCarActivity');
        const activityData = userActivity ? JSON.parse(userActivity) : { makes: {}, models: {} };
        
        // Find most viewed make and model
        let topMake = null;
        let topModel = null;
        
        if (Object.keys(activityData.makes).length > 0) {
          topMake = Object.entries(activityData.makes)
            .sort((a, b) => (b[1] as number) - (a[1] as number))
            .map(entry => entry[0])[0];
        }
        
        if (Object.keys(activityData.models).length > 0) {
          topModel = Object.entries(activityData.models)
            .sort((a, b) => (b[1] as number) - (a[1] as number))
            .map(entry => entry[0])[0];
        }
        
        // Get recently viewed car IDs
        const recentViews = localStorage.getItem('recentCarViews');
        const recentViewIds = recentViews ? JSON.parse(recentViews) : [];
        
        // Combine with explicitly excluded IDs
        const allExcludedIds = [...new Set([...recentViewIds, ...excludeCarIds])];
        
        // Fetch recommendations based on last search
        const lastSearchQuery = new URLSearchParams();
        Object.entries(lastSearchParams).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            lastSearchQuery.append(key, value.toString());
          }
        });
        lastSearchQuery.append('limit', '4'); // Limit to 4 cars
        
        // Fetch cars based on user interests
        const interestQuery = new URLSearchParams();
        if (topMake) interestQuery.append('make', topMake);
        if (topModel) interestQuery.append('model', topModel);
        interestQuery.append('limit', '4'); // Limit to 4 cars
        
        // Make the API calls in parallel
        const [lastSearchResponse, interestResponse] = await Promise.all([
          fetch(`http://localhost:8000/api/cars/?${lastSearchQuery}`),
          fetch(`http://localhost:8000/api/cars/?${interestQuery}`)
        ]);
        
        if (!lastSearchResponse.ok || !interestResponse.ok) {
          throw new Error('Failed to fetch recommended cars');
        }
        
        const lastSearchData = await lastSearchResponse.json();
        const interestData = await interestResponse.json();
        
        // Filter out recently viewed cars
        const filteredLastSearchCars = lastSearchData.results.filter(
          (car: Car) => !allExcludedIds.includes(car.id)
        );
        
        const filteredInterestCars = interestData.results.filter(
          (car: Car) => !allExcludedIds.includes(car.id) && 
                        !filteredLastSearchCars.some((c: Car) => c.id === car.id)
        );
        
        setLastSearchCars(filteredLastSearchCars.slice(0, 4));
        setInterestedCars(filteredInterestCars.slice(0, 4));
      } catch (error) {
        console.error('Error fetching recommended cars:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendedCars();
  }, [excludeCarIds]);
  
  // Only show the component if we have recommendations
  if (loading) {
    return null; // Don't show a loading state
  }
  
  // Hide the component if no recommendations are available
  if (lastSearchCars.length === 0 && interestedCars.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-12 space-y-10">
      {/* Last search recommendations */}
      {lastSearchCars.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Bazuar në kërkimin e fundit</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {lastSearchCars.map(car => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
          <button
            onClick={() => navigate('/cars')}
            className="mt-6 w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Dëshironi të shihni më shumë makina?
          </button>
        </div>
      )}
      
      {/* Cars you might like */}
      {interestedCars.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Makina që mund t'ju interesojnë</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {interestedCars.map(car => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendedCars;