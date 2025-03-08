import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CarFront, Phone, CarIcon, Home, Users, Menu, X } from 'lucide-react';
import logo from '../assets/logo.png'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <nav className="bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src={logo} 
                alt="Company Logo" 
                className="h-10"
              />
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors">
                <Home className="h-5 w-5" />
                <span className="font-medium">Home</span>
              </Link>

              <Link to="/about" className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors">
                <Users className="h-5 w-5" />
                <span className="font-medium">About Us</span>
              </Link>

              <Link to="/cars" className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors">
                <CarIcon className="h-5 w-5" />
                <span className="font-medium">Cars for Sale</span>
              </Link>

              <Link to="/contact" className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors">
                <Phone className="h-5 w-5" />
                <span className="font-medium">Contact</span>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                onClick={toggleMenu} 
                className="text-white focus:outline-none"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Sliding Panel */}
      <div 
        className={`fixed top-0 right-0 w-64 h-full bg-black shadow-lg transform transition-transform duration-300 ease-in-out z-50 md:hidden 
        ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Close Button */}
        <div className="flex justify-end p-4">
          <button 
            onClick={toggleMenu} 
            className="text-red-500 hover:text-red-700 focus:outline-none"
          >
            <X className="h-8 w-8" />
          </button>
        </div>

        {/* Mobile Menu Links */}
        <div className="flex flex-col space-y-6 px-6 pt-4">
          <Link 
            to="/" 
            onClick={toggleMenu} 
            className="text-white text-xl hover:text-gray-300 transition-colors flex items-center space-x-2"
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </Link>
          <Link 
            to="/about" 
            onClick={toggleMenu} 
            className="text-white text-xl hover:text-gray-300 transition-colors flex items-center space-x-2"
          >
            <Users className="h-5 w-5" />
            <span>About Us</span>
          </Link>
          <Link 
            to="/cars" 
            onClick={toggleMenu} 
            className="text-white text-xl hover:text-gray-300 transition-colors flex items-center space-x-2"
          >
            <CarIcon className="h-5 w-5" />
            <span>Cars for Sale</span>
          </Link>
          <Link 
            to="/contact" 
            onClick={toggleMenu} 
            className="text-white text-xl hover:text-gray-300 transition-colors flex items-center space-x-2"
          >
            <Phone className="h-5 w-5" />
            <span>Contact</span>
          </Link>
        </div>
      </div>

      {/* Overlay to dim background when menu is open */}

    </>
  );
};

export default Navbar;