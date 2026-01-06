import React from 'react';

interface BrandLogoProps {
  size?: 'small' | 'medium' | 'large';
  showTagline?: boolean;
  variant?: 'light' | 'dark';
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
  size = 'medium', 
  showTagline = true,
  variant = 'light',
  className = ''
}) => {
  const sizes = {
    small: {
      icon: 'h-9 w-9',
      text: 'text-sm md:text-base',
      tagline: 'text-[9px] md:text-[10px]',
      gap: 'gap-2.5'
    },
    medium: {
      icon: 'h-11 w-11',
      text: 'text-base md:text-lg lg:text-xl',
      tagline: 'text-[10px] md:text-xs',
      gap: 'gap-3'
    },
    large: {
      icon: 'h-14 w-14',
      text: 'text-lg md:text-xl lg:text-2xl',
      tagline: 'text-xs md:text-sm',
      gap: 'gap-4'
    }
  };

  const currentSize = sizes[size];
  const textColor = variant === 'dark' ? 'text-gray-900 dark:text-white' : 'text-white';
  const taglineColor = variant === 'dark' ? 'text-gray-600 dark:text-gray-400' : 'text-white/90';
  // Icon color: black on light mode, white on dark mode
  const iconColor = variant === 'dark' ? '#000000' : '#FFFFFF';

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Brand Text - Lowercase with TLD */}
      <span 
        className={`${currentSize.text} font-bold ${textColor} tracking-tight leading-none`}
        style={{ fontFamily: "'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
      >
        citricloud.com
      </span>
      
      {/* Tagline */}
      {showTagline && (
        <span 
          className={`${currentSize.tagline} ${taglineColor} font-medium tracking-wide mt-1`}
          style={{ fontFamily: "'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
        >
          Modern Cloud Hosting Platform
        </span>
      )}
    </div>
  );
};

export default BrandLogo;
