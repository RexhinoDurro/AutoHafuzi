// src/pages/NotFound.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Car, Home } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-black text-white p-6 text-center">
          <h1 className="text-3xl font-bold">404</h1>
          <p className="text-xl">Faqja nuk u gjet</p>
        </div>
        
        <div className="p-6">
          <div className="flex justify-center mb-6">
            <img 
              src="/assets/logo.png" 
              alt="Auto Hafuzi" 
              className="h-20 w-auto" 
            />
          </div>
          
          <p className="text-gray-600 mb-6 text-center">
            Na vjen keq, por faqja që po kërkoni nuk ekziston ose mund të jetë zhvendosur.
          </p>
          
          <div className="space-y-3">
            <Link 
              to="/" 
              className="flex items-center justify-center gap-2 w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Home size={18} />
              <span>Kthehu në faqen kryesore</span>
            </Link>
            
            <Link 
              to="/cars" 
              className="flex items-center justify-center gap-2 w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <Car size={18} />
              <span>Shfleto makinat tona</span>
            </Link>
            
            <Link 
              to="/contact" 
              className="flex items-center justify-center gap-2 w-full p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Search size={18} />
              <span>Na kontaktoni për ndihmë</span>
            </Link>
            
            <button 
              onClick={() => window.history.back()}
              className="flex items-center justify-center gap-2 w-full p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <ArrowLeft size={18} />
              <span>Kthehu në faqen e mëparshme</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;