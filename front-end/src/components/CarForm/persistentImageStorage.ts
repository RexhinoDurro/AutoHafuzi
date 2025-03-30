// Fixed persistentImageStorage.ts with TypeScript fixes for nullable items
import { TempImage } from './useCarFormImageUpload'

const TEMP_IMAGES_STORAGE_KEY = 'carform_temp_images';
const NEXT_TEMP_ID_STORAGE_KEY = 'carform_next_temp_id';
const SELECTED_ASPECT_RATIO_KEY = 'carform_aspect_ratio';
const CAR_FORM_SESSION_KEY = 'carform_session_id';

// Define aspect ratio types
export interface AspectRatioOption {
  label: string;
  value: string;
  width: number;
  height: number;
}

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

// Interface for serialized image data
interface SerializedImage {
  id: number;
  preview: string;
  originalName: string;
  type: string;
  lastModified: number;
  size: number;
  timestamp: number;
}

// Enhanced function to save temporary images to localStorage with error handling and retry
export const saveTempImagesToStorage = (images: TempImage[]): void => {
  try {
    if (!images || images.length === 0) {
      console.log('No images to save to storage');
      return;
    }
    
    // We can't directly store File objects in localStorage, so we need to
    // store just the preview URLs and recreate the TempImage objects on load
    const serializedImages: SerializedImage[] = images
      .map(img => {
        if (!img || !img.file) {
          console.warn('Invalid image object found when serializing');
          return null;
        }
        
        return {
          id: img.id,
          preview: img.preview,
          originalName: img.file.name,
          type: img.file.type,
          lastModified: img.file.lastModified,
          size: img.file.size,
          timestamp: Date.now() // Add timestamp for ordering and debugging
        };
      })
      .filter((img): img is SerializedImage => img !== null); // Type guard to filter out nulls
    
    if (serializedImages.length === 0) {
      console.warn('No valid images to save after serialization');
      return;
    }
    
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
    
    console.log(`Saved ${serializedImages.length} temporary images to localStorage with key ${storageKey}`);
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
    console.log(`Loading temporary images from localStorage with key ${storageKey}`);
    
    const serializedImagesJson = localStorage.getItem(storageKey);
    if (!serializedImagesJson) {
      console.log(`No temporary images found in localStorage with key ${storageKey}`);
      return [];
    }
    
    const serializedImages = JSON.parse(serializedImagesJson) as SerializedImage[];
    if (!Array.isArray(serializedImages) || serializedImages.length === 0) {
      console.log('No valid images found in storage');
      return [];
    }
    
    // Create new TempImage objects from the serialized data
    const loadedImages: TempImage[] = [];
    const loadPromises = serializedImages.map(async (img) => {
      try {
        // Check if we have a preview URL
        if (img && img.preview) {
          // Fetch the image from the preview URL
          const response = await fetch(img.preview);
          if (!response.ok) {
            throw new Error(`Failed to fetch image from preview URL: ${response.status}`);
          }
          
          const blob = await response.blob();
          
          // Create a new File object
          const file = new File([blob], img.originalName || 'image.jpg', {
            type: img.type || 'image/jpeg',
            lastModified: img.lastModified || Date.now()
          });
          
          // Create a new object URL for the blob
          const preview = URL.createObjectURL(blob);
          
          // Create a TempImage object
          loadedImages.push({
            id: img.id,
            file,
            preview
          });
          
          console.log(`Successfully loaded image ${img.id} with preview ${preview.substring(0, 30)}...`);
        } else {
          console.warn('Image in storage is missing preview URL', img);
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
    const storageKey = getStorageKey(NEXT_TEMP_ID_STORAGE_KEY);
    localStorage.setItem(storageKey, nextId.toString());
    console.log(`Saved next temp ID ${nextId} to storage with key ${storageKey}`);
  } catch (error) {
    console.error('Error saving next temp ID to storage:', error);
  }
};

// Load next temp ID from localStorage
export const loadNextTempIdFromStorage = (): number => {
  try {
    const storageKey = getStorageKey(NEXT_TEMP_ID_STORAGE_KEY);
    const nextIdStr = localStorage.getItem(storageKey);
    
    if (!nextIdStr) {
      console.log(`No next temp ID found in storage with key ${storageKey}, using default -1`);
      return -1;
    }
    
    const nextId = parseInt(nextIdStr, 10);
    console.log(`Loaded next temp ID ${nextId} from storage with key ${storageKey}`);
    return nextId;
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
    console.log(`Saved selected aspect ratio: ${ratio}`);
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