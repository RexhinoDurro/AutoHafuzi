// src/config/api.ts
export const API_BASE_URL = 'https://autohafuzi.onrender.com';

export const API_ENDPOINTS = {
  MAKES: `${API_BASE_URL}/api/makes/`,
  MODELS: {
    LIST_BY_MAKE: (makeId: string) => `${API_BASE_URL}/api/models/by-make/${makeId}/`,
    ADD: `${API_BASE_URL}/api/models/add/`,
    UPDATE: (modelId: string | number) => `${API_BASE_URL}/api/models/update/${modelId}/`,
    DELETE: (modelId: string | number) => `${API_BASE_URL}/api/models/delete/${modelId}/`,
  },
  VARIANTS: {
    LIST_BY_MODEL: (modelId: string) => `${API_BASE_URL}/api/variants/by-model/${modelId}/`,
    ADD: `${API_BASE_URL}/api/variants/add/`,
    UPDATE: (variantId: string | number) => `${API_BASE_URL}/api/variants/update/${variantId}/`,
    DELETE: (variantId: string | number) => `${API_BASE_URL}/api/variants/delete/${variantId}/`,
  },
  OPTIONS: {
    LIST: `${API_BASE_URL}/api/options/list/`,
    ADD: `${API_BASE_URL}/api/options/`,
    DELETE: (optionId: number) => `${API_BASE_URL}/api/options/${optionId}/`,
    CATEGORIES: `${API_BASE_URL}/api/option-categories/`,
  },
  EXTERIOR_COLORS: `${API_BASE_URL}/api/exterior-colors/`,
  INTERIOR_COLORS: `${API_BASE_URL}/api/interior-colors/`,
  UPHOLSTERY: `${API_BASE_URL}/api/upholstery/`,  // Add this line
  CARS: {
    LIST: `${API_BASE_URL}/api/cars/`,
    ADD: `${API_BASE_URL}/api/cars/add/`,
    UPDATE: (id: string | number) => `${API_BASE_URL}/api/cars/update/${id}/`,
    GET: (id: string | number) => `${API_BASE_URL}/api/cars/${id}/`,
    DELETE: (id: string | number) => `${API_BASE_URL}/api/cars/delete/${id}/`,
    IMAGES: {
      UPLOAD: (carId: string | number) => `${API_BASE_URL}/api/cars/${carId}/images/`,
      DELETE: (imageId: number) => `${API_BASE_URL}/api/cars/images/${imageId}/`,
    },
  },
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/`,
  },
  ABOUT: `${API_BASE_URL}/api/about/`,
  CONTACT: {
    INFO: `${API_BASE_URL}/api/contact/`,
    SUBMIT: `${API_BASE_URL}/api/contact/submit/`,
    MESSAGES: `${API_BASE_URL}/api/contact/messages/`,
    MARK_READ: (messageId: number) => `${API_BASE_URL}/api/contact/messages/${messageId}/read/`,
    DELETE: (messageId: number) => `${API_BASE_URL}/api/contact/messages/${messageId}/delete/`,
  },
  ANALYTICS: `${API_BASE_URL}/api/analytics/`,
  PLACEHOLDER_IMAGES: (width: number, height: number) => `${API_BASE_URL}/api/placeholder/${width}/${height}`,
};
