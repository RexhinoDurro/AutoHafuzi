import React, { useState, useEffect } from 'react';
import CarHolderFilter from '../components/CarHolderFilter';
import { Car } from '../types/car';
import { saveLastSearch } from '../utils/userActivityService';

const CarHolder: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('best_results');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const carsPerPage = 14;

  const fetchCars = async (filters = {}, page = 1, sort = sortBy) => {
    setLoading(true);
    setError(null);
    
    try {
      // Save search parameters for recommendations
      saveLastSearch({ ...filters, sort, page });
      
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

      const url = `http://localhost:8000/api/cars/?${queryParams}`;
      console.log('Fetching cars with URL:', url);
      console.log('Filters:', filters, 'Sort:', sort, 'Page:', page);

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch cars');

      const data = await response.json();
      setCars(data.results || []);
      
      // Calculate total pages
      const totalCount = data.count || 0;
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

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortBy = e.target.value;
    setSortBy(newSortBy);
    setCurrentPage(1); // Reset to first page when sorting changes
    fetchCars({}, 1, newSortBy);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
    fetchCars({}, page, sortBy);
    
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
    
    fetchCars(paramsObject, 
      paramsObject.page ? parseInt(paramsObject.page, 10) : 1, 
      paramsObject.sort || 'best_results');
  }, []);

  return (
    <div className="flex min-h-screen container mx-auto px-4 py-8 max-w-5xl">
      {/* Filter section - fixed width on left side */}
      <div className="w-80 mr-8">
        <CarHolderFilter onFilterChange={(filters) => fetchCars(filters, 1, sortBy)} />
      </div>

      {/* Car listing section - takes remaining width */}
      <div className="flex-grow">
        <div id="car-listing-top" className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Listat e Automjeteve</h1>
          
          {/* Sorting dropdown */}
          <div className="flex items-center">
            <label htmlFor="sortCars" className="mr-2 text-gray-700">Rendit:</label>
            <select
              id="sortCars"
              value={sortBy}
              onChange={handleSortChange}
              className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="best_results">Më të mirat</option>
              <option value="price_asc">Çmimi: Ulët në të lartë</option>
              <option value="price_desc">Çmimi: Lartë në të ulët</option>
              <option value="year_asc">Viti i regjistrimit: Vjetër në të ri</option>
              <option value="year_desc">Viti i regjistrimit: Ri në të vjetër</option>
              <option value="date_asc">Data e shtimit: Vjetër në të ri</option>
              <option value="date_desc">Data e shtimit: Ri në të vjetër</option>
              <option value="mileage_asc">Kilometrazhi: Ulët në të lartë</option>
              <option value="mileage_desc">Kilometrazhi: Lartë në të ulët</option>
            </select>
          </div>
        </div>
        
        {loading && <p className="text-center text-gray-500 py-8">Duke ngarkuar automjetet...</p>}
        {error && <p className="text-center text-red-500 py-8">{error}</p>}

        <div className="space-y-6">
          {cars.length > 0 ? (
            cars.map((car) => (
              <div 
                key={car.id} 
                className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-all"
              >
                <div className="flex" style={{ height: "240px" }}>
                  {/* Car Image - Left Side */}
                  <div className="w-1/3 p-2">
                    <div className="h-full w-full overflow-hidden flex items-center justify-center">
                      <img
                        src={
                          car.images && car.images.length > 0
                            ? (car.images[0].image.startsWith('http') 
                                ? car.images[0].image 
                                : `http://localhost:8000${car.images[0].image}`)
                            : 'placeholder-image-url'
                        }
                        alt={`${car.brand} ${car.model_name}`}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  </div>

                  {/* Car Details - Right Side */}
                  <div className="w-2/3 p-2 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="text-2xl font-bold text-gray-800">
                          {car.brand} {car.model_name}
                          {car.variant_name && (
                            <span className="text-gray-500 font-normal text-sm ml-2">
                              {car.variant_name}
                            </span>
                          )}
                        </h3>
                        <span className="text-blue-600 font-semibold text-xl">
                          {car.price === 0 ? 'I diskutueshem' : `${Number(car.price).toLocaleString()}`}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{car.first_registration_year || 'N/A'}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{car.mileage.toLocaleString()} km</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{car.fuel_type}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{car.gearbox}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{car.body_type}</span>
                      </div>

                      <p className="text-gray-600 mt-4 line-clamp-3">{car.description}</p>
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        </div>
                        <span className="text-gray-600">{car.body_type} • {car.exterior_color_name || 'N/A'}</span>
                      </div>
                      <button 
                        className="text-blue-600 hover:underline font-medium"
                        onClick={() => window.location.href = `/car/${car.id}`}
                      >
                        Shiko Detajet e Plota
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            !loading && <p className="text-center text-gray-500 py-8">Nuk u gjetën automjete.</p>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="inline-flex items-center bg-white rounded-lg shadow-md">
              {/* Previous page button */}
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-l-lg border-r ${
                  currentPage === 1 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-blue-600 hover:bg-blue-50'
                }`}
                aria-label="Previous page"
              >
                &laquo;
              </button>
              
              {/* Page numbers */}
              {getPaginationNumbers().map((page, index) => (
                <React.Fragment key={index}>
                  {page === '...' ? (
                    <span className="px-4 py-2 border-r text-gray-500">...</span>
                  ) : (
                    <button
                      onClick={() => typeof page === 'number' && handlePageChange(page)}
                      className={`px-4 py-2 border-r ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-blue-600 hover:bg-blue-50'
                      }`}
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
                className={`px-4 py-2 rounded-r-lg ${
                  currentPage === totalPages
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-blue-600 hover:bg-blue-50'
                }`}
                aria-label="Next page"
              >
                &raquo;
              </button>
            </nav>
          </div>
        )}
        
        {/* Results summary */}
        <div className="mt-4 text-center text-gray-500 text-sm">
          {!loading && cars.length > 0 && (
            <p>Duke shfaqur {((currentPage - 1) * carsPerPage) + 1} - {Math.min(currentPage * carsPerPage, ((totalPages - 1) * carsPerPage) + cars.length)} nga {(totalPages - 1) * carsPerPage + cars.length} automjete</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarHolder;