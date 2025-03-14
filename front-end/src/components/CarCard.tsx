import React from "react";
import { Car } from "../types/car";
import { Link } from "react-router-dom";

interface CarCardProps {
  car: Car;
}

const CarCard = ({ car }: CarCardProps) => {
  // Get the primary image or the first image if no primary is set
  const getDisplayImage = () => {
    if (car.images && car.images.length > 0) {
      const primaryImage = car.images.find(img => img.is_primary);
      if (primaryImage) {
        return primaryImage.image;
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

  return (
    <Link 
      to={`/car/${car.id}`}
      className="block bg-white shadow-lg overflow-hidden transition-transform hover:scale-105 cursor-pointer w-11/12 mx-auto flex flex-col h-80"
    >
      <div className="relative h-44 flex-[0.6]">
        {displayImage ? (
          <img
            src={displayImage.startsWith('http') ? displayImage : `http://localhost:8000${displayImage}`}
            alt={`${car.brand} ${car.model_name}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No Image Available</span>
          </div>
        )}
      </div>
      <div className="p-2 flex-[0.4] flex flex-col justify-between">
        <h3 className="text-base font-bold text-gray-700">
          {car.brand} {car.model_name} 
          {car.variant_name && (
            <span className="text-gray-500 font-normal text-sm ml-1">{car.variant_name}</span>
          )}
        </h3>
        <div className="flex items-center mb-1">
          <span className="text-lg font-semibold text-blue-600">
            ${Number(car.price).toLocaleString()}
          </span>
        </div>
        <div className="mt-1 mb-1">
          <span className="text-xs bg-gray-100 px-2 py-1 truncate block max-w-full" title={`${fuelInfo}, ${registrationInfo}, ${car.mileage.toLocaleString()} km`}>
            {fuelInfo} | {registrationInfo} | {car.mileage.toLocaleString()} km
          </span>
        </div>
        <p className="text-gray-600 text-sm truncate" title={car.description}>{car.description}</p>
        <div className="mt-2">
          <p className="text-xs text-gray-500">Created: {new Date(car.created_at).toLocaleDateString()}</p>
        </div>
      </div>
    </Link>
  );
};

export default CarCard;