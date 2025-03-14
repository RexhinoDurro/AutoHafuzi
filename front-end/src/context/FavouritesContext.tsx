import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Car } from '../types/car';

interface FavoritesContextType {
  favorites: number[];
  addFavorite: (carId: number) => void;
  removeFavorite: (carId: number) => void;
  isFavorite: (carId: number) => boolean;
  favoritesCars: Car[];
  setFavoritesCars: React.Dispatch<React.SetStateAction<Car[]>>;
  clearAllFavorites: () => void;
}

const FAVORITES_COOKIE_NAME = 'car_favorites';
const COOKIE_EXPIRY_DAYS = 365;

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [favoritesCars, setFavoritesCars] = useState<Car[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Load favorites from localStorage when the component mounts
  useEffect(() => {
    const loadFavorites = () => {
      try {
        // First try localStorage (more reliable than cookies)
        const savedFavorites = localStorage.getItem(FAVORITES_COOKIE_NAME);
        if (savedFavorites) {
          const parsedFavorites = JSON.parse(savedFavorites);
          if (Array.isArray(parsedFavorites)) {
            setFavorites(parsedFavorites);
            setInitialized(true);
            return;
          }
        }
        
        // Fallback to cookies
        const cookieFavorites = getCookie(FAVORITES_COOKIE_NAME);
        if (cookieFavorites) {
          const parsedFavorites = JSON.parse(cookieFavorites);
          if (Array.isArray(parsedFavorites)) {
            setFavorites(parsedFavorites);
            // Also save to localStorage for future
            localStorage.setItem(FAVORITES_COOKIE_NAME, cookieFavorites);
          }
        }
      } catch (error) {
        console.error('Failed to parse favorites:', error);
        // Reset storage in case of corruption
        localStorage.removeItem(FAVORITES_COOKIE_NAME);
        deleteCookie(FAVORITES_COOKIE_NAME);
      } finally {
        setInitialized(true);
      }
    };

    loadFavorites();
  }, []);

  // Helper function to get cookie by name
  const getCookie = (name: string): string | null => {
    const nameLenPlus = name.length + 1;
    return document.cookie
      .split(';')
      .map(c => c.trim())
      .filter(cookie => cookie.substring(0, nameLenPlus) === `${name}=`)
      .map(cookie => decodeURIComponent(cookie.substring(nameLenPlus)))[0] || null;
  };

  // Helper function to set cookie
  const setCookie = (name: string, value: string, days = COOKIE_EXPIRY_DAYS) => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;SameSite=Lax`;
  };

  // Helper function to delete cookie
  const deleteCookie = (name: string) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  };

  // Save favorites to both localStorage and cookies whenever the favorites state changes
  useEffect(() => {
    if (!initialized) return;
    
    try {
      const favoritesJson = JSON.stringify(favorites);
      // Save to localStorage (primary storage)
      localStorage.setItem(FAVORITES_COOKIE_NAME, favoritesJson);
      // Also save to cookies as backup
      setCookie(FAVORITES_COOKIE_NAME, favoritesJson);
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }, [favorites, initialized]);

  const addFavorite = (carId: number) => {
    setFavorites(prev => {
      if (!prev.includes(carId)) {
        return [...prev, carId];
      }
      return prev;
    });
  };

  const removeFavorite = (carId: number) => {
    setFavorites(prev => prev.filter(id => id !== carId));
  };

  const isFavorite = (carId: number) => {
    return favorites.includes(carId);
  };

  const clearAllFavorites = () => {
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