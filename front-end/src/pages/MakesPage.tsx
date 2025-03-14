import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredAuth } from '../utils/auth';
import { Make } from '../types/car';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

const MakesPage: React.FC = () => {
  const [makes, setMakes] = useState<Make[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMakeName, setNewMakeName] = useState('');
  const [editingMakeId, setEditingMakeId] = useState<number | null>(null);
  const [editingMakeName, setEditingMakeName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { token } = getStoredAuth();

  useEffect(() => {
    if (!token) {
      navigate('/auth/login');
      return;
    }
    fetchMakes();
  }, [token, navigate]);

  const fetchMakes = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/makes/', {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch makes');
      }

      const data = await response.json();
      setMakes(data);
    } catch (error) {
      console.error('Error fetching makes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMake = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMakeName.trim()) return;
    
    try {
      const response = await fetch('http://localhost:8000/api/makes/add/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ name: newMakeName }),
      });

      if (!response.ok) {
        throw new Error('Failed to add make');
      }

      const newMake = await response.json();
      setMakes([...makes, newMake]);
      setNewMakeName('');
    } catch (error) {
      console.error('Error adding make:', error);
    }
  };

  const handleEditMake = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingMakeName.trim() || editingMakeId === null) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/makes/${editingMakeId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ name: editingMakeName }),
      });

      if (!response.ok) {
        throw new Error('Failed to update make');
      }

      const updatedMake = await response.json();
      setMakes(makes.map(make => make.id === updatedMake.id ? updatedMake : make));
      setEditingMakeId(null);
      setEditingMakeName('');
    } catch (error) {
      console.error('Error updating make:', error);
    }
  };

  const startEditingMake = (make: Make) => {
    setEditingMakeId(make.id);
    setEditingMakeName(make.name);
  };

  const handleDeleteMake = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this make? This will also delete all associated models and variants.')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8000/api/makes/${id}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete make');
      }

      setMakes(makes.filter(make => make.id !== id));
    } catch (error) {
      console.error('Error deleting make:', error);
    }
  };

  const filteredMakes = makes.filter(make => 
    make.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewModels = (makeId: number) => {
    navigate(`/auth/makes/${makeId}/models`);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Car Makes</h1>
      
      {/* Search and Add Form */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search makes..."
            className="pl-10 pr-4 py-2 border rounded-lg w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <form onSubmit={handleAddMake} className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="New make name..."
            className="px-4 py-2 border rounded-lg flex-grow"
            value={newMakeName}
            onChange={(e) => setNewMakeName(e.target.value)}
          />
          <button 
            type="submit" 
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
            disabled={!newMakeName.trim()}
          >
            <Plus size={18} className="mr-1" /> Add Make
          </button>
        </form>
      </div>
      
      {/* Makes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredMakes.map((make) => (
          <div 
            key={make.id} 
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            {editingMakeId === make.id ? (
              <form onSubmit={handleEditMake} className="flex flex-col gap-2">
                <input
                  type="text"
                  className="px-3 py-2 border rounded"
                  value={editingMakeName}
                  onChange={(e) => setEditingMakeName(e.target.value)}
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
                    onClick={() => setEditingMakeId(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div 
                  className="font-bold text-lg mb-2 cursor-pointer hover:text-blue-600"
                  onClick={() => handleViewModels(make.id)}
                >
                  {make.name}
                </div>
                <div className="flex justify-between mt-3">
                  <button
                    onClick={() => startEditingMake(make)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteMake(make.id)}
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
      
      {filteredMakes.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'No makes found matching your search.' : 'No makes found. Add your first make using the form above.'}
        </div>
      )}
    </div>
  );
};

export default MakesPage;