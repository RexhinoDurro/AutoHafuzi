// front-end/src/utils/imageService.ts

/**
 * Enhanced Image Service for optimizing and converting images
 * Supports modern formats like AVIF and WebP with runtime detection
 */

// Image format types
export type ImageFormat = 'avif' | 'webp' | 'jpeg' | 'png' | 'auto';

/**
 * Check if the browser supports a specific image format
 * @param format The image format to check
 * @returns A promise that resolves to true if the format is supported
 */
export const isFormatSupported = async (format: ImageFormat): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  
  // For WebP
  if (format === 'webp') {
    const webpImage = new Image();
    webpImage.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
    return new Promise(resolve => {
      webpImage.onload = () => resolve(true);
      webpImage.onerror = () => resolve(false);
    });
  }
  
  // For AVIF
  if (format === 'avif') {
    const avifImage = new Image();
    avifImage.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
    return new Promise(resolve => {
      avifImage.onload = () => resolve(true);
      avifImage.onerror = () => resolve(false);
    });
  }
  
  return Promise.resolve(true); // Assume other formats are supported
};

/**
 * Get the best image format supported by the browser
 * @returns A promise that resolves to the best supported format
 */
export const getBestImageFormat = async (): Promise<ImageFormat> => {
  // Try AVIF first (best compression)
  if (await isFormatSupported('avif')) {
    return 'avif';
  }
  
  // Then try WebP (good compression, widely supported)
  if (await isFormatSupported('webp')) {
    return 'webp';
  }
  
  // Fallback to JPEG
  return 'jpeg';
};

/**
 * Cache for storing format support results
 */
let formatSupportCache: Record<string, boolean> = {};
let bestFormatCache: ImageFormat | null = null;

/**
 * Initialize the image service by detecting format support
 * This should be called during app initialization
 */
export const initImageService = async (): Promise<void> => {
  formatSupportCache.avif = await isFormatSupported('avif');
  formatSupportCache.webp = await isFormatSupported('webp');
  bestFormatCache = await getBestImageFormat();
  console.log(`Image service initialized. Best format: ${bestFormatCache}`);
};

/**
 * Get the best image format supported by the browser (cached version)
 * @returns The best supported format
 */
export const getBestImageFormatCached = (): ImageFormat => {
  return bestFormatCache || 'jpeg';
};

/**
 * Generate Cloudinary transformation URL for an image
 * @param imageUrl Original Cloudinary URL
 * @param width Desired width
 * @param height Desired height
 * @param format Image format ('auto' for automatic format selection based on browser support)
 * @param quality Quality level (1-100, or 'auto')
 * @returns Optimized Cloudinary URL with transformations
 */
export const getCloudinaryUrl = (
  imageUrl: string,
  width: number = 800,
  height: number = 600,
  format: ImageFormat = 'auto',
  quality: number | 'auto' = 'auto'
): string => {
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
    return imageUrl;
  }
  
  try {
    const parts = imageUrl.split('/upload/');
    if (parts.length !== 2) return imageUrl;
    
    // If format is 'auto', use the detected best format
    const actualFormat = format === 'auto' 
      ? (bestFormatCache || 'auto')
      : format;
    
    // Build transformation parameters
    const transformations = [
      `w_${width}`,
      `h_${height}`,
      'c_fill', // Crop to fill
      quality === 'auto' ? 'q_auto' : `q_${quality}`, // Quality
      actualFormat === 'auto' ? 'f_auto' : `f_${actualFormat}` // Format
    ].join(',');
    
    return `${parts[0]}/upload/${transformations}/${parts[1]}`;
  } catch (error) {
    console.error('Error generating Cloudinary URL:', error);
    return imageUrl; // Return original URL on error
  }
};

/**
 * Compress an image file before upload
 * Uses the browser's canvas API to resize and compress images
 * 
 * @param file Original image file
 * @param options Compression options
 * @returns Promise resolving to a compressed Blob
 */
export const compressImage = async (
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: ImageFormat;
  } = {}
): Promise<Blob> => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    format = 'auto'
  } = options;
  
  return new Promise((resolve, reject) => {
    // Create a FileReader to read the file
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      // Create an image to hold the data
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        // Create a canvas and resize the image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Draw the image on the canvas
        ctx.drawImage(img, 0, 0, width, height);
        
        // Determine the output format
        let outputFormat: string;
        if (format === 'auto') {
          // Use the best format the browser supports
          outputFormat = bestFormatCache === 'avif' ? 'image/avif' : 
                        bestFormatCache === 'webp' ? 'image/webp' : 
                        'image/jpeg';
        } else {
          outputFormat = `image/${format}`;
        }
        
        // Get the compressed image data
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              // If the preferred format fails, fall back to JPEG
              canvas.toBlob(
                (jpegBlob) => {
                  if (jpegBlob) {
                    resolve(jpegBlob);
                  } else {
                    reject(new Error('Could not compress image'));
                  }
                },
                'image/jpeg',
                quality
              );
            }
          },
          outputFormat,
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Could not load image'));
      };
      
      // Set the image source to the FileReader result
      img.src = readerEvent.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Could not read file'));
    };
    
    // Read the file as a data URL
    reader.readAsDataURL(file);
  });
};

/**
 * Prepare multiple images for upload by compressing them
 * @param files Array of image files
 * @param options Compression options
 * @returns Promise resolving to an array of compressed files
 */
export const prepareImagesForUpload = async (
  files: File[],
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: ImageFormat;
  } = {}
): Promise<File[]> => {
  try {
    const compressedFiles = await Promise.all(
      files.map(async (file) => {
        // Only compress image files
        if (!file.type.startsWith('image/')) {
          return file;
        }
        
        const compressedBlob = await compressImage(file, options);
        
        // Create a new File from the compressed Blob
        return new File([compressedBlob], file.name, {
          type: compressedBlob.type,
          lastModified: file.lastModified
        });
      })
    );
    
    return compressedFiles;
  } catch (error) {
    console.error('Error preparing images for upload:', error);
    return files; // Return original files on error
  }
};

/**
 * Get image dimensions and aspect ratio
 * @param url Image URL
 * @returns Promise with image width, height and aspect ratio
 */
export const getImageDimensions = (url: string): Promise<{
  width: number;
  height: number;
  aspectRatio: number;
}> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        aspectRatio: img.width / img.height
      });
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
};

// Create a placeholder image URL
export const getPlaceholderImageUrl = (width: number, height: number): string => {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E%3Crect width='${width}' height='${height}' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14px' fill='%23999'%3E${width}x${height}%3C/text%3E%3C/svg%3E`;
};

// Initialize the image service when the module is imported
if (typeof window !== 'undefined') {
  initImageService().catch(error => {
    console.error('Failed to initialize image service:', error);
  });
}