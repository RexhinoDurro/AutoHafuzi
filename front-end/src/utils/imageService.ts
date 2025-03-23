// src/utils/imageService.ts

/**
 * Image Service for optimizing and converting images to modern formats
 */

// Image format types
type ImageFormat = 'webp' | 'avif' | 'jpeg' | 'png' | 'original';

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
 * Generate Cloudinary transformation URL for an image
 * @param imageUrl Original Cloudinary URL
 * @param width Desired width
 * @param height Desired height
 * @param format Image format ('auto' for automatic format selection)
 * @returns Optimized Cloudinary URL with transformations
 */
export const getCloudinaryUrl = (
  imageUrl: string,
  width: number,
  height: number,
  format: ImageFormat | 'auto' = 'auto'
): string => {
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
    return imageUrl;
  }
  
  const parts = imageUrl.split('/upload/');
  if (parts.length !== 2) return imageUrl;
  
  // Build transformation parameters
  const transformations = [
    `w_${width}`,
    `h_${height}`,
    'c_fill', // Crop to fill
    'q_auto', // Auto quality
    format === 'auto' ? 'f_auto' : `f_${format}` // Format
  ].join(',');
  
  return `${parts[0]}/upload/${transformations}/${parts[1]}`;
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

/**
 * Preload critical images to improve performance
 * @param urls Array of image URLs to preload
 */
export const preloadCriticalImages = (urls: string[]): void => {
  if (typeof window === 'undefined') return;
  
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
};