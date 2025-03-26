import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Car } from '../types/car';
import { navigateToCarDetail } from '../utils/navigation';
import FavoriteButton from './FavouriteButton';
import { API_BASE_URL } from '../config/api';

interface CarCardProps {
  car: Car;
  showFavoriteButton?: boolean;
  isFromFavorites?: boolean;
  onClick?: (event: React.MouseEvent) => void; // Added onClick prop for external handling
}

const CarCard: React.FC<CarCardProps> = ({ 
  car, 
  showFavoriteButton = true,
  isFromFavorites = false,
  onClick // New prop
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get primary image URL
  const getPrimaryImageUrl = () => {
    if (!car.images || car.images.length === 0) {
      return `${API_BASE_URL}/api/placeholder/400/300`;
    }
    
    const primaryImage = car.images.find(img => img.is_primary);
    const image = primaryImage || car.images[0];
    
    return image.url || image.image || `${API_BASE_URL}/api/placeholder/400/300`;
  };

  // Handle card click - use the centralized navigation utility
  const handleCardClick = (e: React.MouseEvent) => {
    // If an external onClick handler is provided, use that instead
    if (onClick) {
      onClick(e);
      return;
    }
    
    e.preventDefault();
    
    // Use the car slug if available, otherwise use the ID
    const carIdentifier = car.slug || car.id;
    
    // Don't track views when coming from favorites or admin pages
    const shouldTrackView = !isFromFavorites && 
                          !location.pathname.includes('/admin') &&
                          !location.pathname.includes('/auth');
    
    // If we're already on the car detail page for this car, force refresh
    if (location.pathname === `/car/${carIdentifier}`) {
      // Navigate away first
      navigate('/cars', { replace: true, state: { tempNavigation: true } });
      
      // Then navigate back to the car detail
      setTimeout(() => {
        navigateToCarDetail(navigate, carIdentifier, {
          trackView: shouldTrackView,
          from: '/cars'
        });
      }, 0);
    } else {
      // Normal navigation
      navigateToCarDetail(navigate, carIdentifier, {
        trackView: shouldTrackView,
        from: location.pathname
      });
    }
  };

  return (
    <div className="car-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Card image with click handler */}
      <div 
        className="relative w-full h-40 cursor-pointer" 
        onClick={handleCardClick}
      >
        <img
          src={getPrimaryImageUrl()}
          alt={`${car.brand} ${car.model_name}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `${API_BASE_URL}/api/placeholder/400/300`;
          }}
        />
        
        {/* Favorite button overlay if enabled */}
        {showFavoriteButton && (
          <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
            <FavoriteButton 
              carId={car.id} 
              size={20} 
              className="bg-white bg-opacity-70 p-1 rounded-full"
            />
          </div>
        )}
      </div>
      
      {/* Card content */}
      <div className="p-3">
        <h3 
          className="font-bold text-lg mb-1 cursor-pointer" 
          onClick={handleCardClick}
        >
          {car.brand} {car.model_name} {car.variant_name}
        </h3>
        
        <div className="text-gray-700 text-sm mb-2">
          <span>{car.first_registration_year || 'N/A'}</span>
          <span className="mx-1">•</span>
          <span>{car.mileage?.toLocaleString() || 'N/A'} km</span>
          <span className="mx-1">•</span>
          <span>{car.fuel_type}</span>
        </div>
        
        <div className="flex justify-between items-center mt-2">
          <span className="font-bold text-blue-600">
            {car.discussed_price 
              ? "I diskutueshem" 
              : `€${typeof car.price === 'number' 
                    ? car.price.toLocaleString() 
                    : parseInt(car.price as unknown as string).toLocaleString()}`
            }
          </span>
          
          <button
            onClick={handleCardClick}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Shiko →
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarCard;