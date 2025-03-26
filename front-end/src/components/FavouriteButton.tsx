// front-end/src/components/FavouriteButton.tsx
import React from 'react';
import { Heart } from 'lucide-react';
import { useFavorites } from '../context/FavouritesContext';

interface FavoriteButtonProps {
  carId: number;
  carSlug?: string;
  size?: number;
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ 
  carId, 
  carSlug,
  size = 24, 
  className = "" 
}) => {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const isFav = isFavorite(carId);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isFav) {
      removeFavorite(carId);
    } else {
      // Always pass both ID and slug when adding to favorites
      addFavorite(carId, carSlug || carId.toString());
    }
  };

  return (
    <button 
      onClick={toggleFavorite}
      className={`focus:outline-none transition-colors ${className}`}
      aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
      title={isFav ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart 
        size={size} 
        className={`${isFav ? 'fill-red-500 text-red-500' : 'text-gray-500 hover:text-red-500'} transition-colors`}
      />
    </button>
  );
};

export default FavoriteButton;