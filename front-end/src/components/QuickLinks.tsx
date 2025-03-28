// src/components/QuickLinks.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';

// Define types
interface Make {
  id: number;
  name: string;
  models?: Model[];
}

interface Model {
  id: number;
  name: string;
  make: number;
  variants?: Variant[];
}

interface Variant {
  id: number;
  name: string;
  model: number;
}

interface GroupedMakes {
  popular: Make[];
  all: Make[];
}

const QuickLinks: React.FC = () => {
  const navigate = useNavigate();
  const [groupedMakes, setGroupedMakes] = useState<GroupedMakes>({ popular: [], all: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedMake, setExpandedMake] = useState<number | null>(null);
  const [expandedElectricSection, setExpandedElectricSection] = useState<boolean>(false);

  // Popular electric car models - hardcoded as these might not be in the database
  const popularElectricCars = [
    { make: 'Tesla', model: 'Model 3' },
    { make: 'Tesla', model: 'Model S' },
    { make: 'Audi', model: 'e-tron' },
    { make: 'Porsche', model: 'Taycan' },
    { make: 'Renault', model: 'ZOE' },
    { make: 'Hyundai', model: 'Kona Electric' }
  ];

  // Fetch makes and their models
  useEffect(() => {
    const fetchMakesAndModels = async () => {
      try {
        setLoading(true);
        
        // Fetch all makes first
        const makesResponse = await fetch(API_ENDPOINTS.MAKES);
        if (!makesResponse.ok) throw new Error('Failed to fetch makes');
        
        const makesData: Make[] = await makesResponse.json();
        
        // Sort makes by name
        const sortedMakes = [...makesData].sort((a, b) => a.name.localeCompare(b.name));
        
        // Define popular makes (usually luxury or common brands)
        const popularMakeNames = ['Audi', 'BMW', 'Mercedes-Benz', 'Volkswagen', 'Toyota', 'Peugeot'];
        
        // Split makes into popular and all
        const popular: Make[] = [];
        const all: Make[] = [];
        
        sortedMakes.forEach(make => {
          if (popularMakeNames.includes(make.name)) {
            popular.push(make);
          } else {
            all.push(make);
          }
        });
        
        // For each popular make, fetch top models
        const popularWithModels = await Promise.all(
          popular.map(async (make) => {
            const modelsResponse = await fetch(API_ENDPOINTS.MODELS.LIST_BY_MAKE(make.id.toString()));
            if (!modelsResponse.ok) return make;
            
            const modelsData: Model[] = await modelsResponse.json();
            return { ...make, models: modelsData.slice(0, 5) }; // Get top 5 models
          })
        );
        
        setGroupedMakes({
          popular: popularWithModels,
          all
        });
      } catch (error) {
        console.error('Error fetching makes and models:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMakesAndModels();
  }, []);

  // Toggle a make's expanded state
  const toggleMake = (makeId: number) => {
    if (expandedMake === makeId) {
      setExpandedMake(null);
    } else {
      setExpandedMake(makeId);
    }
  };

  // Toggle the electric section
  const toggleElectricSection = () => {
    setExpandedElectricSection(!expandedElectricSection);
  };

  // Navigate to car holder with filters
  const navigateToMake = (makeId: number) => {
    navigate(`/cars?make=${makeId}`);
  };

  const navigateToModel = (e: React.MouseEvent, makeId: number, modelId: number) => {
    e.stopPropagation(); // Prevent triggering the make click
    navigate(`/cars?make=${makeId}&model=${modelId}`);
  };

  const navigateToElectricCar = (make: string, model: string) => {
    navigate(`/cars?search=${make}+${model}`);
  };

  const navigateToAllMakes = () => {
    navigate('/cars');
  };

  const navigateToAllModelsOfMake = (e: React.MouseEvent, makeId: number, makeName: string) => {
    e.stopPropagation(); // Prevent triggering the make click
    navigate(`/cars?make=${makeId}`);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 mt-10">
        <h2 className="text-2xl font-bold mb-4">Markat dhe Modelet</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 mt-10 mb-16">
      <h2 className="text-2xl font-bold mb-6">Markat dhe Modelet Popullorë</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Popular Makes */}
        {groupedMakes.popular.map((make) => (
          <div 
            key={make.id} 
            className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          >
            <div 
              onClick={() => toggleMake(make.id)} 
              className="flex justify-between items-center p-4 cursor-pointer bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100"
            >
              <h3 className="text-lg font-semibold">{make.name}</h3>
              <div className="flex items-center">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateToMake(make.id);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 mr-3"
                >
                  Të gjitha
                </button>
                <svg 
                  className={`w-5 h-5 transition-transform ${expandedMake === make.id ? 'transform rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {expandedMake === make.id && make.models && (
              <div className="p-4 bg-white">
                <ul className="space-y-2">
                  {make.models.map((model) => (
                    <li key={model.id} className="hover:bg-gray-50 rounded">
                      <button 
                        onClick={(e) => navigateToModel(e, make.id, model.id)}
                        className="w-full text-left py-1 px-2 text-gray-700 hover:text-blue-700 flex justify-between items-center"
                      >
                        <span>{model.name}</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </li>
                  ))}
                  <li className="border-t pt-2 mt-2">
                    <button 
                      onClick={(e) => navigateToAllModelsOfMake(e, make.id, make.name)}
                      className="w-full text-left py-1 px-2 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Të gjitha modelet {make.name} →
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        ))}
        
        {/* Additional Makes */}
        <div className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-lg font-semibold mb-2">Marka të Tjera</h3>
            <div className="grid grid-cols-2 gap-2">
              {groupedMakes.all.slice(0, 10).map((make) => (
                <button 
                  key={make.id}
                  onClick={() => navigateToMake(make.id)}
                  className="text-left py-1 px-2 text-gray-700 hover:text-blue-700 hover:bg-gray-50 rounded"
                >
                  {make.name}
                </button>
              ))}
            </div>
            <button 
              onClick={navigateToAllMakes}
              className="w-full text-left py-2 px-2 mt-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              Të gjitha Markat →
            </button>
          </div>
        </div>
        
        {/* Electric Cars Section */}
        <div className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div 
            onClick={toggleElectricSection} 
            className="flex justify-between items-center p-4 cursor-pointer bg-gradient-to-r from-green-50 to-teal-50 hover:from-green-100 hover:to-teal-100"
          >
            <h3 className="text-lg font-semibold">Makina Elektrike Popullore</h3>
            <svg 
              className={`w-5 h-5 transition-transform ${expandedElectricSection ? 'transform rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {expandedElectricSection && (
            <div className="p-4 bg-white">
              <ul className="space-y-2">
                {popularElectricCars.map((car, index) => (
                  <li key={index} className="hover:bg-gray-50 rounded">
                    <button 
                      onClick={() => navigateToElectricCar(car.make, car.model)}
                      className="w-full text-left py-1 px-2 text-gray-700 hover:text-blue-700 flex justify-between items-center"
                    >
                      <span>{car.make} {car.model}</span>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </li>
                ))}
                <li className="border-t pt-2 mt-2">
                  <button 
                    onClick={() => navigate('/cars?fuel_type=Elektrik')}
                    className="w-full text-left py-1 px-2 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Të gjitha makinat elektrike →
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickLinks;