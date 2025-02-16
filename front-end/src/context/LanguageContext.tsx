import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the structure for a language
export type Language = {
  code: 'en' | 'de' | 'sq' | 'it';
  name: string;
  flag: string;
};

// Define the structure for translations
type Translations = {
  [key in Language['code']]: Record<string, string>;
};

// Define the translations
const translations: Translations = {
  en: {
    rental: "Rental",
    contact: "Contact",
    carMarketplace: "Car Marketplace",
    adminDashboard: "Admin Dashboard",
    addNewCar: "Add New Car",
    image: "Image",
    make: "Make",
    model: "Model",
    year: "Year",
    price: "Price",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
    noImage: "No Image",
    confirmDelete: "Are you sure you want to delete this car?",
    noImageAvailable: "No Image Available",
    color: "Color",
  },
  de: {
    rental: "Vermietung",
    contact: "Kontakt",
    carMarketplace: "Auto Marktplatz",
    adminDashboard: "Admin-Dashboard",
    addNewCar: "Neues Auto hinzufügen",
    image: "Bild",
    make: "Marke",
    model: "Modell",
    year: "Jahr",
    price: "Preis",
    actions: "Aktionen",
    edit: "Bearbeiten",
    delete: "Löschen",
    noImage: "Kein Bild",
    confirmDelete: "Sind Sie sicher, dass Sie dieses Auto löschen möchten?",
    noImageAvailable: "Kein Bild verfügbar",
    color: "Farbe",
  },
  sq: {
    rental: "Qira",
    contact: "Kontakt",
    carMarketplace: "Tregu i Makinave",
    adminDashboard: "Paneli i Administratorit",
    addNewCar: "Shto Makinë të Re",
    image: "Imazh",
    make: "Marka",
    model: "Modeli",
    year: "Viti",
    price: "Çmimi",
    actions: "Veprimet",
    edit: "Ndrysho",
    delete: "Fshi",
    noImage: "Pa Imazh",
    confirmDelete: "Jeni të sigurt që dëshironi ta fshini këtë makinë?",
    noImageAvailable: "Nuk ka Imazh",
    color: "Ngjyra",
  },
  it: {
    rental: "Noleggio",
    contact: "Contatto",
    carMarketplace: "Mercato Auto",
    adminDashboard: "Dashboard Admin",
    addNewCar: "Aggiungi Nuova Auto",
    image: "Immagine",
    make: "Marca",
    model: "Modello",
    year: "Anno",
    price: "Prezzo",
    actions: "Azioni",
    edit: "Modifica",
    delete: "Elimina",
    noImage: "Nessuna Immagine",
    confirmDelete: "Sei sicuro di voler eliminare questa auto?",
    noImageAvailable: "Nessuna Immagine Disponibile",
    color: "Colore",
  }
};

// Default language
const defaultLanguage: Language = {
  code: 'en',
  name: 'English',
  flag: '🇬🇧'
};

// Define the context type
type LanguageContextType = {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

// Create the context with default values
export const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: defaultLanguage,
  setLanguage: () => {},
  t: (key: string) => key,
});

// Language Provider component
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(defaultLanguage);

  // Load language from localStorage on mount
  useEffect(() => {
    const storedLang = localStorage.getItem('selectedLanguage');
    if (storedLang) {
      setCurrentLanguage(JSON.parse(storedLang));
    }
  }, []);

  // Save language selection to localStorage
  useEffect(() => {
    localStorage.setItem('selectedLanguage', JSON.stringify(currentLanguage));
  }, [currentLanguage]);

  // ✅ FIXED: Properly define setLanguage
  const setLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
  };

  // Function to get translation
  const t = (key: string): string => {
    return translations[currentLanguage.code]?.[key] || translations["en"][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook for using language context
export const useLanguage = () => useContext(LanguageContext);
