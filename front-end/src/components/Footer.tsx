import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram } from 'lucide-react';
import hafuzilogo from '../assets/logo.png';

const Footer = () => {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link to="/" className="block">
              <img 
                src={hafuzilogo} 
                alt="Hafuzi Auto" 
                className="h-12 w-auto"
                width="48"
                height="48"
              />
            </Link>
            <p className="text-gray-400 text-sm">
              Partneri juaj i besuar në përsosmërinë e automjeteve
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-green-600">Lidhje të Shpejta</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  Kryefaqja
                </Link>
              </li>
              <li>
                <Link to="/rental" className="text-gray-400 hover:text-white transition-colors">
                  Makinë me Qira
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-green-600">Na Kontaktoni</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 text-gray-400">
                <Phone className="h-4 w-4" />
                <a href="tel:+355699311111" className="hover:text-white transition-colors">
                  069 931 1111
                </a>
              </li>
              <li className="flex items-center space-x-2 text-gray-400">
                <Mail className="h-4 w-4" />
                <a href="mailto:info@hafuziauto.ch" className="hover:text-white transition-colors">
                  info@hafuziauto.ch
                </a>
              </li>
              <li className="flex items-center space-x-2 text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>Fushë-Kruje, Albania, E762, Fushë Krujë</span>
              </li>
            </ul>
          </div>

          {/* Social Media - Fixed with accessible links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-green-600">Na Ndiqni</h3>
            <div className="flex space-x-4">
              <a 
                href="https://www.facebook.com/autohafuzi/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Visit our Facebook page"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a 
                href="https://www.instagram.com/autohafuzi" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Visit our Instagram page"
              >
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Hafuzi Auto. Të gjitha të drejtat e rezervuara.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-gray-400 text-sm hover:text-white transition-colors">
                Politika e Privatësisë
              </Link>
              <Link to="/terms" className="text-gray-400 text-sm hover:text-white transition-colors">
                Kushtet e Shërbimit
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;