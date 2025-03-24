import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CarHolderFilter from '../components/CarHolderFilter';
import { Car } from '../types/car';
import { saveLastSearch } from '../utils/userActivityService';
import { API_ENDPOINTS, API_BASE_URL } from '../config/api';
import { Filter, X, Calendar, Gauge, Fuel, Settings, Car as CarIcon } from 'lucide-react';
import FavoriteButton from '../components/FavouriteButton';
import ResponsiveImage from '../components/ResponsiveImage';
import Breadcrumbs from '../components/Breadcrumbs';
import { Helmet } from 'react-helmet';

interface FilterState {
  make?: string;
  model?: string;
  variant?: string;
  first_registration_from?: string;
  first_registration_to?: string;
  min_price?: string;
  max_price?: string;
  min_mileage?: string;
  max_mileage?: string;
  bodyType?: string;
  min_power?: string;
  max_power?: string;
  gearbox?: string;
  doors?: string;
  seats?: string;
  condition?: string;
  options?: string[];
  exterior_color?: string;
  interior_color?: string;
  interior_upholstery?: string;
  fuel_type?: string;
  emission_class?: string;
  created_since?: string;
}

const CarHolder: React.FC = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('best_results');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [totalCars, setTotalCars] = useState<number>(0);
  const carsPerPage = 14;
  
  // For SEO page title and description based on filters
  const [currentFilters, setCurrentFilters] = useState<FilterState>({});

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const navigateToCarDetail = (carSlug: string) => {
    // Using React Router's navigate function for better client-side routing
    navigate(`/car/${carSlug}`, { 
      state: { from: '/cars' } // Pass origin information for potential back navigation
    });
  };

  // Helper function to get the proper image URL for a car
  const getCarImageUrl = (car: Car): string => {
    if (!car.images || car.images.length === 0) {
      return `${API_BASE_URL}/api/placeholder/800/600`;
    }

    // First try to find the primary image
    const primaryImage = car.images.find(img => img.is_primary);
    
    if (primaryImage) {
      // Use Cloudinary URL if available
      if (primaryImage.url) {
        return primaryImage.url;
      }
      
      // Otherwise use the image path
      if (primaryImage.image) {
        return primaryImage.image.startsWith('http')
          ? primaryImage.image
          : `${API_BASE_URL}${primaryImage.image}`;
      }
    }
    
    // Fallback to the first image if no primary is set
    const firstImage = car.images[0];
    
    // Check for Cloudinary URL
    if (firstImage.url) {
      return firstImage.url;
    }
    
    // Otherwise use the image path
    return firstImage.image.startsWith('http')
      ? firstImage.image
      : `${API_BASE_URL}${firstImage.image}`;
  };

  const fetchCars = async (filters = {}, page = 1, sort = sortBy) => {
    setLoading(true);
    setError(null);
    
    try {
      // Save search parameters for recommendations
      saveLastSearch({ ...filters, sort, page });
      setCurrentFilters(filters); // Save for SEO titles
      
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
      
      // Add sorting parameter
      queryParams.append('sort', sort);
      
      // Add pagination parameters
      queryParams.append('page', page.toString());
      queryParams.append('limit', carsPerPage.toString());

      const url = `${API_ENDPOINTS.CARS.LIST}?${queryParams}`;
      console.log('Fetching cars with URL:', url);
      console.log('Filters:', filters, 'Sort:', sort, 'Page:', page);

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch cars');

      const data = await response.json();
      setCars(data.results || []);
      
      // Calculate total pages
      const totalCount = data.count || 0;
      setTotalCars(totalCount);
      setTotalPages(Math.ceil(totalCount / carsPerPage));
      
      // Update URL with current filters, sort and page
      const newUrl = new URL(window.location.href);
      newUrl.search = queryParams.toString();
      window.history.pushState({ path: newUrl.href }, '', newUrl.href);
    } catch (error) {
      console.error('Error fetching cars:', error);
      setError('Failed to load cars. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters: FilterState) => {
    fetchCars(filters, 1, sortBy);
    if (window.innerWidth < 768) {
      setIsFilterOpen(false); // Close the filter panel on mobile after applying filters
    }
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortBy = e.target.value;
    setSortBy(newSortBy);
    setCurrentPage(1); // Reset to first page when sorting changes
    fetchCars(currentFilters, 1, newSortBy);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
    fetchCars(currentFilters, page, sortBy);
    
    // Scroll to top of listing when changing pages
    window.scrollTo({
      top: document.getElementById('car-listing-top')?.offsetTop || 0,
      behavior: 'smooth'
    });
  };

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const pages = [];
    
    // Always include first page
    pages.push(1);
    
    // Calculate range to show around current page
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);
    
    // Add ellipsis after first page if needed
    if (start > 2) {
      pages.push('...');
    }
    
    // Add pages around current page
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (end < totalPages - 1) {
      pages.push('...');
    }
    
    // Add last page if there's more than one page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  // Generate page title and description based on filters
  const generateSeoTitle = (): string => {
    let title = "Makina për Shitje | Auto Hafuzi";
    
    if (currentFilters.make) {
      // Find make name from the ID
      const makeName = ""; // You'll need to implement this lookup
      title = `${makeName || currentFilters.make} Makina për Shitje | Auto Hafuzi`;
      
      if (currentFilters.model) {
        // Find model name from the ID
        const modelName = ""; // You'll need to implement this lookup
        title = `${makeName || currentFilters.make} ${modelName || currentFilters.model} për Shitje | Auto Hafuzi`;
      }
    }
    
    if (currentFilters.fuel_type) {
      title = `Makina ${currentFilters.fuel_type} për Shitje | Auto Hafuzi`;
    }
    
    return title;
  };
  
  const generateSeoDescription = (): string => {
    let description = "Zgjidhni nga koleksioni ynë i gjerë i makinave cilësore për shitje, duke përfshirë markat premium si Mercedes-Benz, BMW dhe Audi.";
    
    // Add filter-specific details
    const filterDetails = [];
    if (currentFilters.make) filterDetails.push(`markë ${currentFilters.make}`);
    if (currentFilters.model) filterDetails.push(`model ${currentFilters.model}`);
    if (currentFilters.fuel_type) filterDetails.push(`karburant ${currentFilters.fuel_type}`);
    if (currentFilters.min_price) filterDetails.push(`çmim nga €${currentFilters.min_price}`);
    if (currentFilters.first_registration_from) filterDetails.push(`vit nga ${currentFilters.first_registration_from}`);
    
    if (filterDetails.length > 0) {
      description = `Kërkoni makina ${filterDetails.join(', ')} në Auto Hafuzi. Koleksioni ynë ofron cilësi të lartë, garanci dhe çmime konkurruese.`;
    }
    
    return description;
  };

  useEffect(() => {
    // Read URL params for initial filters
    const urlSearchParams = new URLSearchParams(window.location.search);
    const paramsObject: Record<string, string> = {};
    
    // Convert URLSearchParams to regular object
    urlSearchParams.forEach((value, key) => {
      paramsObject[key] = value;
    });
    
    // Set initial sort value if present in URL
    if (paramsObject.sort) {
      setSortBy(paramsObject.sort);
    }
    
    // Set initial page if present in URL
    if (paramsObject.page) {
      const pageNum = parseInt(paramsObject.page, 10);
      if (!isNaN(pageNum) && pageNum > 0) {
        setCurrentPage(pageNum);
      }
    }
    
    setCurrentFilters(paramsObject);
    fetchCars(paramsObject, 
      paramsObject.page ? parseInt(paramsObject.page, 10) : 1, 
      paramsObject.sort || 'best_results');
  }, []);

  return (
    <>
      {/* SEO Metadata */}
      <Helmet>
        <title>{generateSeoTitle()}</title>
        <meta name="description" content={generateSeoDescription()} />
        {/* Extra metadata for rich search results */}
        <meta property="og:title" content={generateSeoTitle()} />
        <meta property="og:description" content={generateSeoDescription()} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
    
      <div className="min-h-screen container mx-auto px-4 py-8 max-w-7xl">
        {/* Add breadcrumbs */}
        <Breadcrumbs />
      
        {/* Mobile Filter Button */}
        <div className="md:hidden fixed bottom-4 right-4 z-30">
          <button 
            onClick={toggleFilter}
            className="bg-blue-600 text-white rounded-full p-3 shadow-lg flex items-center justify-center"
            aria-label="Ndrysho Filtrat"
          >
            <Filter className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Filter Panel */}
        <div 
          className={`fixed inset-0 bg-white z-40 transform transition-transform duration-300 ease-in-out md:hidden ${
            isFilterOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-bold">Filtrat</h2>
            <button 
              onClick={toggleFilter}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="p-4 overflow-y-auto h-[calc(100%-60px)]">
            <CarHolderFilter onFilterChange={handleFilterChange} />
          </div>
        </div>

        {/* Desktop and Mobile layout */}
        <div className="flex flex-col md:flex-row">
          {/* Filter section - hidden on mobile, visible on desktop */}
          <div className="hidden md:block w-72 mr-8">
            <CarHolderFilter onFilterChange={handleFilterChange} />
          </div>

          {/* Car listing section */}
          <div className="flex-grow w-full">
            <div id="car-listing-top" className="flex justify-between items-center mb-6 flex-wrap">
              {/* Add SEO-friendly H1 heading */}
              <h1 className="text-2xl md:text-3xl font-bold mb-2 md:mb-0">
                {totalCars > 0 ? `${totalCars} Makina për Shitje` : 'Makina për Shitje'}
              </h1>
              
              {/* Sorting dropdown */}
              <div className="flex items-center">
                <label htmlFor="sortCars" className="mr-2 text-gray-700">Rendit:</label>
                <select
                  id="sortCars"
                  value={sortBy}
                  onChange={handleSortChange}
                  className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="best_results">Përputhja më e mirë</option>
                  <option value="price_asc">Çmimi: Nga më i ulëti</option>
                  <option value="price_desc">Çmimi: Nga më i larti</option>
                  <option value="year_desc">Regjistrimi: Nga më i riu</option>
                  <option value="year_asc">Regjistrimi: Nga më i vjetri</option>
                  <option value="mileage_asc">Kilometrazhi: Nga më i ulëti</option>
                  <option value="mileage_desc">Kilometrazhi: Nga më i larti</option>
                </select>
              </div>
            </div>
            
            {loading && <p className="text-center text-gray-500 py-8">Duke ngarkuar makinat...</p>}
            {error && <p className="text-center text-red-500 py-8">{error}</p>}

            <div className="space-y-4">
              {cars.length > 0 ? (
                cars.map((car) => (
                  <div 
                    key={car.id} 
                    className="bg-white shadow border border-gray-200 rounded-md overflow-hidden hover:shadow-md transition-all cursor-pointer"
                    onClick={() => navigateToCarDetail(car.slug)}
                  >
                    {/* New design based on the image */}
                    <div className="flex flex-col md:flex-row">
                      {/* Left: Image and position counter */}
                      <div className="relative md:w-64 h-48">
                        {/* Favorite button for mobile - above image gallery */}
                        <div className="absolute top-2 right-2 z-10 md:hidden">
                          <FavoriteButton carId={car.id} size={20} />
                        </div>
                        
                        {car.images && car.images.length > 0 ? (
                          <ResponsiveImage
                            src={getCarImageUrl(car)}
                            alt={`${car.brand} ${car.model_name}`}
                            width={800}
                            height={600}
                            className="w-full h-full object-cover"
                            placeholder={`${API_BASE_URL}/api/placeholder/800/600`}
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gray-200">
                            <p className="text-gray-500">Pa imazh</p>
                          </div>
                        )}
                        
                        {/* Image counter badge */}
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                          1 / {car.images?.length || 1}
                        </div>
                        
                        {/* Dealer logo or badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {car.full_service_history && (
                            <div className="bg-white p-1 rounded shadow-sm">
                              <img src="/service-history-badge.png" alt="Historia e Shërbimit" className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Right: Car details */}
                      <div className="p-4 flex flex-col justify-between flex-grow">
                        {/* Title and price */}
                        <div>
                          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                            {/* Use h2 for car titles in the listing for better SEO hierarchy */}
                            <h2 className="text-lg font-bold text-gray-800">
                              {car.brand} {car.model_name}
                              {car.variant_name && (
                                <span className="ml-1 font-normal text-gray-600">
                                  {car.variant_name}
                                </span>
                              )}
                            </h2>
                            <div className="text-xl font-bold text-gray-800">
                              {car.discussed_price ? 
                                "I diskutueshem" : 
                                `€ ${car.price === 0 ? 'POA' : Number(car.price).toLocaleString()}`
                              }
                            </div>
                          </div>
                          
                          {/* Key specs in a grid */}
                          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>{car.first_registration_month}/{car.first_registration_year}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Gauge className="h-4 w-4 mr-1" />
                              <span>{car.mileage.toLocaleString()} km</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Fuel className="h-4 w-4 mr-1" />
                              <span>{car.fuel_type}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Settings className="h-4 w-4 mr-1" />
                              <span>{car.gearbox}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <CarIcon className="h-4 w-4 mr-1" />
                              <span>{car.body_type}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              <span>{car.power} kW ({Math.round(car.power * 1.36)} hp)</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Created date info */}
                        <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                          <div className="text-sm text-gray-600">
                            <span className="mr-1">Shtuar më</span>
                            <span className="text-gray-800">{new Date(car.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center">
                            <FavoriteButton carId={car.id} size={16} className="mr-3" />
                            <button className="text-sm text-blue-600 hover:text-blue-800">
                              + Shfaq më shumë
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                !loading && <p className="text-center text-gray-500 py-8">Nuk u gjetën makina.</p>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="inline-flex items-center bg-white rounded-lg shadow-md overflow-x-auto" aria-label="Pagination">
                  {/* Previous page button */}
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 md:px-4 py-2 rounded-l-lg border-r ${
                      currentPage === 1 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-blue-600 hover:bg-blue-50'
                    }`}
                    aria-label="Faqja e mëparshme"
                  >
                    &laquo;
                  </button>
                  
                  {/* Page numbers */}
                  {getPaginationNumbers().map((page, index) => (
                    <React.Fragment key={index}>
                      {page === '...' ? (
                        <span className="px-3 md:px-4 py-2 border-r text-gray-500">...</span>
                      ) : (
                        <button
                          onClick={() => typeof page === 'number' && handlePageChange(page)}
                          className={`px-3 md:px-4 py-2 border-r ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'text-blue-600 hover:bg-blue-50'
                          }`}
                          aria-current={currentPage === page ? 'page' : undefined}
                        >
                          {page}
                        </button>
                      )}
                    </React.Fragment>
                  ))}
                  
                  {/* Next page button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 md:px-4 py-2 rounded-r-lg ${
                      currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-blue-600 hover:bg-blue-50'
                    }`}
                    aria-label="Faqja tjetër"
                  >
                    &raquo;
                  </button>
                </nav>
              </div>
            )}
            
            {/* Results summary */}
            <div className="mt-4 text-center text-gray-500 text-sm">
              {!loading && cars.length > 0 && (
                <p>Duke treguar {((currentPage - 1) * carsPerPage) + 1} - {Math.min(currentPage * carsPerPage, totalCars)} nga {totalCars} makina</p>
              )}
            </div>
          </div>
        </div>

        {/* Overlay to dim background when filter panel is open on mobile */}
        {isFilterOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={toggleFilter}
          />
        )}
      </div>
    </>
  );
};

export default CarHolder;