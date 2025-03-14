import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import CarImageCarousel from '../components/ImageGallery';
import { Car } from '../types/car';
import { Clock, Settings, Calendar, Fuel, Zap, Sofa, Music, Shield, Star, Eye } from 'lucide-react';
import FavoriteButton from '../components/FavouriteButton';
import { trackCarView } from '../utils/userActivityService';
import RecommendedCars from '../components/RecommendedCars';

// Interfaces for color data
interface ExteriorColor {
  id: number;
  name: string;
  hex_code: string;
}

interface InteriorColor {
  id: number;
  name: string;
  hex_code: string;
  upholstery: string;
}

// Interface for option data
interface Option {
  id: number;
  name: string;
  category: string;
}

// Updated OptionCategories interface to match backend categories
interface OptionCategories {
  'COMFORT': string[];
  'ENTERTAINMENT': string[];
  'SAFETY': string[];
  'EXTRAS': string[];
}

// Category label mapping
const categoryLabels: Record<string, string> = {
  'COMFORT': 'Rehatia & Komoditeti',
  'ENTERTAINMENT': 'Argëtimi & Media',
  'SAFETY': 'Siguria & Mbrojtja',
  'EXTRAS': 'Ekstra'
};

const CarDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<Option[]>([]);
  const [exteriorColors, setExteriorColors] = useState<ExteriorColor[]>([]);
  const [interiorColors, setInteriorColors] = useState<InteriorColor[]>([]);
  const [referrer, setReferrer] = useState<string>('/');

  useEffect(() => {
    // Check if we have a referrer in sessionStorage, otherwise default to current referrer
    const storedReferrer = sessionStorage.getItem('carDetailReferrer');
    
    if (storedReferrer) {
      setReferrer(storedReferrer);
    } else {
      // Store the referrer path when component mounts
      const referrerPath = document.referrer;
      
      // Try to determine if we came from CarHolder or Home based on the URL
      if (location.state && location.state.from) {
        setReferrer(location.state.from);
        sessionStorage.setItem('carDetailReferrer', location.state.from);
      } else if (referrerPath.includes('/cars')) {
        setReferrer('/cars');
        sessionStorage.setItem('carDetailReferrer', '/cars');
      } else {
        // Default to home if we can't determine
        setReferrer('/');
        sessionStorage.setItem('carDetailReferrer', '/');
      }
    }
  }, [location]);

  // Handle the back button click
  const handleBackClick = () => {
    navigate(referrer);
    // Clear the stored referrer after navigation
    sessionStorage.removeItem('carDetailReferrer');
  };

  // Fetch colors and options data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [optionsRes, exteriorColorsRes, interiorColorsRes] = await Promise.all([
          fetch('http://localhost:8000/api/options/list/'),
          fetch('http://localhost:8000/api/exterior-colors/'),
          fetch('http://localhost:8000/api/interior-colors/')
        ]);
        
        if (!optionsRes.ok || !exteriorColorsRes.ok || !interiorColorsRes.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const [optionsData, exteriorColorsData, interiorColorsData] = await Promise.all([
          optionsRes.json(),
          exteriorColorsRes.json(),
          interiorColorsRes.json()
        ]);
        
        setOptions(optionsData);
        setExteriorColors(exteriorColorsData);
        setInteriorColors(interiorColorsData);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };

    fetchData();
  }, []);

  // Fetch car details
  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        // Ensure we're sending cookies with the request
        // Add a custom header to mark this request for analytics tracking
        const response = await fetch(`http://localhost:8000/api/cars/${id}/`, {
          method: 'GET',
          credentials: 'include', 
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-For-Analytics': 'true' // Add this header to mark for tracking
          }
        });
        
        if (!response.ok) {
          throw new Error('Car not found');
        }
        const data = await response.json();
        setCar(data);
        
        // Track this car view for recommendations
        if (data.id && data.brand && data.model_name) {
          trackCarView(data.id, data.brand, data.model_name);
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch car details');
      } finally {
        setLoading(false);
      }
    };
  
    fetchCarDetails();
  }, [id]);

  // Group options by category for display
  const categorizeOptions = (): OptionCategories => {
    const categories: OptionCategories = {
      'COMFORT': [],
      'ENTERTAINMENT': [],
      'SAFETY': [],
      'EXTRAS': []
    };
    
    if (!car || !car.options || !options.length) return categories;
    
    // Find the option objects that match the car's option IDs
    const carOptionIds = Array.isArray(car.options) 
      ? car.options 
      : typeof car.options === 'string' 
        ? JSON.parse(car.options)
        : [];
    
    // Match options by ID and categorize them
    options.forEach(option => {
      if (carOptionIds.includes(option.id)) {
        categories[option.category as keyof OptionCategories]?.push(option.name);
      }
    });
    
    return categories;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Duke u ngarkuar...</div>;
  }

  if (error || !car) {
    return <div className="flex justify-center items-center h-screen text-red-600">{error}</div>;
  }
  
  // Get categorized options
  const optionsByCategory = categorizeOptions();
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button
        onClick={handleBackClick}
        className="mb-6 text-blue-600 hover:text-blue-800"
      >
        ← Kthehu te listimi
      </button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          <div className="space-y-6">
            <CarImageCarousel images={car.images} />
            
            {/* Key Specifications Box */}
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="flex flex-col items-center text-center">
                  <Clock className="text-blue-600 mb-2" size={24} />
                  <p className="text-gray-600 text-sm">Kilometrazhi</p>
                  <p className="font-bold">{car.mileage.toLocaleString()} km</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Settings className="text-blue-600 mb-2" size={24} />
                  <p className="text-gray-600 text-sm">Transmisioni</p>
                  <p className="font-bold">{car.gearbox}</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Calendar className="text-blue-600 mb-2" size={24} />
                  <p className="text-gray-600 text-sm">Regjistrimi i parë</p>
                  <p className="font-bold">{car.first_registration || 'N/A'}</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Fuel className="text-blue-600 mb-2" size={24} />
                  <p className="text-gray-600 text-sm">Lloji i karburantit</p>
                  <p className="font-bold">{car.fuel_type}</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Zap className="text-blue-600 mb-2" size={24} />
                  <p className="text-gray-600 text-sm">Fuqia</p>
                  <p className="font-bold">{car.power} kW ({Math.round(car.power * 1.36)} hp)</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">{car.brand} {car.model_name} {car.variant_name}</h1>
            
            {/* Price with favorite button and view counter */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-blue-600">
                ${typeof car.price === 'number' 
                  ? car.price.toLocaleString() 
                  : Number(car.price).toLocaleString()}
              </h2>
              <div className="flex items-center space-x-4">
                {/* View Counter */}
                <div className="flex items-center text-gray-500" title="Number of views">
                  <Eye size={20} className="mr-1" />
                  <span>{car.view_count}</span>
                </div>
                
                {/* Favorite Button */}
                <FavoriteButton 
                  carId={car.id} 
                  size={28} 
                  className="p-2 hover:bg-gray-100 rounded-full"
                />
              </div>
            </div>
          </div>

          <div className="space-y-8">
          <section className="space-y-4">
            <h3 className="text-xl font-semibold">Informacione Bazë</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Viti i Regjistrimit</p>
                <p className="font-medium">{car.first_registration_year || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">Lloji i karocerisë</p>
                <p className="font-medium">{car.body_type}</p>
              </div>
              <div>
                <p className="text-gray-600">Gjendja</p>
                <p className="font-medium">{car.is_used ? 'I përdorur' : 'I ri'}</p>
              </div>
              {/* General inspection date is removed as requested */}
            </div>
          </section>

            {/* Fixed Colors Section */}
            <section className="space-y-4">
              <h3 className="text-xl font-semibold">Ngjyrat</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Exterior Color */}
                {car.exterior_color_name && (
                  <div>
                    <p className="text-gray-600">Ngjyra e jashtme</p>
                    <div className="flex items-center">
                      {car.exterior_color_hex && (
                        <div 
                          className="w-4 h-4 mr-2 rounded-full border border-gray-300" 
                          style={{ backgroundColor: car.exterior_color_hex }}
                        ></div>
                      )}
                      <p className="font-medium">{car.exterior_color_name}</p>
                    </div>
                  </div>
                )}
                
                {/* Interior Color */}
                {car.interior_color_name && (
                  <div>
                    <p className="text-gray-600">Ngjyra e brendshme</p>
                    <div className="flex items-center">
                      {car.interior_color_hex && (
                        <div 
                          className="w-4 h-4 mr-2 rounded-full border border-gray-300" 
                          style={{ backgroundColor: car.interior_color_hex }}
                        ></div>
                      )}
                      <p className="font-medium">{car.interior_color_name}</p>
                    </div>
                  </div>
                )}
                
                {/* Upholstery */}
                {car.interior_upholstery && (
                  <div>
                    <p className="text-gray-600">Tapiceria</p>
                    <p className="font-medium">{car.interior_upholstery}</p>
                  </div>
                )}
              </div>
            </section>

            {/* Remaining sections remain unchanged */}
            <section className="space-y-4">
              <h3 className="text-xl font-semibold">Specifikimet Teknike</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Madhësia e motorit</p>
                  <p className="font-medium">{car.engine_size}L</p>
                </div>
                <div>
                  <p className="text-gray-600">Ingranazhet</p>
                  <p className="font-medium">{car.gears}</p>
                </div>
                <div>
                  <p className="text-gray-600">Cilindrat</p>
                  <p className="font-medium">{car.cylinders}</p>
                </div>
                <div>
                  <p className="text-gray-600">Pesha</p>
                  <p className="font-medium">{car.weight} kg</p>
                </div>
                <div>
                  <p className="text-gray-600">Klasa e emetimit</p>
                  <p className="font-medium">{car.emission_class}</p>
                </div>
                <div>
                  <p className="text-gray-600">Doganat e paguara</p>
                  <p className="font-medium">{car.customs_paid ? 'Po' : 'Jo'}</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xl font-semibold">Detajet e Automjetit</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Vendet</p>
                  <p className="font-medium">{car.seats}</p>
                </div>
                <div>
                  <p className="text-gray-600">Dyert</p>
                  <p className="font-medium">{car.doors}</p>
                </div>
                <div>
                  <p className="text-gray-600">Historiku i servisit</p>
                  <p className="font-medium">{car.full_service_history ? 'I plotë' : 'I pjesshëm'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Sistemi i transmetimit</p>
                  <p className="font-medium">{car.drivetrain}</p>
                </div>
              </div>
            </section>

            {/* Categorized Options - Updated to match backend structure */}
            {options.length > 0 && car.options && (
              <section className="space-y-4">
                <h3 className="text-xl font-semibold">Veçoritë</h3>
                
                {/* Comfort & Convenience */}
                {optionsByCategory['COMFORT'] && optionsByCategory['COMFORT'].length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <Sofa className="text-blue-600 mr-2" size={20} />
                      <h4 className="font-medium">{categoryLabels['COMFORT']}</h4>
                    </div>
                    <ul className="list-disc pl-8 grid grid-cols-1 md:grid-cols-2 gap-1">
                      {optionsByCategory['COMFORT'].map((option: string, index: number) => (
                        <li key={index} className="text-gray-700">{option}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Entertainment & Media */}
                {optionsByCategory['ENTERTAINMENT'] && optionsByCategory['ENTERTAINMENT'].length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <Music className="text-blue-600 mr-2" size={20} />
                      <h4 className="font-medium">{categoryLabels['ENTERTAINMENT']}</h4>
                    </div>
                    <ul className="list-disc pl-8 grid grid-cols-1 md:grid-cols-2 gap-1">
                      {optionsByCategory['ENTERTAINMENT'].map((option: string, index: number) => (
                        <li key={index} className="text-gray-700">{option}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Safety & Security */}
                {optionsByCategory['SAFETY'] && optionsByCategory['SAFETY'].length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <Shield className="text-blue-600 mr-2" size={20} />
                      <h4 className="font-medium">{categoryLabels['SAFETY']}</h4>
                    </div>
                    <ul className="list-disc pl-8 grid grid-cols-1 md:grid-cols-2 gap-1">
                      {optionsByCategory['SAFETY'].map((option: string, index: number) => (
                        <li key={index} className="text-gray-700">{option}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Extras */}
                {optionsByCategory['EXTRAS'] && optionsByCategory['EXTRAS'].length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <Star className="text-blue-600 mr-2" size={20} />
                      <h4 className="font-medium">Ekstra</h4>
                    </div>
                    <ul className="list-disc pl-8 grid grid-cols-1 md:grid-cols-2 gap-1">
                      {optionsByCategory['EXTRAS'].map((option: string, index: number) => (
                        <li key={index} className="text-gray-700">{option}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}
          </div>
        </div>

        <div className="p-6 border-t">
          <h3 className="text-xl font-semibold mb-4">Përshkrimi</h3>
          <p className="text-gray-700 whitespace-pre-line">{car.description}</p>
        </div>
      </div>

      {/* Add recommendations section at the bottom */}
      {car && (
        <div className="mt-12">
          <RecommendedCars excludeCarIds={[Number(id)]} />
        </div>
      )}
    </div>
  );
};

export default CarDetail;