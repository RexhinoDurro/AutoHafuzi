// src/components/ResponsiveImage.tsx
import React, { useState, CSSProperties } from 'react';
import { API_BASE_URL } from '../config/api';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  lazy?: boolean;
  sizes?: string;
  placeholder?: string;
  onLoad?: () => void;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  style?: CSSProperties;
}

/**
 * A responsive image component that delivers optimized images
 * with modern formats and proper sizing
 */
const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  width = 800,
  height = 600,
  className = '',
  lazy = true,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  placeholder = '',
  onLoad,
  objectFit = 'cover',
  style = {}
}) => {
  const [imageError, setImageError] = useState(false);
  const defaultPlaceholder = `${API_BASE_URL}/api/placeholder/${width}/${height}`;
  
  // Function to check if a URL is a Cloudinary URL
  const isCloudinaryUrl = (url: string): boolean => {
    return url.includes('cloudinary.com');
  };
  
  // Generate optimized Cloudinary URL if it's a Cloudinary image
  const getOptimizedSrc = (imgSrc: string, imgWidth: number, imgHeight: number): string => {
    if (isCloudinaryUrl(imgSrc)) {
      // Extract base URL and transformation parts
      const parts = imgSrc.split('/upload/');
      if (parts.length === 2) {
        // Add responsive transformations:
        // - w_{width} - Set width
        // - h_{height} - Set height
        // - c_fill - Crop to fill the dimensions
        // - q_auto - Automatic quality optimization
        // - f_auto - Automatic format selection (WebP for supported browsers)
        return `${parts[0]}/upload/w_${imgWidth},h_${imgHeight},c_fill,q_auto,f_auto/${parts[1]}`;
      }
    }
    
    // Return original source if not a Cloudinary URL or can't parse it
    return imgSrc;
  };
  
  // Generate srcSet for responsive images
  const generateSrcSet = (imgSrc: string): string => {
    if (!isCloudinaryUrl(imgSrc)) return '';
    
    // Generate various sizes for responsive loading
    const breakpoints = [320, 640, 768, 1024, 1280, 1536];
    return breakpoints
      .map(bp => {
        const resizedHeight = Math.round((height / width) * bp);
        return `${getOptimizedSrc(imgSrc, bp, resizedHeight)} ${bp}w`;
      })
      .join(', ');
  };
  
  // Prepare the source and fallback
  const imageSrc = imageError 
    ? (placeholder || defaultPlaceholder) 
    : getOptimizedSrc(src, width, height);
  
  const srcSet = !imageError && isCloudinaryUrl(src) ? generateSrcSet(src) : undefined;
  
  // Merge default styles with passed styles
  const mergedStyles: React.CSSProperties = {
    objectFit,
    maxWidth: '100%', // Ensure it doesn't overflow container
    boxSizing: 'border-box', // Include padding and border in the element's dimensions
    display: 'block', // Prevent default inline behavior which can cause spacing issues
    ...style // Spread passed styles last to allow overriding
  };
  
  return (
    <img
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      srcSet={srcSet}
      sizes={sizes}
      className={className}
      loading={lazy ? 'lazy' : undefined}
      onError={() => setImageError(true)}
      onLoad={onLoad}
      style={mergedStyles}
    />
  );
};

export default ResponsiveImage;