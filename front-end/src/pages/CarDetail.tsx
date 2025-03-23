import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import CarImageCarousel from '../components/ImageGallery';
import { Car } from '../types/car';
import { Clock, Settings, Calendar, Fuel, Zap, Sofa, Music, Shield, Star, Eye } from 'lucide-react';
import FavoriteButton from '../components/FavouriteButton';
import { trackCarView } from '../utils/userActivityService';
import RecommendedCars from '../components/RecommendedCars';
import { API_ENDPOINTS } from '../config/api';
import { useMediaQuery } from '../utils/useMediaQuery';

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
  const [referrer, setReferrer] = useState<string>('/');
  
  // Add a state to track if we've done the initial fetch
  // This prevents multiple API calls on component rerenders
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  
  // Add a media query hook to detect mobile screens
  const isMobile = useMediaQuery('(max-width: 768px)');

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

  // Fetch options data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const optionsRes = await fetch(API_ENDPOINTS.OPTIONS.LIST);
        
        if (!optionsRes.ok) {
          throw new Error('Failed to fetch options data');
        }
        
        const optionsData = await optionsRes.json();
        setOptions(optionsData);
      } catch (err) {
        console.error("Failed to fetch options data:", err);
      }
    };

    fetchData();
  }, []);

  // Fetch car details
  useEffect(() => {
    // Skip if we've already done the initial fetch or if id is missing
    if (initialFetchDone || !id) return;
    
    const fetchCarDetails = async () => {
      setLoading(true);
      try {
        // Check for direct "do not track" flag from navigation state
        const doNotTrackViewFromState = location.state && location.state.doNotTrackView === true;
        
        // Multiple checks for whether we should track this view
        const comingFromFavorites = referrer === '/favorites' || 
                                  (location.state && location.state.from === '/favorites');
        
        const comingFromDashboard = referrer.includes('/auth/dashboard') || 
                                   referrer.includes('/admin') ||
                                   (location.state && location.state.from && 
                                    (location.state.from.includes('/auth/dashboard') || 
                                     location.state.from.includes('/admin')));
        
        // Check if this is a page refresh
        const isRefresh = window.performance && 
          window.performance.navigation && 
          window.performance.navigation.type === 1;
        
        // Don't count views if any of these conditions are true
        const shouldTrackView = !comingFromFavorites && 
                               !comingFromDashboard && 
                               !isRefresh && 
                               !doNotTrackViewFromState;
        
        console.log('View tracking decision:', {
          comingFromFavorites,
          comingFromDashboard,
          isRefresh,
          doNotTrackViewFromState,
          shouldTrackView,
          referrer,
          stateFrom: location.state?.from
        });
        
        // Create headers with view tracking flag
        const headers: Record<string, string> = {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-View-Tracking': shouldTrackView ? 'true' : 'false'
        };
        
        // Make the API request
        const response = await fetch(API_ENDPOINTS.CARS.GET(id), {
          method: 'GET',
          credentials: 'include',
          headers: headers
        });
        
        if (!response.ok) {
          throw new Error('Car not found');
        }
        
        const data = await response.json();
        setCar(data);
        
        // Track this car view for recommendations, even if we don't update the view counter
        if (data.id && data.brand && data.model_name) {
          trackCarView(data.id, data.brand, data.model_name);
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch car details');
      } finally {
        setLoading(false);
        setInitialFetchDone(true); // Mark initial fetch as done
      }
    };
  
    fetchCarDetails();
  }, [id, referrer, initialFetchDone, location.state]);

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
        {/* Updated grid for better mobile responsiveness */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 md:p-6">
          <div className="space-y-4 md:space-y-6">
            {/* Pass the isMobile flag to the carousel */}
            <CarImageCarousel 
                  images={car.images || []} 
                  isMobile={isMobile} 
                  onImageChange={(index) => console.log(`Viewing image ${index + 1}`)}
            />
            
            {/* Key Specifications Box - made more mobile-friendly */}
            <div className="bg-gray-100 p-3 md:p-4 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                <div className="flex flex-col items-center text-center">
                  <Clock className="text-blue-600 mb-1 md:mb-2" size={20} />
                  <p className="text-gray-600 text-xs md:text-sm">Kilometrazhi</p>
                  <p className="font-bold text-sm md:text-base">{car.mileage.toLocaleString()} km</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Settings className="text-blue-600 mb-1 md:mb-2" size={20} />
                  <p className="text-gray-600 text-xs md:text-sm">Transmisioni</p>
                  <p className="font-bold text-sm md:text-base">{car.gearbox}</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Calendar className="text-blue-600 mb-1 md:mb-2" size={20} />
                  <p className="text-gray-600 text-xs md:text-sm">Regjistrimi i parë</p>
                  <p className="font-bold text-sm md:text-base">{car.first_registration || 'N/A'}</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Fuel className="text-blue-600 mb-1 md:mb-2" size={20} />
                  <p className="text-gray-600 text-xs md:text-sm">Lloji i karburantit</p>
                  <p className="font-bold text-sm md:text-base">{car.fuel_type}</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Zap className="text-blue-600 mb-1 md:mb-2" size={20} />
                  <p className="text-gray-600 text-xs md:text-sm">Fuqia</p>
                  <p className="font-bold text-sm md:text-base">{car.power} kW ({Math.round(car.power * 1.36)} hp)</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold">{car.brand} {car.model_name} {car.variant_name}</h1>
            
            {/* Price with favorite button and view counter */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-semibold text-blue-600">
              {car.discussed_price ? 
                  "I diskutueshem" : 
                  `$${typeof car.price === 'number' 
                    ? car.price.toLocaleString() 
                    : Number(car.price).toLocaleString()}`
                }
              </h2>
              <div className="flex items-center space-x-4">
                {/* View Counter */}
                <div className="flex items-center text-gray-500" title="Number of views">
                  <Eye size={18} className="mr-1" />
                  <span>{car.view_count}</span>
                </div>
                
                {/* Favorite Button */}
                <FavoriteButton 
                  carId={car.id} 
                  size={24} 
                  className="p-2 hover:bg-gray-100 rounded-full"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6 md:space-y-8">
            <section className="space-y-3 md:space-y-4">
              <h3 className="text-lg md:text-xl font-semibold">Informacione Bazë</h3>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <p className="text-gray-600 text-sm md:text-base">Viti i Regjistrimit</p>
                  <p className="font-medium text-sm md:text-base">{car.first_registration_year || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm md:text-base">Lloji i karocerisë</p>
                  <p className="font-medium text-sm md:text-base">{car.body_type}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm md:text-base">Gjendja</p>
                  <p className="font-medium text-sm md:text-base">{car.is_used ? 'I përdorur' : 'I ri'}</p>
                </div>
              </div>
            </section>

            {/* Fixed Colors Section */}
            <section className="space-y-3 md:space-y-4">
              <h3 className="text-lg md:text-xl font-semibold">Ngjyrat</h3>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {/* Exterior Color */}
                {car.exterior_color_name && (
                  <div>
                    <p className="text-gray-600 text-sm md:text-base">Ngjyra e jashtme</p>
                    <div className="flex items-center">
                      {car.exterior_color_hex && (
                        <div 
                          className="w-4 h-4 mr-2 rounded-full border border-gray-300" 
                          style={{ backgroundColor: car.exterior_color_hex }}
                        ></div>
                      )}
                      <p className="font-medium text-sm md:text-base">{car.exterior_color_name}</p>
                    </div>
                  </div>
                )}
                
                {/* Interior Color */}
                {car.interior_color_name && (
                  <div>
                    <p className="text-gray-600 text-sm md:text-base">Ngjyra e brendshme</p>
                    <div className="flex items-center">
                      {car.interior_color_hex && (
                        <div 
                          className="w-4 h-4 mr-2 rounded-full border border-gray-300" 
                          style={{ backgroundColor: car.interior_color_hex }}
                        ></div>
                      )}
                      <p className="font-medium text-sm md:text-base">{car.interior_color_name}</p>
                    </div>
                  </div>
                )}
                
                {/* Upholstery - Using upholstery_name directly */}
                {car.upholstery_name && (
                  <div>
                    <p className="text-gray-600 text-sm md:text-base">Tapiceria</p>
                    <p className="font-medium text-sm md:text-base">{car.upholstery_name}</p>
                  </div>
                )}
              </div>
            </section>

            {/* Technical Specifications */}
            <section className="space-y-3 md:space-y-4">
              <h3 className="text-lg md:text-xl font-semibold">Specifikimet Teknike</h3>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <p className="text-gray-600 text-sm md:text-base">Madhësia e motorit</p>
                  <p className="font-medium text-sm md:text-base">{car.engine_size}L</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm md:text-base">Ingranazhet</p>
                  <p className="font-medium text-sm md:text-base">{car.gears}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm md:text-base">Cilindrat</p>
                  <p className="font-medium text-sm md:text-base">{car.cylinders}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm md:text-base">Pesha</p>
                  <p className="font-medium text-sm md:text-base">{car.weight} kg</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm md:text-base">Klasa e emetimit</p>
                  <p className="font-medium text-sm md:text-base">{car.emission_class}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm md:text-base">Doganat e paguara</p>
                  <p className="font-medium text-sm md:text-base">{car.customs_paid ? 'Po' : 'Jo'}</p>
                </div>
              </div>
            </section>

            {/* Vehicle Details */}
            <section className="space-y-3 md:space-y-4">
              <h3 className="text-lg md:text-xl font-semibold">Detajet e Automjetit</h3>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <p className="text-gray-600 text-sm md:text-base">Vendet</p>
                  <p className="font-medium text-sm md:text-base">{car.seats}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm md:text-base">Dyert</p>
                  <p className="font-medium text-sm md:text-base">{car.doors}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm md:text-base">Historiku i servisit</p>
                  <p className="font-medium text-sm md:text-base">{car.full_service_history ? 'I plotë' : 'I pjesshëm'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm md:text-base">Sistemi i transmetimit</p>
                  <p className="font-medium text-sm md:text-base">{car.drivetrain}</p>
                </div>
              </div>
            </section>

            {/* Categorized Options - Updated to match backend structure */}
            {options.length > 0 && car.options && (
              <section className="space-y-3 md:space-y-4">
                <h3 className="text-lg md:text-xl font-semibold">Veçoritë</h3>
                
                {/* Comfort & Convenience */}
                {optionsByCategory['COMFORT'] && optionsByCategory['COMFORT'].length > 0 && (
                  <div className="mb-3 md:mb-4">
                    <div className="flex items-center mb-2">
                      <Sofa className="text-blue-600 mr-2" size={18} />
                      <h4 className="font-medium text-sm md:text-base">{categoryLabels['COMFORT']}</h4>
                    </div>
                    <ul className="list-disc pl-6 md:pl-8 grid grid-cols-1 md:grid-cols-2 gap-1">
                      {optionsByCategory['COMFORT'].map((option: string, index: number) => (
                        <li key={index} className="text-gray-700 text-sm md:text-base">{option}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Entertainment & Media */}
                {optionsByCategory['ENTERTAINMENT'] && optionsByCategory['ENTERTAINMENT'].length > 0 && (
                  <div className="mb-3 md:mb-4">
                    <div className="flex items-center mb-2">
                      <Music className="text-blue-600 mr-2" size={18} />
                      <h4 className="font-medium text-sm md:text-base">{categoryLabels['ENTERTAINMENT']}</h4>
                    </div>
                    <ul className="list-disc pl-6 md:pl-8 grid grid-cols-1 md:grid-cols-2 gap-1">
                      {optionsByCategory['ENTERTAINMENT'].map((option: string, index: number) => (
                        <li key={index} className="text-gray-700 text-sm md:text-base">{option}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Safety & Security */}
                {optionsByCategory['SAFETY'] && optionsByCategory['SAFETY'].length > 0 && (
                  <div className="mb-3 md:mb-4">
                    <div className="flex items-center mb-2">
                      <Shield className="text-blue-600 mr-2" size={18} />
                      <h4 className="font-medium text-sm md:text-base">{categoryLabels['SAFETY']}</h4>
                    </div>
                    <ul className="list-disc pl-6 md:pl-8 grid grid-cols-1 md:grid-cols-2 gap-1">
                      {optionsByCategory['SAFETY'].map((option: string, index: number) => (
                        <li key={index} className="text-gray-700 text-sm md:text-base">{option}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Extras */}
                {optionsByCategory['EXTRAS'] && optionsByCategory['EXTRAS'].length > 0 && (
                  <div className="mb-3 md:mb-4">
                    <div className="flex items-center mb-2">
                      <Star className="text-blue-600 mr-2" size={18} />
                      <h4 className="font-medium text-sm md:text-base">Ekstra</h4>
                    </div>
                    <ul className="list-disc pl-6 md:pl-8 grid grid-cols-1 md:grid-cols-2 gap-1">
                      {optionsByCategory['EXTRAS'].map((option: string, index: number) => (
                        <li key={index} className="text-gray-700 text-sm md:text-base">{option}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}
          </div>
        </div>

        <div className="p-4 md:p-6 border-t">
          <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Përshkrimi</h3>
          <p className="text-gray-700 text-sm md:text-base whitespace-pre-line">{car.description}</p>
        </div>
      </div>

      {/* Add recommendations section at the bottom */}
      {car && (
        <div className="mt-6 md:mt-12">
          <RecommendedCars excludeCarIds={[Number(id)]} />
        </div>
      )}
    </div>
  );
};

export default CarDetail;