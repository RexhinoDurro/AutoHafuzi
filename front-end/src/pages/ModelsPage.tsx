import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getStoredAuth } from '../utils/auth';
import { Make, Model } from '../types/car';
import { Plus, Edit, Trash2, Search, ArrowLeft } from 'lucide-react';

interface ExtendedModel extends Model {
  variants_count?: number;
}

const ModelsPage: React.FC = () => {
  const { makeId } = useParams<{ makeId: string }>();
  const [models, setModels] = useState<ExtendedModel[]>([]);
  const [make, setMake] = useState<Make | null>(null);
  const [loading, setLoading] = useState(true);
  const [newModelName, setNewModelName] = useState('');
  const [editingModelId, setEditingModelId] = useState<number | null>(null);
  const [editingModelName, setEditingModelName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { token } = getStoredAuth();

  useEffect(() => {
    if (!token) {
      navigate('/auth/login');
      return;
    }
    fetchMakeDetails();
    fetchModels();
  }, [makeId, token, navigate]);

  const fetchMakeDetails = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/makes/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch makes');
      }

      const makes = await response.json();
      const currentMake = makes.find((m: Make) => m.id === Number(makeId));
      
      if (currentMake) {
        setMake(currentMake);
      } else {
        navigate('/auth/makes');
      }
    } catch (error) {
      console.error('Error fetching make details:', error);
      navigate('/auth/makes');
    }
  };

  const fetchModels = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/models/${makeId}/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }

      const data = await response.json();
      
      // For each model, fetch the count of variants
      const modelsWithVariantCounts = await Promise.all(
        data.map(async (model: Model) => {
          try {
            const variantsResponse = await fetch(`http://localhost:8000/api/variants/${model.id}/`, {
              headers: {
                Authorization: `Token ${token}`,
              },
            });
            
            if (!variantsResponse.ok) {
              return { ...model, variants_count: 0 };
            }
            
            const variants = await variantsResponse.json();
            return { ...model, variants_count: variants.length };
          } catch (error) {
            console.error(`Error fetching variants for model ${model.id}:`, error);
            return { ...model, variants_count: 0 };
          }
        })
      );
      
      setModels(modelsWithVariantCounts);
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddModel = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newModelName.trim()) return;
    
    try {
      // Create the payload with all required fields, including the empty variants array
      const payload = { 
        name: newModelName, 
        make: Number(makeId),
        variants: []  // Include empty variants array to satisfy the serializer
      };
      
      console.log('Sending model data:', payload);
      
      const response = await fetch('http://localhost:8000/api/models/add/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server error response:', errorData);
        throw new Error('Failed to add model');
      }

      const newModel = await response.json();
      setModels([...models, { ...newModel, variants_count: 0 }]);
      setNewModelName('');
    } catch (error) {
      console.error('Error adding model:', error);
    }
  };

  const handleEditModel = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingModelName.trim() || editingModelId === null) return;
    
    try {
      const payload = {
        name: editingModelName,
        make: Number(makeId),
        variants: []  // Include empty variants array for the edit operation too
      };
      
      console.log('Sending update model data:', payload);
      
      // There's overlap between the model_id parameter in the routes
      // URL for get_models uses make_id, and URL for update_model uses model_id
      // Since they both have the same pattern 'models/<int:...>/',
      // we need to use /models/update/id/ to ensure we're hitting the correct endpoint
      const response = await fetch(`http://localhost:8000/api/models/update/${editingModelId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server error response:', errorData);
        throw new Error('Failed to update model');
      }

      const updatedModel = await response.json();
      setModels(models.map(model => 
        model.id === updatedModel.id 
          ? { ...updatedModel, variants_count: model.variants_count } 
          : model
      ));
      setEditingModelId(null);
      setEditingModelName('');
    } catch (error) {
      console.error('Error updating model:', error);
    }
  };

  const startEditingModel = (model: Model) => {
    setEditingModelId(model.id);
    setEditingModelName(model.name);
  };

  const handleDeleteModel = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this model? This will also delete all associated variants.')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8000/api/models/delete/${id}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server error response:', errorData);
        throw new Error('Failed to delete model');
      }

      setModels(models.filter(model => model.id !== id));
    } catch (error) {
      console.error('Error deleting model:', error);
    }
  };

  const filteredModels = models.filter(model => 
    model.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewVariants = (modelId: number) => {
    navigate(`/auth/makes/${makeId}/models/${modelId}/variants`);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="p-4">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/auth/makes')} 
          className="mr-4 flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={18} className="mr-1" /> Back to Makes
        </button>
        <h1 className="text-2xl font-bold">{make?.name} Models</h1>
      </div>
      
      {/* Search and Add Form */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search models..."
            className="pl-10 pr-4 py-2 border rounded-lg w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <form onSubmit={handleAddModel} className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="New model name..."
            className="px-4 py-2 border rounded-lg flex-grow"
            value={newModelName}
            onChange={(e) => setNewModelName(e.target.value)}
          />
          <button 
            type="submit" 
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
            disabled={!newModelName.trim()}
          >
            <Plus size={18} className="mr-1" /> Add Model
          </button>
        </form>
      </div>
      
      {/* Models Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredModels.map((model) => (
          <div 
            key={model.id} 
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            {editingModelId === model.id ? (
              <form onSubmit={handleEditModel} className="flex flex-col gap-2">
                <input
                  type="text"
                  className="px-3 py-2 border rounded"
                  value={editingModelName}
                  onChange={(e) => setEditingModelName(e.target.value)}
                />
                <div className="flex justify-between">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                    onClick={() => setEditingModelId(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div 
                  className="font-bold text-lg mb-2 cursor-pointer hover:text-blue-600"
                  onClick={() => handleViewVariants(model.id)}
                >
                  {model.name}
                </div>
                <div className="text-sm text-gray-500">
                  {model.variants_count} {model.variants_count === 1 ? 'variant' : 'variants'}
                </div>
                <div className="flex justify-between mt-3">
                  <button
                    onClick={() => startEditingModel(model)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteModel(model.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      
      {filteredModels.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'No models found matching your search.' : 'No models found. Add your first model using the form above.'}
        </div>
      )}
    </div>
  );
};

export default ModelsPage;