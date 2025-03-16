import { useState, useEffect } from 'react';

/**
 * A custom hook that returns true if the current viewport matches the provided media query
 * 
 * @param query - CSS media query string (e.g., '(max-width: 768px)')
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  // Initialize with the current match state if window exists (client-side)
  // or false for server-side rendering
  const getMatches = (): boolean => {
    // Check if window is defined (to avoid SSR issues)
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  };

  const [matches, setMatches] = useState<boolean>(getMatches());

  useEffect(() => {
    // Define the media query list
    const mediaQueryList = window.matchMedia(query);
    
    // Define a callback function to handle changes
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Set up the event listener
    if (mediaQueryList.addEventListener) {
      // Modern browsers
      mediaQueryList.addEventListener('change', handleChange);
    } else {
      // Older browsers (e.g., Safari < 14)
      mediaQueryList.addListener(handleChange);
    }

    // Clean up the event listener when the component unmounts
    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener('change', handleChange);
      } else {
        mediaQueryList.removeListener(handleChange);
      }
    };
  }, [query]);

  return matches;
}

export default useMediaQuery;