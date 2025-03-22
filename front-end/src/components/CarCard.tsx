import { Car } from "../types/car";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import FavoriteButton from "./FavouriteButton";

interface CarCardProps {
  car: Car;
}

const CarCard = ({ car }: CarCardProps) => {
  // Get the primary image or the first image if no primary is set
  const getDisplayImage = () => {
    if (car.images && car.images.length > 0) {
      // First try to find the primary image
      const primaryImage = car.images.find(img => img.is_primary);
      
      if (primaryImage) {
        // Check if Cloudinary URL is available
        if (primaryImage.url) {
          return primaryImage.url;
        }
        return primaryImage.image;
      }
      
      // If no primary image, use the first image
      if (car.images[0].url) {
        return car.images[0].url;
      }
      return car.images[0].image;
    }
    return "";
  };

  const displayImage = getDisplayImage();

  // Format registration date from individual fields
  const getFormattedRegistration = () => {
    if (car.first_registration_year && car.first_registration_month) {
      return `${car.first_registration_month}/${car.first_registration_year}`;
    }
    return "N/A";
  };

  const fuelInfo = car.fuel_type || "N/A";
  const registrationInfo = getFormattedRegistration();
  
  // Check if the image is already a full URL (Cloudinary or otherwise)
  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${API_BASE_URL}${imageUrl}`;
  };

  return (
    <Link 
      to={`/car/${car.id}`}
      className="bg-white shadow overflow-hidden transition-transform hover:scale-105 cursor-pointer w-full mx-auto flex flex-col h-64 m-1 rounded-sm sm:h-80 sm:m-0.5 sm:shadow-lg sm:rounded-sm"
    >
      <div className="relative h-36 flex-[0.6] sm:h-44">
        {/* Favorite button positioned at top right */}
        <div className="absolute top-1 right-1 z-10 sm:top-2 sm:right-2">
          <FavoriteButton carId={car.id} />
        </div>
        
        {displayImage ? (
          <img
            src={getImageUrl(displayImage)}
            alt={`${car.brand} ${car.model_name}`}
            className="w-full h-full object-cover rounded-t-sm"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              const target = e.target as HTMLImageElement;
              target.src = `${API_BASE_URL}/api/placeholder/400/300`;
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-t-sm">
            <span className="text-gray-400 text-xs">No Image</span>
          </div>
        )}
      </div>
      <div className="p-1.5 flex-[0.4] flex flex-col justify-between h-28 sm:p-2 sm:h-36">
        <h3 className="text-xs font-bold text-gray-700 truncate sm:text-base">
          {car.brand} {car.model_name} 
          {car.variant_name && (
            <span className="text-gray-500 font-normal text-xs ml-0.5 sm:text-sm sm:ml-1">{car.variant_name}</span>
          )}
        </h3>
        <div className="flex items-center mb-0.5 sm:mb-1">
          <span className="text-sm font-semibold text-blue-600 sm:text-lg">
            {car.discussed_price ? "I diskutueshem" : `$${Number(car.price).toLocaleString()}`}
          </span>
        </div>
        <div className="mt-0.5 mb-0.5 overflow-hidden sm:mt-1 sm:mb-1">
          <span className="text-xs bg-gray-100 px-1 py-0.5 truncate block max-w-full rounded-sm sm:px-2 sm:py-1" title={`${fuelInfo}, ${registrationInfo}, ${car.mileage.toLocaleString()} km`}>
            {fuelInfo} | {registrationInfo} | {car.mileage.toLocaleString()} km
          </span>
        </div>
        <p className="text-xs truncate text-gray-600 text-[10px] sm:text-sm" title={car.description}>{car.description}</p>
        <div className="mt-0.5 overflow-hidden sm:mt-1">
          <p className="text-[10px] text-gray-500 truncate sm:text-xs">Created: {new Date(car.created_at).toLocaleDateString()}</p>
        </div>
      </div>
    </Link>
  );
};

export default CarCard;