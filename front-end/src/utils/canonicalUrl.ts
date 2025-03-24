// src/utils/canonicalUrl.ts
// A utility to consistently manage canonical URLs across the application

/**
 * The primary domain for the website.
 * This should be the same domain used in the sitemap and robots.txt
 */
export const PRIMARY_DOMAIN = 'https://www.autohafuzi.com';

/**
 * Generates a canonical URL for the current page
 * @param path The current path (without domain)
 * @param queryParams Optional query parameters to include
 * @returns A full canonical URL
 */
export const getCanonicalUrl = (path: string, queryParams?: Record<string, string>): string => {
  // Ensure path starts with a slash
  if (!path.startsWith('/')) {
    path = `/${path}`;
  }
  
  // Build the base URL
  let canonicalUrl = `${PRIMARY_DOMAIN}${path}`;
  
  // Add query parameters if provided
  if (queryParams && Object.keys(queryParams).length > 0) {
    const searchParams = new URLSearchParams();
    
    // Add each parameter
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value) {
        searchParams.append(key, value);
      }
    });
    
    // Append to URL if we have parameters
    const queryString = searchParams.toString();
    if (queryString) {
      canonicalUrl += `?${queryString}`;
    }
  }
  
  return canonicalUrl;
};

/**
 * Updates the canonical link tag in the document head
 * @param url The full canonical URL
 */
export const updateCanonicalLink = (url: string): void => {
  // Look for existing canonical link
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  
  // Create one if it doesn't exist
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  
  // Set the href attribute
  canonicalLink.setAttribute('href', url);
};

/**
 * Sets the canonical URL for the current page
 * @param path The current path
 * @param queryParams Optional query parameters
 */
export const setCanonicalUrl = (path: string, queryParams?: Record<string, string>): void => {
  const url = getCanonicalUrl(path, queryParams);
  updateCanonicalLink(url);
};