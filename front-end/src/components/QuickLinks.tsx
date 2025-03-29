// src/components/EnhancedQuickLinks.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import { ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';

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
  [key: string]: Make;
}

const EnhancedQuickLinks: React.FC = () => {
  const navigate = useNavigate();
  const [, setMakes] = useState<Make[]>([]);
  const [groupedMakes, setGroupedMakes] = useState<GroupedMakes>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedMake, setExpandedMake] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Popular makes to prioritize in display
  const popularMakeNames = ['Audi', 'BMW', 'Mercedes-Benz', 'Volkswagen', 'Toyota', 'Peugeot', 'Porsche', 'Ford'];

  // Fetch makes and their models
  useEffect(() => {
    const fetchMakesAndModels = async () => {
      try {
        setLoading(true);
        
        // Fetch all makes first
        const makesResponse = await fetch(API_ENDPOINTS.MAKES);
        if (!makesResponse.ok) throw new Error('Failed to fetch makes');
        
        const makesData: Make[] = await makesResponse.json();
        
        // Sort makes alphabetically
        const sortedMakes = [...makesData].sort((a, b) => a.name.localeCompare(b.name));
        
        // Filter out popular makes first
        const popularMakes = sortedMakes.filter(make => 
          popularMakeNames.includes(make.name)
        ).sort((a, b) => {
          // Custom sort to match the order in popularMakeNames
          return popularMakeNames.indexOf(a.name) - popularMakeNames.indexOf(b.name);
        });
        
        // Get other makes
        const otherMakes = sortedMakes.filter(make => 
          !popularMakeNames.includes(make.name)
        );
        
        // Combine with popular makes first
        const orderedMakes = [...popularMakes, ...otherMakes];
        setMakes(orderedMakes);
        
        // For each make, fetch its models
        const makesWithModels = await Promise.all(
          orderedMakes.map(async (make) => {
            try {
              const modelsResponse = await fetch(API_ENDPOINTS.MODELS.LIST_BY_MAKE(make.id.toString()));
              if (!modelsResponse.ok) return make;
              
              const modelsData: Model[] = await modelsResponse.json();
              
              // Only include makes that actually have models with cars
              if (modelsData && modelsData.length > 0) {
                return { ...make, models: modelsData };
              }
              return null;
            } catch (error) {
              console.error(`Error fetching models for make ${make.name}:`, error);
              return null;
            }
          })
        );
        
        // Filter out makes with no models
        const validMakes = makesWithModels.filter(make => make !== null) as Make[];
        
        // Group makes by first letter to create a lookup object
        const grouped: GroupedMakes = {};
        validMakes.forEach(make => {
          if (make && make.id) {
            grouped[make.id.toString()] = make;
          }
        });
        
        setGroupedMakes(grouped);
      } catch (error) {
        console.error('Error fetching makes and models:', error);
        setError('Failed to load quick links. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMakesAndModels();
  }, []);

  // Toggle a make's expanded state in mobile view
  const toggleMake = (makeId: number) => {
    setExpandedMake(expandedMake === makeId ? null : makeId);
  };

  // Navigate to filtered cars
  const navigateToMake = useCallback((makeId: number) => {
    navigate(`/cars?make=${makeId}`);
  }, [navigate]);

  const navigateToModel = useCallback((makeId: number, modelId: number, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation(); // Prevent triggering parent click events
    }
    navigate(`/cars?make=${makeId}&model=${modelId}`);
  }, [navigate]);

  // Determine if we're in mobile view

  // Handle empty state
  if (error) {
    return <div className="max-w-6xl mx-auto p-4 mt-10 text-center text-red-500">{error}</div>;
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 mt-10">
        <h2 className="text-2xl font-bold mb-6">Markat dhe Modelet Popullore</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-64 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  // Get a list of makes that have models
  const makesWithModels = Object.values(groupedMakes);
  
  // Select only top makes if there are many
  const displayMakes = makesWithModels.slice(0, 20); // Limit to 20 makes maximum

  return (
    <div className="max-w-6xl mx-auto p-4 mt-10 mb-16">
      <h2 className="text-2xl font-bold mb-6">Markat dhe Modelet Popullore</h2>
      
      {/* Desktop view - columns */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayMakes.map((make) => (
          <div 
            key={make.id} 
            className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          >
            <div 
              className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 cursor-pointer"
              onClick={() => navigateToMake(make.id)}
            >
              <h3 className="text-lg font-semibold">{make.name}</h3>
              <ChevronRight className="w-5 h-5" />
            </div>
            
            {make.models && make.models.length > 0 && (
              <div className="p-4 bg-white">
                <ul className="space-y-2">
                  {/* Show only top 5 models per make */}
                  {make.models.slice(0, 5).map((model) => (
                    <li key={model.id} className="hover:bg-gray-50 rounded">
                      <button 
                        onClick={(e) => navigateToModel(make.id, model.id, e)}
                        className="w-full text-left py-1 px-2 text-gray-700 hover:text-blue-700 flex justify-between items-center"
                      >
                        <span>{model.name}</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>
                    </li>
                  ))}
                  
                  {make.models.length > 5 && (
                    <li className="border-t pt-2 mt-2">
                      <button 
                        onClick={() => navigateToMake(make.id)}
                        className="w-full text-left py-1 px-2 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Të gjitha modelet {make.name} →
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Mobile view - accordion dropdowns */}
      <div className="md:hidden space-y-2">
        {displayMakes.map((make) => (
          <div 
            key={make.id} 
            className="border border-gray-200 rounded-lg shadow-sm overflow-hidden"
          >
            <div 
              onClick={() => toggleMake(make.id)} 
              className="flex justify-between items-center p-4 cursor-pointer bg-gradient-to-r from-blue-50 to-indigo-50"
            >
              <h3 className="text-lg font-semibold">{make.name}</h3>
              {expandedMake === make.id ? 
                <ChevronUp className="w-5 h-5" /> : 
                <ChevronDown className="w-5 h-5" />
              }
            </div>
            
            {expandedMake === make.id && make.models && make.models.length > 0 && (
              <div className="p-4 bg-white">
                <ul className="space-y-2">
                  {make.models.slice(0, 7).map((model) => (
                    <li key={model.id} className="hover:bg-gray-50 rounded">
                      <button 
                        onClick={(e) => navigateToModel(make.id, model.id, e)}
                        className="w-full text-left py-2 px-2 text-gray-700 hover:text-blue-700 flex justify-between items-center border-b"
                      >
                        <span>{model.name}</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>
                    </li>
                  ))}
                  
                  <li className="pt-2">
                    <button 
                      onClick={() => navigateToMake(make.id)}
                      className="w-full text-center py-2 px-2 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Të gjitha modelet {make.name} →
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* View all makes button */}
      <div className="text-center mt-8">
        <button
          onClick={() => navigate('/cars')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors shadow-md inline-flex items-center"
        >
          <span>Shiko të gjitha markat</span>
          <ChevronRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default EnhancedQuickLinks;