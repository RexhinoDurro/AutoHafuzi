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

  // Load favorites from localStorage when the component mounts
  useEffect(() => {
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
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }, [favorites]);

  const addFavorite = (carId: number) => {
    console.log(`Adding favorite: ${carId}`);
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
    localStorage.removeItem(FAVORITES_STORAGE_KEY);
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