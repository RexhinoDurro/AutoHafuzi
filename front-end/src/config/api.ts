// src/config/api.ts
export const API_BASE_URL = 'http://localhost:8000';

export const API_ENDPOINTS = {
  MAKES: '/api/makes',
  MODELS: (makeId: string) => `/api/makes/${makeId}/models`,
  VARIANTS: (modelId: string) => `/api/models/${modelId}/variants`,
  CARS: {
    ADD: '/api/cars',
    UPDATE: (id: string) => `/api/cars/${id}`,
    GET: (id: string) => `/api/cars/${id}`,
    IMAGES: {
      UPLOAD: (carId: string | number) => `/api/cars/${carId}/images`,
      DELETE: (imageId: number) => `/api/cars/images/${imageId}`,
    },
  },
};