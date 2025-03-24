// src/components/Breadcrumbs.tsx
import React, { useMemo } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbsProps {
  carTitle?: string; // Optional car title for detail pages
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ carTitle }) => {
  const location = useLocation();
  const params = useParams();
  
  // Create breadcrumb path items
  const breadcrumbItems = useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(segment => segment);
    const items: {name: string; path: string; isLast: boolean}[] = [
      { name: 'Kryefaqja', path: '/', isLast: pathSegments.length === 0 }
    ];
    
    let currentPath = '';
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      // Get readable names for path segments
      let name = '';
      
      switch(segment) {
        case 'cars':
          name = 'Makina për Shitje';
          break;
        case 'car':
          name = carTitle || 'Detaje Makine';
          break;
        case 'about':
          name = 'Rreth Nesh';
          break;
        case 'contact':
          name = 'Kontakt';
          break;
        case 'favorites':
          name = 'Të Preferuarat';
          break;
        default:
          // Try to handle dynamic parameters
          if (params.id && segment === params.id) {
            name = carTitle || 'Detaje Makine';
          } else {
            // Capitalize first letter
            name = segment.charAt(0).toUpperCase() + segment.slice(1);
          }
      }
      
      items.push({ name, path: currentPath, isLast });
    });
    
    return items;
  }, [location.pathname, params, carTitle]);
  
  // Skip rendering if we only have the home item
  if (breadcrumbItems.length <= 1) {
    return null;
  }
  
  return (
    <nav aria-label="Breadcrumb" className="py-2 px-4 text-sm text-gray-600">
      <ol className="flex flex-wrap items-center">
        {breadcrumbItems.map((item, index) => (
          <li key={item.path} className="flex items-center">
            {index > 0 && (
              <ChevronRight size={14} className="mx-2 text-gray-400" />
            )}
            
            {item.isLast ? (
              <span className="font-medium text-gray-800" aria-current="page">
                {item.name}
              </span>
            ) : (
              <Link
                to={item.path}
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;