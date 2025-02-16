import React, { useEffect, useState } from "react";
import axios from "axios";
import { Car } from "../types/car";
import { useLanguage } from "../context/LanguageContext";

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
      setTranslatedDescription(car.description); // Default to original if English
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
      setTranslatedDescription(text); // Fallback to original
    }
  };

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
            <span className="text-gray-400">{t("noImageAvailable")}</span>
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
        <p className="text-gray-600 text-sm line-clamp-2">{translatedDescription}</p>
      </div>
    </div>
  );
};

export default CarCard;
