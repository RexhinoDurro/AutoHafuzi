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

    // Special handling for car details page
    if (pathSegments.length === 2 && pathSegments[0] === 'car' && pathSegments[1]) {
      // Add 'Cars' as the intermediate breadcrumb
      items.push({ 
        name: 'Makina për Shitje', 
        path: '/cars', 
        isLast: false 
      });
      
      // Add the car title as the final breadcrumb
      items.push({ 
        name: carTitle || 'Detaje Makine', 
        path: location.pathname, 
        isLast: true 
      });
      
      return items;
    }
    
    // Process regular path segments
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
          // Skip this segment as we handle car details specially
          return;
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
          // For the car slug in car/:slug, use the car title
          if (params.id && segment === params.id && index === pathSegments.length - 1) {
            name = carTitle || 'Detaje Makine';
          } else {
            // Capitalize first letter for other segments
            name = segment.charAt(0).toUpperCase() + segment.slice(1);
          }
      }
      
      // Only add the item if we have a name for it
      if (name) {
        items.push({ name, path: currentPath, isLast });
      }
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