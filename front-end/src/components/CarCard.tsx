// src/components/CarCard.tsx
import React from 'react';
import { Car } from '../types/car';

interface CarCardProps {
  car: Car;
}

const CarCard = ({ car }: CarCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105">
      <div className="relative h-48">
        {car.image ? (
          <img
            src={`http://localhost:8000${car.image}`}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No Image Available</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold mb-2">{car.brand} {car.model}</h3>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">{car.year}</span>
          <span className="text-lg font-semibold text-blue-600">
            ${car.price.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-4 h-4 rounded-full border"
            style={{ backgroundColor: car.color }}
          />
          <span className="text-sm text-gray-600">{car.color}</span>
        </div>
        <p className="text-gray-600 text-sm line-clamp-2">{car.description}</p>
      </div>
    </div>
  );
};

export default CarCard;