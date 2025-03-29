// First, let's create a utility for persistent image storage
// Create this as src/utils/persistentImageStorage.ts

import { TempImage } from './useCarFormImageUpload'

const TEMP_IMAGES_STORAGE_KEY = 'carform_temp_images';
const NEXT_TEMP_ID_STORAGE_KEY = 'carform_next_temp_id';
const SELECTED_ASPECT_RATIO_KEY = 'carform_aspect_ratio';

// Define aspect ratio types
export type AspectRatioOption = {
  label: string;
  value: string;
  width: number;
  height: number;
};

export const ASPECT_RATIO_OPTIONS: AspectRatioOption[] = [
  { label: 'Original', value: 'original', width: 0, height: 0 },
  { label: '16:9 (Landscape)', value: '16:9', width: 16, height: 9 },
  { label: '4:3 (Standard)', value: '4:3', width: 4, height: 3 },
  { label: '1:1 (Square)', value: '1:1', width: 1, height: 1 },
  { label: '3:2 (Classic)', value: '3:2', width: 3, height: 2 },
  { label: '2:3 (Portrait)', value: '2:3', width: 2, height: 3 },
  { label: '9:16 (Mobile)', value: '9:16', width: 9, height: 16 },
];

// Save temporary images to localStorage
export const saveTempImagesToStorage = (images: TempImage[]): void => {
  try {
    // We can't directly store File objects in localStorage, so we need to
    // store just the preview URLs and recreate the TempImage objects on load
    const serializedImages = images.map(img => ({
      id: img.id,
      preview: img.preview,
      originalName: img.file.name,
      type: img.file.type,
      lastModified: img.file.lastModified
    }));
    
    localStorage.setItem(TEMP_IMAGES_STORAGE_KEY, JSON.stringify(serializedImages));
  } catch (error) {
    console.error('Error saving temp images to storage:', error);
  }
};

// Load temporary images from localStorage
export const loadTempImagesFromStorage = async (): Promise<TempImage[]> => {
  try {
    const serializedImagesJson = localStorage.getItem(TEMP_IMAGES_STORAGE_KEY);
    if (!serializedImagesJson) return [];
    
    const serializedImages = JSON.parse(serializedImagesJson);
    
    // Create new TempImage objects from the serialized data
    const loadedImages: TempImage[] = [];
    
    for (const img of serializedImages) {
      try {
        // Fetch the image from the preview URL
        const response = await fetch(img.preview);
        const blob = await response.blob();
        
        // Create a new File object
        const file = new File([blob], img.originalName, {
          type: img.type,
          lastModified: img.lastModified
        });
        
        // Create a TempImage object
        loadedImages.push({
          id: img.id,
          file,
          preview: img.preview
        });
      } catch (fetchError) {
        console.error('Error loading image from preview URL:', fetchError);
      }
    }
    
    return loadedImages;
  } catch (error) {
    console.error('Error loading temp images from storage:', error);
    return [];
  }
};

// Save next temp ID to localStorage
export const saveNextTempIdToStorage = (nextId: number): void => {
  try {
    localStorage.setItem(NEXT_TEMP_ID_STORAGE_KEY, nextId.toString());
  } catch (error) {
    console.error('Error saving next temp ID to storage:', error);
  }
};

// Load next temp ID from localStorage
export const loadNextTempIdFromStorage = (): number => {
  try {
    const nextIdStr = localStorage.getItem(NEXT_TEMP_ID_STORAGE_KEY);
    if (!nextIdStr) return -1;
    return parseInt(nextIdStr, 10);
  } catch (error) {
    console.error('Error loading next temp ID from storage:', error);
    return -1;
  }
};

// Clear temporary images from localStorage
export const clearTempImagesFromStorage = (): void => {
  try {
    localStorage.removeItem(TEMP_IMAGES_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing temp images from storage:', error);
  }
};

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