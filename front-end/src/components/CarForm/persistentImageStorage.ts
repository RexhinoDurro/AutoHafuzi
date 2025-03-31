// src/components/CarForm/persistentImageStorage.ts
// Updated to only store preferences, not blob URLs

// Define aspect ratio types
export type AspectRatioOption = {
  label: string;
  value: string;
  width: number;
  height: number;
};

// Constants for storage keys
const SELECTED_ASPECT_RATIO_KEY = 'carform_aspect_ratio';
const LAST_USED_CAR_FORM_KEY = 'last_used_car_form';

// Common aspect ratio options
export const ASPECT_RATIO_OPTIONS: AspectRatioOption[] = [
  { label: 'Original', value: 'original', width: 0, height: 0 },
  { label: '16:9 (Landscape)', value: '16:9', width: 16, height: 9 },
  { label: '4:3 (Standard)', value: '4:3', width: 4, height: 3 },
  { label: '1:1 (Square)', value: '1:1', width: 1, height: 1 },
  { label: '3:2 (Classic)', value: '3:2', width: 3, height: 2 },
  { label: '2:3 (Portrait)', value: '2:3', width: 2, height: 3 },
  { label: '9:16 (Mobile)', value: '9:16', width: 9, height: 16 },
];

// Save selected aspect ratio to localStorage
export const saveSelectedAspectRatio = (ratio: string): void => {
  try {
    localStorage.setItem(SELECTED_ASPECT_RATIO_KEY, ratio);
  } catch (error) {
    console.error('Error saving selected aspect ratio:', error);
  }
};

// Load selected aspect ratio from localStorage
export const loadSelectedAspectRatio = (): string => {
  try {
    const ratio = localStorage.getItem(SELECTED_ASPECT_RATIO_KEY);
    return ratio || 'original';
  } catch (error) {
    console.error('Error loading selected aspect ratio:', error);
    return 'original';
  }
};

// Get aspect ratio option by value
export const getAspectRatioByValue = (value: string): AspectRatioOption => {
  return ASPECT_RATIO_OPTIONS.find(option => option.value === value) || ASPECT_RATIO_OPTIONS[0];
};

// Save last viewed car form ID (to potentially restore draft state)
export const saveLastViewedCarForm = (id: string | null): void => {
  try {
    if (id) {
      localStorage.setItem(LAST_USED_CAR_FORM_KEY, id);
    } else {
      localStorage.removeItem(LAST_USED_CAR_FORM_KEY);
    }
  } catch (error) {
    console.error('Error saving last viewed car form:', error);
  }
};

// Get last viewed car form ID
export const getLastViewedCarForm = (): string | null => {
  try {
    return localStorage.getItem(LAST_USED_CAR_FORM_KEY);
  } catch (error) {
    console.error('Error getting last viewed car form:', error);
    return null;
  }
};

// Clear all car form related storage
export const clearAllCarFormStorage = (): void => {
  try {
    localStorage.removeItem(SELECTED_ASPECT_RATIO_KEY);
    localStorage.removeItem(LAST_USED_CAR_FORM_KEY);
    // Add any other related keys here
  } catch (error) {
    console.error('Error clearing car form storage:', error);
  }
};