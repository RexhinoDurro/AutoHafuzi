import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, CarIcon, Home, Users, Menu, X, Heart } from 'lucide-react';
import logo from '../assets/logo.png';
import { useFavorites } from '../context/FavouritesContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { favorites } = useFavorites();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <nav className="bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16 items-center">
            {/* Logo - Fixed to use w-auto for proper aspect ratio */}
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src={logo} 
                alt="Hafuzi Auto" 
                className="h-12 w-auto"
              />
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors">
                <Home className="h-5 w-5" />
                <span className="font-medium">Kryefaqja</span>
              </Link>

              <Link to="/about" className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors">
                <Users className="h-5 w-5" />
                <span className="font-medium">Rreth Nesh</span>
              </Link>

              <Link to="/cars" className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors">
                <CarIcon className="h-5 w-5" />
                <span className="font-medium">Makina në Shitje</span>
              </Link>

              <Link to="/contact" className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors">
                <Phone className="h-5 w-5" />
                <span className="font-medium">Kontakt</span>
              </Link>

              {/* Favorites Link */}
              <Link to="/favorites" className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors">
                <div className="relative">
                  <Heart className="h-5 w-5" />
                  {favorites.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {favorites.length}
                    </span>
                  )}
                </div>
                <span className="font-medium">Të Preferuarat</span>
              </Link>
            </div>

            {/* Mobile Menu Button - Fixed with accessible name */}
            <div className="md:hidden">
              <button 
                onClick={toggleMenu} 
                className="text-white focus:outline-none focus:ring-2 focus:ring-white p-1 rounded"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Sliding Panel - Fixed aria-hidden issue */}
      <div 
        className={`fixed top-0 right-0 w-64 h-full bg-black shadow-lg transform transition-transform duration-300 ease-in-out z-50 md:hidden 
        ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-hidden={!isMenuOpen} // Only hide from screen readers when menu is closed
      >
        {/* Close Button - Fixed with accessible name */}
        <div className="flex justify-end p-4">
          <button 
            onClick={toggleMenu} 
            className="text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 p-1 rounded"
            aria-label="Close menu"
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
            <span>Kryefaqja</span>
          </Link>
          <Link 
            to="/about" 
            onClick={toggleMenu} 
            className="text-white text-xl hover:text-gray-300 transition-colors flex items-center space-x-2"
          >
            <Users className="h-5 w-5" />
            <span>Rreth Nesh</span>
          </Link>
          <Link 
            to="/cars" 
            onClick={toggleMenu} 
            className="text-white text-xl hover:text-gray-300 transition-colors flex items-center space-x-2"
          >
            <CarIcon className="h-5 w-5" />
            <span>Makina në Shitje</span>
          </Link>
          <Link 
            to="/contact" 
            onClick={toggleMenu} 
            className="text-white text-xl hover:text-gray-300 transition-colors flex items-center space-x-2"
          >
            <Phone className="h-5 w-5" />
            <span>Kontakt</span>
          </Link>
          <Link 
            to="/favorites" 
            onClick={toggleMenu} 
            className="text-white text-xl hover:text-gray-300 transition-colors flex items-center space-x-2"
          >
            <div className="relative">
              <Heart className="h-5 w-5" />
              {favorites.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </div>
            <span>Të Preferuarat</span>
          </Link>
        </div>
      </div>

      {/* If you want to keep the ability to click outside to close menu, 
          but without a visible overlay, use a transparent overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-40 md:hidden"
          onClick={toggleMenu}
          aria-hidden="true" // This is correctly aria-hidden as it's purely decorative
        />
      )}
    </>
  );
};

export default Navbar;