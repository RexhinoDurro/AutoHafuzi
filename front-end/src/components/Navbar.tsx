import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CarFront, Phone, ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext'; // Import the language context
import { Language } from '../context/LanguageContext';

const Navbar = () => {
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const { currentLanguage, setLanguage, t } = useLanguage(); // Use language context

  const languages: Language[] = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "de", name: "German", flag: "🇩🇪" },
    { code: "sq", name: "Albanian", flag: "🇦🇱" },
    { code: "it", name: "Italian", flag: "🇮🇹" },
  ];
  

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <CarFront className="h-8 w-8 text-green-600" />
              <span className="text-xl font-bold text-green-600">{t("Auto Hafuzi")}</span>
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-8">
            <Link to="/rental" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors">
              <CarFront className="h-5 w-5" />
              <span className="font-medium">{t("rental")}</span>
            </Link>

            <Link to="/contact" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors">
              <Phone className="h-5 w-5" />
              <span className="font-medium">{t("contact")}</span>
            </Link>

            {/* Language Selector */}
            <div className="relative">
              <button 
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <span className="text-xl">{currentLanguage.flag}</span>
                <ChevronDown className="h-4 w-4 text-gray-600" />
              </button>

              {/* Dropdown Menu */}
              {isLanguageOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang);
                        setIsLanguageOpen(false);
                      }}
                      className="flex items-center space-x-3 px-4 py-2 w-full text-left hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-xl">{lang.flag}</span>
                      <span className="text-gray-700">{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
