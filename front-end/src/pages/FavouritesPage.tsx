// front-end/src/pages/FavouritesPage.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useFavorites } from '../context/FavouritesContext';
import CarCard from '../components/CarCard';
import { Car } from '../types/car';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';

const FavoritesPage: React.FC = () => {
  const { favorites, favoritesCars, setFavoritesCars, clearAllFavorites, removeFavorite } = useFavorites();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Add a ref to track fetching state and prevent duplicate fetches
  const isFetchingRef = useRef(false);
  // Add a ref to store last fetched favorites to prevent unnecessary refetches
  const lastFetchedFavoritesRef = useRef<number[]>([]);

  // Fetch all cars and filter for favorites
  useEffect(() => {
    // Skip if already fetching or if favorites haven't changed
    if (isFetchingRef.current) return;
    
    // Check if favorites have changed since last fetch
    const favoritesChanged = 
      lastFetchedFavoritesRef.current.length !== favorites.length ||
      favorites.some(id => !lastFetchedFavoritesRef.current.includes(id));
    
    if (!favoritesChanged && favoritesCars.length > 0) {
      setLoading(false);
      return;
    }
    
    const fetchFavoriteCars = async () => {
      if (favorites.length === 0) {
        setFavoritesCars([]);
        setLoading(false);
        return;
      }

      // Set fetching flag to prevent duplicate requests
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);

      try {
        console.log('Fetching all cars to find favorites with IDs:', favorites);
        
        // Update last fetched favorites
        lastFetchedFavoritesRef.current = [...favorites];
        
        // Get all cars without pagination limits
        const url = `${API_ENDPOINTS.CARS.LIST}?limit=100`;
        console.log('Fetching cars from:', url);
        
        const response = await fetch(url, {
          headers: { 'X-View-Tracking': 'false' }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch cars listing');
        }
        
        const data = await response.json();
        console.log(`Fetched ${data.results.length} total cars`);
        
        // Filter to include only favorited cars
        const favoriteCarsList = data.results.filter(
          (car: Car) => favorites.includes(car.id)
        );
        
        console.log(`Found ${favoriteCarsList.length} favorites out of ${favorites.length} saved favorites`);
        
        // Set the filtered favorites
        setFavoritesCars(favoriteCarsList);
        
        // If some favorite cars weren't found, remove them from favorites
        if (favoriteCarsList.length < favorites.length) {
          const validIds = favoriteCarsList.map((car: Car) => car.id);
          const invalidIds = favorites.filter(id => !validIds.includes(id));
          
          // Remove invalid favorites
          invalidIds.forEach(id => {
            console.log(`Removing invalid favorite with ID ${id} (not found in car list)`);
            removeFavorite(id);
          });
        }
      } catch (error) {
        console.error('Error fetching favorite cars:', error);
        setError('Dështoi në marrjen e makinave të preferuara. Ju lutemi provoni përsëri më vonë.');
      } finally {
        setLoading(false);
        // Reset fetching flag
        isFetchingRef.current = false;
      }
    };

    if (favorites.length > 0) {
      fetchFavoriteCars();
    } else {
      setLoading(false);
    }
  }, [favorites, setFavoritesCars, removeFavorite, favoritesCars.length]);

  const handleClearFavorites = () => {
    // Clear favorites
    clearAllFavorites();
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 min-h-screen pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Makinat e Preferuara</h1>
        {favorites.length > 0 && (
          <button 
            onClick={handleClearFavorites}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded w-full sm:w-auto"
          >
            Pastro të Gjitha Preferencat
          </button>
        )}
      </div>

      {loading && <p className="text-center text-gray-500 my-8">Duke ngarkuar makinat e preferuara...</p>}
      {error && <p className="text-center text-red-500 my-8">{error}</p>}

      {!loading && !error && (
        <>
          {favoritesCars.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-16">
              {favoritesCars.map((car: Car) => (
                <div key={car.id} className="transition-transform hover:scale-102 hover:shadow-lg">
                  <CarCard 
                    car={car} 
                    showFavoriteButton={true}
                    isFromFavorites={true}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6 sm:p-8 text-center my-16">
              <h2 className="text-xl font-semibold mb-2">Nuk ka ende makina të preferuara</h2>
              <p className="text-gray-600 mb-4">
                Shfletoni koleksionin tonë dhe klikoni ikonën e zemrës për të shtuar makina në preferencat tuaja.
              </p>
              <button 
                onClick={() => navigate('/cars')}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded transition"
              >
                Shfleto Makinat
              </button>
            </div>
          )}
        </>
      )}
      
      {/* Extra spacing div to ensure footer is positioned correctly */}
      <div className="h-12 sm:h-16 md:h-20"></div>
    </div>
  );
};

export default FavoritesPage;