import React, { useEffect, useState } from "react";
import axios from "axios";
import { Car } from "../types/car";
import { useLanguage } from "../context/LanguageContext";
import { Link } from "react-router-dom";

interface CarCardProps {
  car: Car;
}

const CarCard = ({ car }: CarCardProps) => {
  const { currentLanguage, t } = useLanguage();
  const [translatedDescription, setTranslatedDescription] = useState(car.description);

  useEffect(() => {
    if (currentLanguage.code !== "en") {
      translateText(car.description, currentLanguage.code);
    } else {
      setTranslatedDescription(car.description);
    }
  }, [car.description, currentLanguage.code]);

  const translateText = async (text: string, targetLang: string) => {
    try {
      const response = await axios.post("https://libretranslate.com/translate", {
        q: text,
        source: "en",
        target: targetLang,
        format: "text",
      });

      setTranslatedDescription(response.data.translatedText);
    } catch (error) {
      console.error("Translation failed:", error);
      setTranslatedDescription(text);
    }
  };

  // Get the primary image or the first image if no primary is set
  const getDisplayImage = () => {
    if (car.images && car.images.length > 0) {
      const primaryImage = car.images.find(img => img.is_primary);
      if (primaryImage) {
        return primaryImage.image;
      }
      return car.images[0].image;
    }
    return car.image;
  };

  const displayImage = getDisplayImage();

  return (
    <Link 
      to={`/car/${car.id}`}
      className="block bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105 cursor-pointer"
    >
      <div className="relative h-48">
        {displayImage ? (
          <img
            src={displayImage.startsWith('http') ? displayImage : `http://localhost:8000${displayImage}`}
            alt={`${car.brand} ${car.model_name}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">{t("noImageAvailable")}</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-base font-bold text-gray-700">{car.brand} {car.model_name}</h3>
        <div className="">
          <span className="text-lg font-semibold text-blue-600">
            ${Number(car.price).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">{car.year}</span>
          <span className="text-gray-600">{car.mileage.toLocaleString()} km</span>
        </div>
        <p className="text-gray-600 text-sm line-clamp-2">{translatedDescription}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="text-xs bg-gray-100 px-2 py-1 rounded">{car.fuel_type}</span>
          <span className="text-xs bg-gray-100 px-2 py-1 rounded">{car.gearbox}</span>
          <span className="text-xs bg-gray-100 px-2 py-1 rounded">{car.body_type}</span>
        </div>
        <div className="mt-2">
          <p className="text-xs text-gray-500">Created: {new Date(car.created_at).toLocaleDateString()}</p>
        </div>
      </div>
    </Link>
  );
};

export default CarCard;