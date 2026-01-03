/**
 * Shared image URL resolution utility
 * Ensures consistent image handling across dashboard and public pages
 */

// Cache-busting version for images
let cacheVersion: string | null = null;

export const getCacheVersion = (): string => {
  if (!cacheVersion) {
    cacheVersion = Date.now().toString();
  }
  return cacheVersion;
};

/**
 * Resolve image URLs to use canonical main site for uploads
 * Ensures images display consistently across all pages
 */
export const getImageUrl = (url: string | null | undefined): string => {
  if (!url) return '';

  // If it's already a full URL, return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // For relative paths, always use main site domain
  if (url.startsWith('/')) {
    return `https://citricloud.com${url}?v=${getCacheVersion()}`;
  }

  return url;
};

/**
 * Get fallback placeholder image
 */
export const getFallbackImage = (): string => '/default-monochrome.svg';

/**
 * Handle image load error with fallback
 */
export const handleImageError = (
  event: React.SyntheticEvent<HTMLImageElement>,
  className?: string
): void => {
  const img = event.target as HTMLImageElement;
  img.src = getFallbackImage();
  if (className) {
    img.className = className;
  } else {
    // Default styling for fallback
    img.className = 'w-full h-full object-contain p-4 bg-white';
  }
};
