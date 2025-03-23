import { Car } from "../types/car";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import FavoriteButton from "./FavouriteButton";
import ResponsiveImage from "./ResponsiveImage";

interface CarCardProps {
  car: Car;
}

const CarCard = ({ car }: CarCardProps) => {
  // Optimized function to get properly sized images with WebP/AVIF support
  const getDisplayImage = (width = 400, height = 300) => {
    if (!car.images || car.images.length === 0) {
      return `${API_BASE_URL}/api/placeholder/${width}/${height}`;
    }
    
    // First try to find the primary image
    const primaryImage = car.images.find(img => img.is_primary);
    const imageToUse = primaryImage || car.images[0];
    
    // Check if Cloudinary URL is available
    if (imageToUse.url && imageToUse.url.includes('cloudinary')) {
      // Extract base URL and add responsive transformations
      const parts = imageToUse.url.split('/upload/');
      if (parts.length === 2) {
        // Add optimized transformations:
        // - w_{width} - Set width
        // - h_{height} - Set height
        // - c_fill - Crop to fill the dimensions
        // - q_auto - Automatic quality optimization
        // - f_auto - Automatic format selection (WebP for supported browsers)
        return `${parts[0]}/upload/w_${width},h_${height},c_fill,q_auto,f_auto/${parts[1]}`;
      }
      return imageToUse.url;
    }
    
    // Use regular URL if Cloudinary transformation isn't possible
    if (imageToUse.url) {
      return imageToUse.url;
    }
    
    // Fallback to image path
    return imageToUse.image.startsWith('http') 
      ? imageToUse.image 
      : `${API_BASE_URL}${imageToUse.image}`;
  };

  // Format registration date from individual fields
  const getFormattedRegistration = () => {
    if (car.first_registration_year && car.first_registration_month) {
      return `${car.first_registration_month}/${car.first_registration_year}`;
    }
    return "N/A";
  };

  const fuelInfo = car.fuel_type || "N/A";
  const registrationInfo = getFormattedRegistration();
  
  return (
    <Link 
      to={`/car/${car.slug}`}
      className="bg-white shadow overflow-hidden transition-transform hover:scale-105 cursor-pointer w-full mx-auto flex flex-col h-64 m-1 rounded-sm sm:h-80 sm:m-0.5 sm:shadow-lg sm:rounded-sm"
    >
      <div className="relative h-36 flex-[0.6] sm:h-44">
        {/* Favorite button positioned at top right */}
        <div className="absolute top-1 right-1 z-10 sm:top-2 sm:right-2">
          <FavoriteButton carId={car.id} />
        </div>
        
        {/* Image Container with fixed dimensions */}
        <div className="w-full h-full overflow-hidden">
          {car.images && car.images.length > 0 ? (
            <ResponsiveImage
              src={getDisplayImage(400, 300)}
              alt={`${car.brand} ${car.model_name}`}
              width={400}
              height={300}
              className="w-full h-full object-cover rounded-t-sm"
              lazy={true}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              placeholder={`${API_BASE_URL}/api/placeholder/400/300`}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-t-sm">
              <span className="text-gray-400 text-xs">No Image</span>
            </div>
          )}
        </div>
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