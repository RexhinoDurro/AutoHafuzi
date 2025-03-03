// src/config/api.ts
export const API_BASE_URL = 'http://localhost:8000';

export const API_ENDPOINTS = {
  MAKES: `${API_BASE_URL}/api/makes/`,
  MODELS: (makeId: string) => `${API_BASE_URL}/api/models/${makeId}/`,
  VARIANTS: (modelId: string) => `${API_BASE_URL}/api/variants/${modelId}/`,
  CARS: {
    ADD: `${API_BASE_URL}/api/cars/add/`,
    UPDATE: (id: string) => `${API_BASE_URL}/api/cars/${id}/`,
    GET: (id: string) => `${API_BASE_URL}/api/cars/${id}/`,
    IMAGES: {
      UPLOAD: (carId: string | number) => `${API_BASE_URL}/api/cars/${carId}/images/`,
      DELETE: (imageId: number) => `${API_BASE_URL}/api/cars/images/${imageId}/`,
    },
  },
};