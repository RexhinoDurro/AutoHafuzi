import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getStoredAuth } from '../utils/auth';
import { Model, Make, Variant } from '../types/car';
import { Plus, Edit, Trash2, Search, ArrowLeft } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

const VariantsPage: React.FC = () => {
  const { makeId, modelId } = useParams<{ makeId: string; modelId: string }>();
  const [variants, setVariants] = useState<Variant[]>([]);
  const [make, setMake] = useState<Make | null>(null);
  const [model, setModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState(true);
  const [newVariantName, setNewVariantName] = useState('');
  const [editingVariantId, setEditingVariantId] = useState<number | null>(null);
  const [editingVariantName, setEditingVariantName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { token } = getStoredAuth();

  useEffect(() => {
    if (!token) {
      navigate('/auth/login');
      return;
    }
    fetchMakeAndModelDetails();
    fetchVariants();
  }, [makeId, modelId, token, navigate]);

  const fetchMakeAndModelDetails = async () => {
    try {
      // Fetch make details
      const makeResponse = await fetch(`${API_ENDPOINTS.MAKES}?admin=true`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (!makeResponse.ok) {
        throw new Error('Failed to fetch makes');
      }

      const makes = await makeResponse.json();
      const currentMake = makes.find((m: Make) => m.id === Number(makeId));
      
      if (currentMake) {
        setMake(currentMake);
      } else {
        navigate('/auth/makes?admin=true');
        return;
      }

      // Fetch model details
      const modelResponse = await fetch(`${API_ENDPOINTS.MODELS.LIST_BY_MAKE(makeId || '')}?admin=true`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (!modelResponse.ok) {
        throw new Error('Failed to fetch models');
      }

      const models = await modelResponse.json();
      const currentModel = models.find((m: Model) => m.id === Number(modelId));
      
      if (currentModel) {
        setModel(currentModel);
      } else {
        navigate(`/auth/makes/${makeId}/models?admin=true`);
      }
    } catch (error) {
      console.error('Error fetching make and model details:', error);
      navigate('/auth/makes?admin=true');
    }
  };

  const fetchVariants = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.VARIANTS.LIST_BY_MODEL(modelId || '')}?admin=true`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch variants');
      }
  
      const data = await response.json();
      setVariants(data);
    } catch (error) {
      console.error('Error fetching variants:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newVariantName.trim()) return;
    
    try {
      const response = await fetch(API_ENDPOINTS.VARIANTS.ADD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ name: newVariantName, model: Number(modelId) }),
      });

      if (!response.ok) {
        throw new Error('Failed to add variant');
      }

      const newVariant = await response.json();
      setVariants([...variants, newVariant]);
      setNewVariantName('');
    } catch (error) {
      console.error('Error adding variant:', error);
    }
  };

  const handleEditVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingVariantName.trim() || editingVariantId === null) return;
    
    try {
      const response = await fetch(API_ENDPOINTS.VARIANTS.UPDATE(editingVariantId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ name: editingVariantName, model: Number(modelId) }),
      });

      if (!response.ok) {
        throw new Error('Failed to update variant');
      }

      const updatedVariant = await response.json();
      setVariants(variants.map(variant => 
        variant.id === updatedVariant.id ? updatedVariant : variant
      ));
      setEditingVariantId(null);
      setEditingVariantName('');
    } catch (error) {
      console.error('Error updating variant:', error);
    }
  };

  const startEditingVariant = (variant: Variant) => {
    setEditingVariantId(variant.id);
    setEditingVariantName(variant.name);
  };

  const handleDeleteVariant = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this variant?')) {
      return;
    }
    
    try {
      const response = await fetch(API_ENDPOINTS.VARIANTS.DELETE(id), {
        method: 'DELETE',
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete variant');
      }

      setVariants(variants.filter(variant => variant.id !== id));
    } catch (error) {
      console.error('Error deleting variant:', error);
    }
  };

  const filteredVariants = variants.filter(variant => 
    variant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="p-4">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate(`/auth/makes/${makeId}/models?admin=true`)} 
          className="mr-4 flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={18} className="mr-1" /> Back to Models
        </button>
        <h1 className="text-2xl font-bold">{make?.name} {model?.name} Variants</h1>
      </div>
      
      {/* Search and Add Form */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search variants..."
            className="pl-10 pr-4 py-2 border rounded-lg w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <form onSubmit={handleAddVariant} className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="New variant name..."
            className="px-4 py-2 border rounded-lg flex-grow"
            value={newVariantName}
            onChange={(e) => setNewVariantName(e.target.value)}
          />
          <button 
            type="submit" 
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
            disabled={!newVariantName.trim()}
          >
            <Plus size={18} className="mr-1" /> Add Variant
          </button>
        </form>
      </div>
      
      {/* Variants Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredVariants.map((variant) => (
          <div 
            key={variant.id} 
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            {editingVariantId === variant.id ? (
              <form onSubmit={handleEditVariant} className="flex flex-col gap-2">
                <input
                  type="text"
                  className="px-3 py-2 border rounded"
                  value={editingVariantName}
                  onChange={(e) => setEditingVariantName(e.target.value)}
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
                    onClick={() => setEditingVariantId(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="font-bold text-lg mb-3">{variant.name}</div>
                <div className="flex justify-between mt-3">
                  <button
                    onClick={() => startEditingVariant(variant)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteVariant(variant.id)}
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
      
      {filteredVariants.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'No variants found matching your search.' : 'No variants found. Add your first variant using the form above.'}
        </div>
      )}
    </div>
  );
};

export default VariantsPage;