// front-end/src/pages/FavouritesPage.tsx
import React, { useEffect, useState } from 'react';
import { useFavorites } from '../context/FavouritesContext';
import CarCard from '../components/CarCard';
import { Car } from '../types/car';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';

interface StoredFavorite {
  id: number;
  slug: string;
}

const FavoritesPage: React.FC = () => {
  const { favorites, favoritesCars, setFavoritesCars, clearAllFavorites, addFavorite, removeFavorite, getSlugById } = useFavorites();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [storedFavorites, setStoredFavorites] = useState<StoredFavorite[]>([]);
  const navigate = useNavigate();

  // Load the stored favorites with slugs
  useEffect(() => {
    const loadStoredFavorites = () => {
      try {
        const favsJson = localStorage.getItem('car_favorites_with_slugs');
        if (favsJson) {
          const parsed = JSON.parse(favsJson);
          if (Array.isArray(parsed)) {
            console.log('Loaded stored favorites with slugs:', parsed);
            setStoredFavorites(parsed);
            return;
          }
        }
        
        // If no stored favorites with slugs, create entries based on what we know
        const storedFavs: StoredFavorite[] = favorites.map(id => {
          // Try to get the slug from the context
          const slug = getSlugById ? getSlugById(id) : undefined;
          return { id, slug: slug || id.toString() };
        });

        console.log('Created new stored favorites:', storedFavs);
        setStoredFavorites(storedFavs);
      } catch (error) {
        console.error('Error loading stored favorites:', error);
        setStoredFavorites([]);
      }
    };
    
    loadStoredFavorites();
  }, [favorites, getSlugById]);

  // Fetch the favorite cars with improved approach
  useEffect(() => {
    const fetchFavoriteCars = async () => {
      if (favorites.length === 0) {
        setFavoritesCars([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Map favorites to stored favorites to get slugs
        const favsToFetch = favorites.map(id => {
          const stored = storedFavorites.find(sf => sf.id === id);
          return { id, slug: stored?.slug || id.toString() };
        });
        
        console.log('Favorites to fetch:', favsToFetch);
        
        // Fetch each favorite car
        const carPromises = favsToFetch.map(async (fav) => {
          // First determine if we have a proper slug or just a numeric ID
          const isProperSlug = fav.slug && isNaN(Number(fav.slug));
          const apiEndpoint = isProperSlug ? 
                             API_ENDPOINTS.CARS.GET(fav.slug) : 
                             `${API_ENDPOINTS.CARS.LIST}${fav.id}/`;
          
          console.log(`Fetching car ${fav.id} using ${isProperSlug ? 'slug' : 'ID'}: ${apiEndpoint}`);
          
          try {
            const response = await fetch(apiEndpoint, {
              headers: { 'X-View-Tracking': 'false' }
            });
            
            if (!response.ok) {
              console.error(`Failed to fetch car with ${isProperSlug ? 'slug' : 'ID'} ${isProperSlug ? fav.slug : fav.id}`);
              
              // If we tried with a slug and it failed, try with the ID directly as backup
              if (isProperSlug) {
                console.log(`Trying fallback with ID: ${fav.id}`);
                const fallbackEndpoint = `${API_ENDPOINTS.CARS.LIST}${fav.id}/`;
                const fallbackResponse = await fetch(fallbackEndpoint, {
                  headers: { 'X-View-Tracking': 'false' }
                });
                
                if (!fallbackResponse.ok) {
                  console.error(`Fallback also failed for car ID ${fav.id}`);
                  return null;
                }
                
                return fallbackResponse.json();
              }
              
              return null;
            }
            
            return response.json();
          } catch (error) {
            console.error(`Error fetching car with ID ${fav.id}:`, error);
            return null;
          }
        });

        const carsData = await Promise.all(carPromises);
        
        // Filter out any null values (failed fetches)
        const validCars = carsData.filter(car => car !== null) as Car[];
        console.log(`Successfully fetched ${validCars.length} out of ${favsToFetch.length} cars`);
        
        setFavoritesCars(validCars);
        
        // Update stored slugs for any cars we found
        const updatedStoredFavs = [...storedFavorites];
        let hasUpdates = false;
        
        validCars.forEach(car => {
          if (car.id && car.slug) {
            const existingIdx = updatedStoredFavs.findIndex(sf => sf.id === car.id);
            
            if (existingIdx >= 0) {
              // Update the slug if it's different
              if (updatedStoredFavs[existingIdx].slug !== car.slug) {
                console.log(`Updating slug for car ${car.id} from ${updatedStoredFavs[existingIdx].slug} to ${car.slug}`);
                updatedStoredFavs[existingIdx].slug = car.slug;
                hasUpdates = true;
              }
            } else {
              // Add a new entry
              console.log(`Adding new stored favorite for car ${car.id} with slug ${car.slug}`);
              updatedStoredFavs.push({ id: car.id, slug: car.slug });
              hasUpdates = true;
            }
            
            // Ensure the car is properly saved in context
            addFavorite(car.id, car.slug);
          }
        });
        
        // If we made any updates to the stored favorites, save them
        if (hasUpdates) {
          console.log('Saving updated stored favorites:', updatedStoredFavs);
          setStoredFavorites(updatedStoredFavs);
          localStorage.setItem('car_favorites_with_slugs', JSON.stringify(updatedStoredFavs));
        }
        
        // If some cars couldn't be found, update the favorites to remove them
        if (validCars.length < favorites.length) {
          const validIds = validCars.map(car => car.id);
          const invalidIds = favorites.filter(id => !validIds.includes(id));
          
          // Remove invalid favorites
          invalidIds.forEach(id => {
            console.log(`Removing invalid favorite with ID ${id}`);
            removeFavorite(id);
            
            const storedIdx = updatedStoredFavs.findIndex(sf => sf.id === id);
            if (storedIdx !== -1) {
              updatedStoredFavs.splice(storedIdx, 1);
              localStorage.setItem('car_favorites_with_slugs', JSON.stringify(updatedStoredFavs));
            }
          });
        }
      } catch (error) {
        console.error('Error fetching favorite cars:', error);
        setError('Dështoi në marrjen e makinave të preferuara. Ju lutemi provoni përsëri më vonë.');
      } finally {
        setLoading(false);
      }
    };

    if (storedFavorites.length > 0) {
      fetchFavoriteCars();
    } else {
      setLoading(false);
    }
  }, [favorites, storedFavorites, setFavoritesCars, addFavorite, removeFavorite]);

  const handleClearFavorites = () => {
    // Clear both favorites and stored favorites
    clearAllFavorites();
    setStoredFavorites([]);
    localStorage.removeItem('car_favorites_with_slugs');
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