// src/utils/navigation.ts
import { NavigateFunction } from 'react-router-dom';

/**
 * Centralized function to navigate to car detail pages with proper tracking controls
 * 
 * @param navigate React Router navigate function
 * @param carId ID or slug of the car to view
 * @param options Navigation options
 *        - trackView: whether to track this view (default: true)
 *        - from: the page navigating from (for context)
 *        - replace: whether to replace current history entry (default: false)
 */
export const navigateToCarDetail = (
  navigate: NavigateFunction, 
  carId: string | number,
  options: {
    trackView?: boolean;
    from?: string;
    replace?: boolean;
  } = {}
) => {
  const { trackView = true, from, replace = false } = options;
  
  // Log navigation for debugging
  console.log(`[Navigation] To car ${carId} from ${from || 'unknown'}, trackView: ${trackView}`);
  
  navigate(`/car/${carId}`, {
    state: {
      doNotTrackView: !trackView,
      from,
      navigatedAt: Date.now()
    },
    replace
  });
};

/**
 * Check if the current navigation source should disable view tracking
 * 
 * @param pathname Current pathname or referrer path
 * @returns boolean indicating if tracking should be disabled
 */
export const shouldDisableViewTracking = (pathname: string): boolean => {
  const noTrackingPaths = [
    '/auth',
    '/admin',
    '/favorites'
  ];
  
  return noTrackingPaths.some(path => pathname.includes(path));
};

/**
 * Get a display-friendly name for a path
 * 
 * @param path The path to get a name for
 * @returns A user-friendly name for the path
 */
export const getPathDisplayName = (path: string): string => {
  if (!path) return 'Unknown';
  
  if (path === '/') return 'Home';
  if (path.includes('/auth') || path.includes('/admin')) return 'Admin';
  if (path.includes('/favorites')) return 'Favorites';
  if (path.includes('/cars')) return 'Car Listings';
  if (path.includes('/car/')) return 'Car Detail';
  if (path.includes('/about')) return 'About';
  if (path.includes('/contact')) return 'Contact';
  
  return path;
};