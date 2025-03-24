// Sidebar.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  MessageSquare,
  Palette,
  LayoutDashboard,
  Settings,
  PlusCircle,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
  toggleCollapse?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, toggleCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/auth/dashboard',
      icon: <Home size={20} />,
    },
    {
      title: 'Add Car',
      path: '/auth/add-car',
      icon: <PlusCircle size={20} />,
    },
    {
      title: 'Makes & Models',
      path: '/auth/makes',
      icon: <Settings size={20} />,
    },
    {
      title: 'Messages',
      path: '/auth/contact-messages',
      icon: <MessageSquare size={20} />,
    },
    {
      title: 'Colors',
      path: '/exterior-colors',
      icon: <Palette size={20} />,
    },
    {
      title: 'Options',
      path: '/options',
      icon: <LayoutDashboard size={20} />,
    },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  // Mobile burger menu button
  const renderBurgerButton = () => (
    <button 
      className="fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-md shadow-lg"
      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
    >
      {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
    </button>
  );

  // Mobile sidebar
  if (isMobile) {
    return (
      <>
        {renderBurgerButton()}
        
        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
        
        {/* Mobile sidebar */}
        <div 
          className={`fixed top-0 left-0 h-full bg-gray-800 text-white w-64 z-40 transform transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <span className="text-xl font-bold">Admin Panel</span>
            <button onClick={() => setMobileMenuOpen(false)} className="text-white">
              <X size={20} />
            </button>
          </div>
          
          <div className="mt-6">
            {menuItems.map((item) => (
              <div
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`flex items-center px-4 py-3 cursor-pointer hover:bg-gray-700 ${
                  isActive(item.path) ? 'bg-gray-700' : ''
                }`}
              >
                <div className="mr-3">{item.icon}</div>
                <span>{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  // Desktop sidebar
  return (
    <div 
      className={`bg-gray-800 text-white h-screen ${
        collapsed ? 'w-16' : 'w-64'
      } transition-all duration-300 fixed left-0 top-0 z-10`}
    >
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        {!collapsed && <span className="text-xl font-bold">Admin Panel</span>}
        <button onClick={toggleCollapse} className="text-white">
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <div className="mt-6">
        {menuItems.map((item) => (
          <div
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            className={`flex items-center px-4 py-3 cursor-pointer hover:bg-gray-700 ${
              isActive(item.path) ? 'bg-gray-700' : ''
            }`}
          >
            <div className="mr-3">{item.icon}</div>
            {!collapsed && <span>{item.title}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;