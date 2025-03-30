// front-end/src/components/CarForm/persistentImageStorage.ts - Enhanced version
import { TempImage } from './useCarFormImageUpload'

const TEMP_IMAGES_STORAGE_KEY = 'carform_temp_images';
const NEXT_TEMP_ID_STORAGE_KEY = 'carform_next_temp_id';
const SELECTED_ASPECT_RATIO_KEY = 'carform_aspect_ratio';
const CAR_FORM_SESSION_KEY = 'carform_session_id'; // Add session ID to prevent conflicts

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

// Generate a unique session ID or use existing one
export const getFormSessionId = (): string => {
  let sessionId = localStorage.getItem(CAR_FORM_SESSION_KEY);
  if (!sessionId) {
    sessionId = `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(CAR_FORM_SESSION_KEY, sessionId);
  }
  return sessionId;
};

// Create a better storage key that includes the session ID to prevent conflicts
const getStorageKey = (baseKey: string): string => {
  const sessionId = getFormSessionId();
  return `${baseKey}_${sessionId}`;
};

// Enhanced function to save temporary images to localStorage with error handling and retry
export const saveTempImagesToStorage = (images: TempImage[]): void => {
  try {
    // We can't directly store File objects in localStorage, so we need to
    // store just the preview URLs and recreate the TempImage objects on load
    const serializedImages = images.map(img => ({
      id: img.id,
      preview: img.preview,
      originalName: img.file.name,
      type: img.file.type,
      lastModified: img.file.lastModified,
      size: img.file.size,
      timestamp: Date.now() // Add timestamp for ordering and debugging
    }));
    
    // Use a session-specific key
    const storageKey = getStorageKey(TEMP_IMAGES_STORAGE_KEY);
    
    // Check if we'll exceed localStorage limits and handle accordingly
    // (localStorage typically has a 5MB limit)
    const jsonData = JSON.stringify(serializedImages);
    if (jsonData.length > 4 * 1024 * 1024) { // 4MB to be safe
      console.warn('Image data too large for localStorage. Storing essential information only.');
      // Store minimal data - just IDs and metadata without previews
      const minimalData = serializedImages.map(img => ({
        id: img.id,
        originalName: img.originalName,
        type: img.type,
        lastModified: img.lastModified,
        size: img.size,
        timestamp: img.timestamp
      }));
      localStorage.setItem(storageKey, JSON.stringify(minimalData));
    } else {
      localStorage.setItem(storageKey, jsonData);
    }
    
    console.log(`Saved ${images.length} temporary images to localStorage with key ${storageKey}`);
  } catch (error) {
    console.error('Error saving temp images to storage:', error);
    try {
      // Backup attempt - store just the IDs if JSON serialization fails
      const ids = images.map(img => img.id);
      localStorage.setItem(getStorageKey(`${TEMP_IMAGES_STORAGE_KEY}_backup`), JSON.stringify(ids));
    } catch (backupError) {
      console.error('Backup storage also failed:', backupError);
    }
  }
};

// Enhanced load function with better error handling and fallbacks
export const loadTempImagesFromStorage = async (): Promise<TempImage[]> => {
  try {
    const storageKey = getStorageKey(TEMP_IMAGES_STORAGE_KEY);
    const serializedImagesJson = localStorage.getItem(storageKey);
    if (!serializedImagesJson) {
      console.log(`No temporary images found in localStorage with key ${storageKey}`);
      return [];
    }
    
    console.log(`Loading temporary images from localStorage with key ${storageKey}`);
    const serializedImages = JSON.parse(serializedImagesJson);
    if (!Array.isArray(serializedImages) || serializedImages.length === 0) {
      return [];
    }
    
    // Create new TempImage objects from the serialized data
    const loadedImages: TempImage[] = [];
    const loadPromises = serializedImages.map(async (img) => {
      try {
        // Check if we have a preview URL
        if (img.preview) {
          // Fetch the image from the preview URL
          const response = await fetch(img.preview);
          if (!response.ok) {
            throw new Error(`Failed to fetch image from preview URL: ${response.status}`);
          }
          const blob = await response.blob();
          
          // Create a new File object
          const file = new File([blob], img.originalName, {
            type: img.type,
            lastModified: img.lastModified
          });
          
          // Create a new object URL for the blob
          const preview = URL.createObjectURL(blob);
          
          // Create a TempImage object
          loadedImages.push({
            id: img.id,
            file,
            preview
          });
        }
      } catch (fetchError) {
        console.error('Error loading image from preview URL:', fetchError);
      }
    });
    
    // Wait for all promises to settle
    await Promise.allSettled(loadPromises);
    
    console.log(`Successfully loaded ${loadedImages.length} of ${serializedImages.length} temporary images`);
    return loadedImages;
  } catch (error) {
    console.error('Error loading temp images from storage:', error);
    return [];
  }
};

// Save next temp ID to localStorage
export const saveNextTempIdToStorage = (nextId: number): void => {
  try {
    localStorage.setItem(getStorageKey(NEXT_TEMP_ID_STORAGE_KEY), nextId.toString());
  } catch (error) {
    console.error('Error saving next temp ID to storage:', error);
  }
};

// Load next temp ID from localStorage
export const loadNextTempIdFromStorage = (): number => {
  try {
    const nextIdStr = localStorage.getItem(getStorageKey(NEXT_TEMP_ID_STORAGE_KEY));
    if (!nextIdStr) return -1;
    return parseInt(nextIdStr, 10);
  } catch (error) {
    console.error('Error loading next temp ID from storage:', error);
    return -1;
  }
};

// Clear temporary images from localStorage but only for the current session
export const clearTempImagesFromStorage = (): void => {
  try {
    // Only remove items for the current session
    const storageKey = getStorageKey(TEMP_IMAGES_STORAGE_KEY);
    localStorage.removeItem(storageKey);
    localStorage.removeItem(getStorageKey(NEXT_TEMP_ID_STORAGE_KEY));
    console.log(`Cleared temporary images from localStorage with key ${storageKey}`);
  } catch (error) {
    console.error('Error clearing temp images from storage:', error);
  }
};

// Clear ALL car form session data, including images - use with caution
export const clearAllCarFormData = (): void => {
  try {
    // Remove all CarForm-related localStorage items
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith('carform_temp_images') || 
        key.startsWith('carform_next_temp_id') ||
        key.startsWith('carform_aspect_ratio') ||
        key === CAR_FORM_SESSION_KEY
      )) {
        localStorage.removeItem(key);
      }
    }
    console.log('Cleared all CarForm data from localStorage');
  } catch (error) {
    console.error('Error clearing all CarForm data:', error);
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