// front-end/src/context/FavouritesContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Car } from '../types/car';

interface StoredFavorite {
  id: number;
  slug: string;
}

interface FavoritesContextType {
  favorites: number[];
  addFavorite: (carId: number, slug?: string) => void;
  removeFavorite: (carId: number) => void;
  isFavorite: (carId: number) => boolean;
  getSlugById: (carId: number) => string | undefined;
  favoritesCars: Car[];
  setFavoritesCars: React.Dispatch<React.SetStateAction<Car[]>>;
  clearAllFavorites: () => void;
}

const FAVORITES_COOKIE_NAME = 'car_favorites';
const FAVORITES_WITH_SLUGS_NAME = 'car_favorites_with_slugs';
const COOKIE_EXPIRY_DAYS = 365;

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [favoritesCars, setFavoritesCars] = useState<Car[]>([]);
  const [storedFavorites, setStoredFavorites] = useState<StoredFavorite[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Enhanced debugging utility
  const logDebug = (message: string, data?: any) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[FavoritesContext] ${message}`, data !== undefined ? data : '');
    }
  };

  // Load favorites from localStorage when the component mounts
  useEffect(() => {
    const loadFavorites = () => {
      try {
        // First try to load favorites with slugs
        const savedFavoritesWithSlugs = localStorage.getItem(FAVORITES_WITH_SLUGS_NAME);
        if (savedFavoritesWithSlugs) {
          const parsedFavoritesWithSlugs = JSON.parse(savedFavoritesWithSlugs);
          if (Array.isArray(parsedFavoritesWithSlugs)) {
            logDebug('Loaded stored favorites with slugs:', parsedFavoritesWithSlugs);
            setStoredFavorites(parsedFavoritesWithSlugs);
            // Extract just the IDs for the regular favorites
            const ids = parsedFavoritesWithSlugs.map(fav => fav.id);
            setFavorites(ids);
            setInitialized(true);
            return;
          }
        }
        
        // If no favorites with slugs, try regular favorites
        const savedFavorites = localStorage.getItem(FAVORITES_COOKIE_NAME);
        if (savedFavorites) {
          const parsedFavorites = JSON.parse(savedFavorites);
          if (Array.isArray(parsedFavorites)) {
            logDebug('Loaded regular favorites, creating stored favorites:', parsedFavorites);
            setFavorites(parsedFavorites);
            // Create stored favorites with just IDs (slugs will be updated later)
            setStoredFavorites(parsedFavorites.map(id => ({ id, slug: id.toString() })));
          }
        }
        
        // Fallback to cookies
        const cookieFavorites = getCookie(FAVORITES_COOKIE_NAME);
        if (cookieFavorites) {
          const parsedFavorites = JSON.parse(cookieFavorites);
          if (Array.isArray(parsedFavorites)) {
            logDebug('Loaded favorites from cookie:', parsedFavorites);
            setFavorites(parsedFavorites);
            setStoredFavorites(parsedFavorites.map(id => ({ id, slug: id.toString() })));
            // Also save to localStorage for future
            localStorage.setItem(FAVORITES_COOKIE_NAME, cookieFavorites);
          }
        }
      } catch (error) {
        console.error('Failed to parse favorites:', error);
        // Reset storage in case of corruption
        localStorage.removeItem(FAVORITES_COOKIE_NAME);
        localStorage.removeItem(FAVORITES_WITH_SLUGS_NAME);
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
      
      // Save favorites with slugs
      const favoritesWithSlugsJson = JSON.stringify(storedFavorites);
      localStorage.setItem(FAVORITES_WITH_SLUGS_NAME, favoritesWithSlugsJson);
      
      logDebug('Saved favorites to storage:', { 
        favorites, 
        storedFavorites,
        favoritesJson,
        favoritesWithSlugsJson
      });
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }, [favorites, storedFavorites, initialized]);

  const addFavorite = (carId: number, slug?: string) => {
    logDebug(`Adding favorite: id=${carId}, slug=${slug || 'not provided'}`);
    
    // If the slug is numeric, make sure we treat it as a slug, not a number
    const safeSlug = slug ? String(slug) : undefined;
    
    // Update regular favorites
    setFavorites(prev => {
      if (!prev.includes(carId)) {
        logDebug(`Adding car ID ${carId} to favorites`);
        return [...prev, carId];
      }
      return prev;
    });
    
    // Update stored favorites with slugs
    setStoredFavorites(prev => {
      // If this car ID is already in the stored favorites, update the slug if provided
      const existingIdx = prev.findIndex(fav => fav.id === carId);
      
      if (existingIdx >= 0) {
        if (safeSlug && prev[existingIdx].slug !== safeSlug) {
          // Create a new array with the updated slug
          logDebug(`Updating slug for car ${carId} from ${prev[existingIdx].slug} to ${safeSlug}`);
          const newStoredFavorites = [...prev];
          newStoredFavorites[existingIdx] = { ...newStoredFavorites[existingIdx], slug: safeSlug };
          return newStoredFavorites;
        }
        return prev;
      }
      
      // Otherwise add a new favorite with the provided slug or carId as fallback
      const newEntry = { id: carId, slug: safeSlug || carId.toString() };
      logDebug(`Added new stored favorite:`, newEntry);
      return [...prev, newEntry];
    });
  };

  const removeFavorite = (carId: number) => {
    logDebug(`Removing favorite: id=${carId}`);
    setFavorites(prev => prev.filter(id => id !== carId));
    setStoredFavorites(prev => prev.filter(fav => fav.id !== carId));
  };

  const isFavorite = (carId: number) => {
    return favorites.includes(carId);
  };
  
  const getSlugById = (carId: number) => {
    const stored = storedFavorites.find(fav => fav.id === carId);
    if (stored?.slug) {
      logDebug(`Found slug for car ${carId}: ${stored.slug}`);
      return stored.slug;
    } else {
      logDebug(`No slug found for car ${carId}`);
      return undefined;
    }
  };

  const clearAllFavorites = () => {
    logDebug('Clearing all favorites');
    setFavorites([]);
    setFavoritesCars([]);
    setStoredFavorites([]);
  };

  return (
    <FavoritesContext.Provider value={{ 
      favorites, 
      addFavorite, 
      removeFavorite, 
      isFavorite,
      getSlugById,
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