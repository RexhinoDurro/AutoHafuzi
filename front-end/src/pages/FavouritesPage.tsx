import React, { useEffect, useState } from 'react';
import { useFavorites } from '../context/FavouritesContext';
import CarCard from '../components/CarCard';
import { Car } from '../types/car';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';

const FavoritesPage: React.FC = () => {
  const { favorites, favoritesCars, setFavoritesCars, clearAllFavorites } = useFavorites();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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
        // Fetch each favorite car by ID
        const carPromises = favorites.map(id => 
          fetch(API_ENDPOINTS.CARS.GET(id.toString()), {
            headers: {
              // Set the headers to explicitly indicate this is NOT a view to track
              'X-View-Tracking': 'false'
            }
          })
            .then(res => {
              if (!res.ok) throw new Error(`Failed to fetch car with ID ${id}`);
              return res.json();
            })
        );

        const carsData = await Promise.all(carPromises);
        setFavoritesCars(carsData);
      } catch (error) {
        console.error('Error fetching favorite cars:', error);
        setError('Dështoi në marrjen e makinave të preferuara. Ju lutemi provoni përsëri më vonë.');
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteCars();
  }, [favorites, setFavoritesCars]);

  const handleClearFavorites = () => {
    clearAllFavorites();
  };

  // Enhanced navigation function with clear source tracking
  const handleCarClick = (car: Car) => {
    // Store the source in sessionStorage with a clear identifier
    sessionStorage.setItem('carDetailReferrer', '/favorites');
    
    // Also include the info in the navigation state for immediate reference
    navigate(`/car/${car.id}`, { 
      state: { 
        from: '/favorites',
        doNotTrackView: true // Add an explicit flag
      }
    });
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
                <div key={car.id} onClick={() => handleCarClick(car)} className="cursor-pointer transition-transform hover:scale-102 hover:shadow-lg">
                  <CarCard car={car} />
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