import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import CarImageCarousel from '../components/ImageGalleryCarousel';
import { Car } from '../types/car';
import { Clock, Settings, Calendar, Fuel, Zap, Sofa, Music, Shield, Star, Eye, Phone, Mail } from 'lucide-react';
import FavoriteButton from '../components/FavouriteButton';
import { 
  trackCarView, 
  shouldCountCarView, 
  getLastViewTimestamp 
} from '../utils/userActivityService';
import RecommendedCars from '../components/RecommendedCars';
import { API_ENDPOINTS } from '../config/api';
import { useMediaQuery } from '../utils/useMediaQuery';
import { shouldDisableViewTracking } from '../utils/navigation';
import Breadcrumbs from '../components/Breadcrumbs';
import { getCanonicalUrl, updateCanonicalLink } from '../utils/canonicalUrl';

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
  const [viewTracked, setViewTracked] = useState<boolean | null>(null);
  
  // Add a state for the detected aspect ratio of images
  const [detectedAspectRatio, setDetectedAspectRatio] = useState<number | null>(null);
  
  // Add a media query hook to detect mobile screens
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Add this useEffect to reset state when id changes in URL
  useEffect(() => {
    // Reset states when id changes in URL
    if (id) {
      setCar(null);
      setLoading(true);
      setError(null);
      setInitialFetchDone(false);
      setViewTracked(null);
      setDetectedAspectRatio(null);
    }
  }, [id]); // Only re-run when id changes

  // Detect aspect ratio from first image when car data loads
  useEffect(() => {
    if (car && car.images && car.images.length > 0) {
      // Try to detect aspect ratio from the first image
      const firstImage = car.images[0];
      if (firstImage && 'width' in firstImage && 'height' in firstImage) {
        const width = Number(firstImage.width);
        const height = Number(firstImage.height);
        if (width && height && height > 0) {
          setDetectedAspectRatio(width / height);
        }
      }
    }
  }, [car]);

  // Check if tracking should be disabled based on navigation source
  useEffect(() => {
    if (!initialFetchDone && id) {
      // Get referrer from location state or document.referrer
      const stateReferrer = location.state?.from;
      const docReferrer = document.referrer;
      const currentReferrer = stateReferrer || 
                             (docReferrer ? new URL(docReferrer).pathname : '/');
      
      setReferrer(currentReferrer);
      
      // Check if we should disable tracking based on referrer
      const comingFromProtectedPath = shouldDisableViewTracking(currentReferrer);
      const explicitlyDisabled = location.state?.doNotTrackView === true;
      
      // If tracking should be disabled but isn't explicitly disabled, update state
      if (comingFromProtectedPath && !explicitlyDisabled) {
        console.log(`[View Tracking] Auto-disabling tracking for car ${id} coming from ${currentReferrer}`);
        navigate(location.pathname, {
          state: {
            ...location.state,
            doNotTrackView: true,
            originalReferrer: currentReferrer,
            autoDisabled: true
          },
          replace: true // Replace current history entry to avoid back button issues
        });
      }
    }
  }, [id, location, navigate, initialFetchDone]);

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

  // Update canonical URL and other page metadata
  const updatePageMetadata = () => {
    if (!car) return;
    
    const carTitle = `${car.brand} ${car.model_name} ${car.variant_name || ''}`;
    const pageTitle = `${carTitle} | Auto `;
    
    // Update document title
    document.title = pageTitle;
    
    // Create or update meta description
    const metaDescription = `${carTitle} - ${car.fuel_type}, ${car.mileage.toLocaleString()} km, ${car.first_registration_year}. Oferta ekskluzive nga Auto .`;
    let metaDescTag = document.querySelector('meta[name="description"]');
    if (!metaDescTag) {
      metaDescTag = document.createElement('meta');
      metaDescTag.setAttribute('name', 'description');
      document.head.appendChild(metaDescTag);
    }
    metaDescTag.setAttribute('content', metaDescription);
    
    // Update Open Graph tags
    updateOrCreateMetaTag('og:title', pageTitle);
    updateOrCreateMetaTag('og:description', metaDescription);
    updateOrCreateMetaTag('og:type', 'website');
    
    // Set canonical URL using the utility function
    // Use the slug if available, otherwise use the ID
    const canonicalPath = `/car/${car.slug || id}`;
    const canonicalUrl = getCanonicalUrl(canonicalPath);
    
    // Update og:url to match canonical
    updateOrCreateMetaTag('og:url', canonicalUrl);
    
    // Update canonical link
    updateCanonicalLink(canonicalUrl);
  };
  
  // Helper function to update or create meta tags
  const updateOrCreateMetaTag = (property: string, content: string) => {
    let metaTag = document.querySelector(`meta[property="${property}"]`);
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('property', property);
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute('content', content);
  };

  // Fetch car details with proper view tracking
  useEffect(() => {
    // Skip if we've already done the initial fetch or if id is missing
    if (initialFetchDone || !id) return;
    
    const fetchCarDetails = async () => {
      setLoading(true);
      try {
        // Start with the cooldown check from local storage
        const cooldownPassed = shouldCountCarView(Number(id));
        let shouldTrackView = cooldownPassed;
        
        // Get last view timestamp for logging
        const lastViewTime = getLastViewTimestamp(Number(id));
        const timeSinceLastView = lastViewTime ? Date.now() - lastViewTime : null;
        
        // Check for various conditions to disable tracking
        const comingFromFavorites = referrer.includes('/favorites') || 
                                  (location.state?.from && location.state.from.includes('/favorites'));
        
        const comingFromAdmin = referrer.includes('/auth') || 
                              referrer.includes('/admin') ||
                              (location.state?.from && 
                               (location.state.from.includes('/auth') || 
                                location.state.from.includes('/admin')));
        
        // Check if this is a page refresh
        const isRefresh = window.performance && 
          window.performance.navigation && 
          window.performance.navigation.type === 1;
        
        // Check if tracking is explicitly disabled in state
        const explicitlyDisabled = location.state?.doNotTrackView === true;
        
        // Apply all conditions to determine final tracking decision
        shouldTrackView = shouldTrackView && 
                         !comingFromFavorites && 
                         !comingFromAdmin && 
                         !isRefresh && 
                         !explicitlyDisabled;
        
        // Log the decision and reasons for debugging
        console.log('[View Tracking] Decision:', {
          carId: id,
          cooldownPassed,
          timeSinceLastView: timeSinceLastView ? `${Math.round(timeSinceLastView / 1000 / 60)} minutes` : 'never viewed',
          referrer,
          stateFrom: location.state?.from,
          comingFromFavorites,
          comingFromAdmin,
          isRefresh,
          explicitlyDisabled,
          finalDecision: shouldTrackView ? 'TRACK' : 'DO NOT TRACK'
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
          credentials: 'include', // Include cookies for session tracking
          headers: headers
        });
        
        if (!response.ok) {
          throw new Error('Car not found');
        }
        
        const data = await response.json();
        setCar(data);
        
        // Update page metadata including canonical URL
        updatePageMetadata();
        
        // Add structured data
        addStructuredData(data);
        
        // Track this car view for recommendations, respecting all rules
        if (data.id && data.brand && data.model_name) {
          const wasTracked = trackCarView(data.id, data.brand, data.model_name);
          setViewTracked(wasTracked);
          console.log(`[View Tracking] Car ${data.id} (${data.brand} ${data.model_name}): ${wasTracked ? 'TRACKED' : 'NOT TRACKED'}`);
          
          // If the count didn't match between client and server, log a warning
          if (wasTracked !== shouldTrackView) {
            console.warn(`[View Tracking] Inconsistency: Client tracked=${wasTracked}, Server tracked=${shouldTrackView}`);
          }
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch car details');
      } finally {
        setLoading(false);
        setInitialFetchDone(true); // Mark initial fetch as done
      }
    };
  
    fetchCarDetails();
  }, [id, referrer, initialFetchDone, location.state, location]);
  
  // Add structured data to the page
  const addStructuredData = (car: Car) => {
    if (!car) return;
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      "@context": "https://schema.org/",
      "@type": "Vehicle",
      "name": `${car.brand} ${car.model_name} ${car.variant_name || ''}`,
      "brand": {
        "@type": "Brand",
        "name": car.brand
      },
      "model": car.model_name,
      "vehicleEngine": {
        "@type": "EngineSpecification",
        "enginePower": {
          "@type": "QuantitativeValue",
          "value": car.power,
          "unitCode": "KWT"
        },
        "fuelType": car.fuel_type
      },
      "mileageFromOdometer": {
        "@type": "QuantitativeValue",
        "value": car.mileage,
        "unitCode": "KMT"
      },
      "color": car.exterior_color_name,
      "numberOfDoors": car.doors,
      "vehicleTransmission": car.gearbox,
      "description": car.description.substring(0, 200),
      "offers": {
        "@type": "Offer",
        "price": car.price,
        "priceCurrency": "EUR",
        "availability": "https://schema.org/InStock"
      },
      "url": getCanonicalUrl(`/car/${car.slug || id}`)
    });
    
    // First remove any existing script to avoid duplicates
    const existingScript = document.getElementById('car-structured-data');
    if (existingScript) {
      existingScript.remove();
    }
    
    // Add ID for easier removal later
    script.id = 'car-structured-data';
    document.head.appendChild(script);
  };
  
  // Clean up structured data when component unmounts
  useEffect(() => {
    return () => {
      const scriptToRemove = document.getElementById('car-structured-data');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);
  
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
    <div className="max-w-7xl mx-auto px-2 md:px-4 py-4 md:py-8">
      <div id="structured-data-container"></div>
      
      {/* Add breadcrumb navigation */}
      <Breadcrumbs carTitle={`${car.brand} ${car.model_name} ${car.variant_name || ''}`} />
      
      <button
        onClick={handleBackClick}
        className="mb-4 md:mb-6 text-blue-600 hover:text-blue-800"
      >
        ← Kthehu te listimi
      </button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Updated grid for better mobile responsiveness with smaller margins */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 p-2 md:p-6">
          {/* Title shown above image gallery on mobile - MODIFIED LAYOUT */}
          {isMobile && (
            <div className="space-y-2 mb-2">
              {/* Car title with view counter and favorite button */}
              <div className="flex justify-between items-start">
                <h1 className="text-xl font-bold">{car.brand} {car.model_name} {car.variant_name}</h1>
                <div className="flex items-center space-x-2">
                  {/* View Counter */}
                  <div className="flex items-center text-gray-500" title="Number of views">
                    <Eye size={16} className="mr-1" />
                    <span>{car.view_count}</span>
                  </div>
                  
                  {/* Favorite Button */}
                  <FavoriteButton 
                    carId={car.id} 
                    size={20} 
                    className="hover:bg-gray-100 rounded-full"
                  />
                </div>
              </div>
              
              {/* Price now on the right */}
              <h2 className="text-lg font-semibold text-blue-600 text-right">
                {car.discussed_price ? 
                  "I diskutueshem" : 
                  `${typeof car.price === 'number' 
                    ? car.price.toLocaleString() 
                    : Number(car.price).toLocaleString()}€`
                }
              </h2>
              
              {/* Tracking Status - only show in development */}
              {process.env.NODE_ENV !== 'production' && viewTracked !== null && (
                <div className={`text-xs px-2 py-1 rounded ${viewTracked ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {viewTracked ? 'View Tracked' : 'View Not Tracked'}
                </div>
              )}
            </div>
          )}
          
          <div className="space-y-2 md:space-y-6">
            {/* Pass the isMobile flag to the carousel */}
            <CarImageCarousel 
                  images={car.images || []} 
                  isMobile={isMobile} 
                  detectedAspectRatio={detectedAspectRatio} // Pass the number directly
                  onImageChange={(index) => console.log(`Viewing image ${index + 1}`)}
            />
            
            {/* Key Specifications Box - made more mobile-friendly with smaller padding */}
            <div className="bg-gray-100 p-2 md:p-4 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-4">
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
          
          {/* Title and car details - hide on mobile as it's shown above */}
          {!isMobile && (
            <div className="space-y-4">
              {/* Add H1 tag for better SEO */}
              <h1 className="text-2xl md:text-3xl font-bold">{car.brand} {car.model_name} {car.variant_name}</h1>
              
              {/* Price with favorite button and view counter */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-semibold text-blue-600">
                {car.discussed_price ? 
                    "I diskutueshem" : 
                    `${typeof car.price === 'number' 
                      ? car.price.toLocaleString() 
                      : Number(car.price).toLocaleString()}€`
                  }
                </h2>
                <div className="flex items-center space-x-4">
                  {/* View Counter */}
                  <div className="flex items-center text-gray-500" title="Number of views">
                    <Eye size={18} className="mr-1" />
                    <span>{car.view_count}</span>
                  </div>
                  
                  {/* Tracking Status - only show in development */}
                  {process.env.NODE_ENV !== 'production' && viewTracked !== null && (
                    <div className={`text-xs px-2 py-1 rounded ${viewTracked ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {viewTracked ? 'View Tracked' : 'View Not Tracked'}
                    </div>
                  )}
                  
                  {/* Favorite Button */}
                  <FavoriteButton 
                    carId={car.id} 
                    size={24} 
                    className="p-2 hover:bg-gray-100 rounded-full"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4 md:space-y-8">
            <section className="space-y-2 md:space-y-4">
              <h3 className="text-lg md:text-xl font-semibold">Informacione Bazë</h3>
              <div className="grid grid-cols-2 gap-2 md:gap-4">
                <div>
                  <p className="text-gray-600 text-sm md:text-base">Viti i Regjistrimit</p>
                  <p className="font-medium text-sm md:text-base">{car.first_registration_year || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm md:text-base">Lloji i karocerisë</p>
                  <p className="font-medium text-sm md:text-base">{car.body_type}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm md:text-base">Kilometrazhi</p>
                  <p className="font-medium text-sm md:text-base">{car.mileage.toLocaleString()} km</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm md:text-base">Gjendja</p>
                  <p className="font-medium text-sm md:text-base">{car.is_used ? 'I përdorur' : 'I ri'}</p>
                </div>
              </div>
            </section>

            {/* Fixed Colors Section */}
            <section className="space-y-2 md:space-y-4">
              <h3 className="text-lg md:text-xl font-semibold">Ngjyrat</h3>
              <div className="grid grid-cols-2 gap-2 md:gap-4">
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
            <section className="space-y-2 md:space-y-4">
              <h3 className="text-lg md:text-xl font-semibold">Specifikimet Teknike</h3>
              <div className="grid grid-cols-2 gap-2 md:gap-4">
                <div>
                  <p className="text-gray-600 text-sm md:text-base">Madhësia e motorit</p>
                  <p className="font-medium text-sm md:text-base">{car.engine_size}L</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm md:text-base">Fuqia</p>
                  <p className="font-medium text-sm md:text-base">{car.power} kW ({Math.round(car.power * 1.36)} hp)</p>
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
                  <p className="text-gray-600 text-sm md:text-base">Lloji i karburantit</p>
                  <p className="font-medium text-sm md:text-base">{car.fuel_type}</p>
                </div>
              </div>
            </section>

            {/* Vehicle Details */}
            <section className="space-y-2 md:space-y-4">
              <h3 className="text-lg md:text-xl font-semibold">Detajet e Automjetit</h3>
              <div className="grid grid-cols-2 gap-2 md:gap-4">
                <div>
                  <p className="text-gray-600 text-sm md:text-base">Vendet</p>
                  <p className="font-medium text-sm md:text-base">{car.seats}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm md:text-base">Dyert</p>
                  <p className="font-medium text-sm md:text-base">{car.doors}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm md:text-base">Sistemi i transmetimit</p>
                  <p className="font-medium text-sm md:text-base">{car.drivetrain}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm md:text-base">Doganat e paguara</p>
                  <p className="font-medium text-sm md:text-base">{car.customs_paid ? 'Po' : 'Jo'}</p>
                </div>
              </div>
            </section>

            {/* Categorized Options - Updated to match backend structure */}
            {options.length > 0 && car.options && (
              <section className="space-y-2 md:space-y-4">
                <h3 className="text-lg md:text-xl font-semibold">Veçoritë</h3>
                
                {/* Comfort & Convenience */}
                {optionsByCategory['COMFORT'] && optionsByCategory['COMFORT'].length > 0 && (
                  <div className="mb-2 md:mb-4">
                    <div className="flex items-center mb-1 md:mb-2">
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
                  <div className="mb-2 md:mb-4">
                    <div className="flex items-center mb-1 md:mb-2">
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
                  <div className="mb-2 md:mb-4">
                    <div className="flex items-center mb-1 md:mb-2">
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
                  <div className="mb-2 md:mb-4">
                    <div className="flex items-center mb-1 md:mb-2">
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

        <div className="p-2 md:p-6 border-t">
          <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-4">Përshkrimi</h3>
          <p className="text-gray-700 text-sm md:text-base whitespace-pre-line">{car.description}</p>
        </div>
      </div>

      {/* Contact section for this specific car - Added for better conversion */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mt-4 md:mt-6 p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Të interesuar për këtë makinë?</h3>
        <p className="mb-3 md:mb-4">Kontaktoni me ne për më shumë informacion ose për të rezervuar një provë.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <a 
            href={`tel:069 931 1111`} 
            className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2 md:py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Phone size={18} className="md:size-20" />
            <span>Na telefononi: 069 931 1111</span>
          </a>
          <a 
            href={`mailto:info@auto.ch?subject=Interes për ${car.brand} ${car.model_name} ${car.variant_name || ''}&body=Përshëndetje, jam i interesuar për makinën ${car.brand} ${car.model_name} me ID: ${car.id}. Ju lutem më kontaktoni me informacione të mëtejshme.`} 
            className="flex items-center justify-center gap-2 bg-green-600 text-white py-2 md:py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Mail size={18} className="md:size-20" />
            <span>Dërgoni email: info@auto.ch</span>
          </a>
        </div>
      </div>

      {/* Related cars section - Added for better internal linking and SEO */}
      <div className="mt-8 md:mt-12">
        <RecommendedCars excludeCarIds={[Number(id)]} />
      </div>
    </div>
  );
};

export default CarDetail;