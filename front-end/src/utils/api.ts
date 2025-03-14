// utils/api.ts

/**
 * Base API Client that ensures cookies are sent with requests
 * This is important for session tracking
 */
export const apiClient = {
  get: async (url: string, token?: string) => {
    const headers: HeadersInit = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include', // Important: this ensures cookies are sent
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  post: async (url: string, data: any, token?: string) => {
    const headers: HeadersInit = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include', // Important: this ensures cookies are sent
      headers,
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  // Add other methods (PUT, DELETE, etc.) as needed
};