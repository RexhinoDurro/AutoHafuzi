import React, { useEffect, useState } from 'react';
import { useFavorites } from '../context/FavouritesContext';
import CarCard from '../components/CarCard';
import { Car } from '../types/car';

const FavoritesPage: React.FC = () => {
  const { favorites, favoritesCars, setFavoritesCars, clearAllFavorites } = useFavorites();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
          fetch(`http://localhost:8000/api/cars/${id}/`)
            .then(res => {
              if (!res.ok) throw new Error(`Failed to fetch car with ID ${id}`);
              return res.json();
            })
        );

        const carsData = await Promise.all(carPromises);
        setFavoritesCars(carsData);
      } catch (error) {
        console.error('Error fetching favorite cars:', error);
        setError('Failed to fetch favorite cars. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteCars();
  }, [favorites, setFavoritesCars]);

  const handleClearFavorites = () => {
    clearAllFavorites();
    // Optional: Show a success message or notification
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Favorite Cars</h1>
        {favorites.length > 0 && (
          <button 
            onClick={handleClearFavorites}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            Clear All Favorites
          </button>
        )}
      </div>

      {loading && <p className="text-center text-gray-500">Loading favorite cars...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          {favoritesCars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {favoritesCars.map((car: Car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <h2 className="text-xl font-semibold mb-2">No favorite cars yet</h2>
              <p className="text-gray-600 mb-4">
                Browse our collection and click the heart icon to add cars to your favorites.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FavoritesPage;