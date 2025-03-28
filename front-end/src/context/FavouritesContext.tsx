// front-end/src/context/FavouritesContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Car } from '../types/car';

interface FavoritesContextType {
  favorites: number[];
  addFavorite: (carId: number, slug?: string) => void;
  removeFavorite: (carId: number) => void;
  isFavorite: (carId: number) => boolean;
  favoritesCars: Car[];
  setFavoritesCars: React.Dispatch<React.SetStateAction<Car[]>>;
  clearAllFavorites: () => void;
}

const FAVORITES_STORAGE_KEY = 'car_favorites';

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [favoritesCars, setFavoritesCars] = useState<Car[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Load favorites from localStorage when the component mounts
  useEffect(() => {
    const loadFavorites = () => {
      try {
        const savedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
        if (savedFavorites) {
          const parsedFavorites = JSON.parse(savedFavorites);
          if (Array.isArray(parsedFavorites)) {
            console.log('Loaded favorites from storage:', parsedFavorites);
            setFavorites(parsedFavorites);
          }
        }
      } catch (error) {
        console.error('Failed to parse favorites:', error);
        localStorage.removeItem(FAVORITES_STORAGE_KEY);
      } finally {
        setInitialized(true);
      }
    };

    loadFavorites();
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (!initialized) return;
    
    try {
      const favoritesJson = JSON.stringify(favorites);
      localStorage.setItem(FAVORITES_STORAGE_KEY, favoritesJson);
      console.log('Saved favorites to storage:', favorites);
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }, [favorites, initialized]);

  const addFavorite = (carId: number, slug?: string) => {
    console.log(`Adding favorite: ${carId} (slug: ${slug || 'none'})`);
    
    // Only store the ID in our primary favorites array
    setFavorites(prev => {
      if (!prev.includes(carId)) {
        return [...prev, carId];
      }
      return prev;
    });
  };

  const removeFavorite = (carId: number) => {
    console.log(`Removing favorite: ${carId}`);
    setFavorites(prev => prev.filter(id => id !== carId));
  };

  const isFavorite = (carId: number) => {
    return favorites.includes(carId);
  };

  const clearAllFavorites = () => {
    console.log('Clearing all favorites');
    setFavorites([]);
    setFavoritesCars([]);
  };

  return (
    <FavoritesContext.Provider value={{ 
      favorites, 
      addFavorite, 
      removeFavorite, 
      isFavorite,
      favoritesCars,
      setFavoritesCars,
      clearAllFavorites
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};