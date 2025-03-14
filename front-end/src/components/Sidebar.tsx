// Sidebar.tsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  MessageSquare,
  Palette,
  LayoutDashboard,
  Settings,
  PlusCircle
} from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
  toggleCollapse?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, toggleCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();

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
            onClick={() => navigate(item.path)}
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