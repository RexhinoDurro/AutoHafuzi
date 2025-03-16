import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useUpholstery from '../components/useUpholstery';
import { getStoredAuth } from '../utils/auth';

const UpholsteryManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { token } = getStoredAuth();
  
  const {
    upholsteryTypes,
    isLoading,
    error,
    addUpholsteryType,
    deleteUpholsteryType
  } = useUpholstery();
  
  const [newUpholsteryName, setNewUpholsteryName] = useState('');
  const [message, setMessage] = useState('');
  
  // Check authentication
  if (!token) {
    navigate('/auth/login', { state: { returnUrl: '/upholstery-management' } });
    return null;
  }
  
  const handleAddUpholstery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpholsteryName.trim()) {
      setMessage('Upholstery name is required');
      return;
    }
    
    try {
      await addUpholsteryType(newUpholsteryName);
      setNewUpholsteryName('');
      setMessage('Upholstery type added successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error adding upholstery:', err);
    }
  };
  
  const handleDeleteUpholstery = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this upholstery type?')) {
      return;
    }
    
    try {
      await deleteUpholsteryType(id);
      setMessage('Upholstery type deleted successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting upholstery:', err);
    }
  };
  
  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }
  
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Upholstery Management</h1>
      
      {/* Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button className="float-right font-bold">&times;</button>
        </div>
      )}
      
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {message}
          <button className="float-right font-bold" onClick={() => setMessage('')}>&times;</button>
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Upholstery Types</h2>
        
        {/* Add Upholstery Form */}
        <form onSubmit={handleAddUpholstery} className="mb-6">
          <div className="flex">
            <input
              type="text"
              value={newUpholsteryName}
              onChange={(e) => setNewUpholsteryName(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md"
              placeholder="e.g. Leather"
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-r-md transition"
            >
              Add Upholstery Type
            </button>
          </div>
        </form>
        
        {/* Upholstery List */}
        <div className="overflow-auto max-h-96">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-left">Name</th>
                <th className="py-2 px-4 border-b text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {upholsteryTypes.map((type) => (
                <tr key={type.id}>
                  <td className="py-2 px-4 border-b">{type.name}</td>
                  <td className="py-2 px-4 border-b text-right">
                    <button
                      onClick={() => handleDeleteUpholstery(type.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {upholsteryTypes.length === 0 && (
                <tr>
                  <td colSpan={2} className="py-4 text-center text-gray-500">
                    No upholstery types found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UpholsteryManagementPage;