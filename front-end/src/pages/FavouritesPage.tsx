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
  const { favorites, favoritesCars, setFavoritesCars, clearAllFavorites } = useFavorites();
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
            setStoredFavorites(parsed);
            return;
          }
        }
        
        // If no stored favorites with slugs, create an empty array
        setStoredFavorites(favorites.map(id => ({ id, slug: id.toString() })));
      } catch (error) {
        console.error('Error loading stored favorites:', error);
        setStoredFavorites([]);
      }
    };
    
    loadStoredFavorites();
  }, [favorites]);

  // Fetch the favorite cars using slugs when available
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
        
        // Fetch each favorite car by slug (or ID as fallback)
        const carPromises = favsToFetch.map(fav => 
          fetch(API_ENDPOINTS.CARS.GET(fav.slug), {
            headers: {
              'X-View-Tracking': 'false' // Don't track views when viewing favorites
            }
          })
            .then(res => {
              if (!res.ok) {
                // If slug doesn't work, try with ID as fallback
                if (fav.slug !== fav.id.toString()) {
                  console.log(`Slug ${fav.slug} not found, trying with ID ${fav.id}`);
                  return fetch(API_ENDPOINTS.CARS.GET(fav.id.toString()), {
                    headers: { 'X-View-Tracking': 'false' }
                  });
                }
                throw new Error(`Failed to fetch car with ID/slug ${fav.id}/${fav.slug}`);
              }
              return res;
            })
            .then(res => {
              if (!res.ok) throw new Error(`Failed to fetch car`);
              return res.json();
            })
            .then(data => {
              // Store the slug for future use
              if (data.slug && data.id) {
                // Update the stored slug if it's different
                const stored = storedFavorites.find(sf => sf.id === data.id);
                if (!stored || stored.slug !== data.slug) {
                  setStoredFavorites(prev => {
                    const newFavs = prev.filter(sf => sf.id !== data.id);
                    newFavs.push({ id: data.id, slug: data.slug });
                    
                    // Update localStorage
                    try {
                      localStorage.setItem('car_favorites_with_slugs', JSON.stringify(newFavs));
                    } catch (error) {
                      console.error('Error saving favorites with slugs:', error);
                    }
                    
                    return newFavs;
                  });
                }
              }
              return data;
            })
            .catch(error => {
              console.error('Error fetching individual car:', error);
              return null; // Return null for failed car fetches
            })
        );

        const carsData = await Promise.all(carPromises);
        
        // Filter out any null values (failed fetches)
        const validCars = carsData.filter(car => car !== null);
        
        setFavoritesCars(validCars);
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
  }, [favorites, setFavoritesCars, storedFavorites]);

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