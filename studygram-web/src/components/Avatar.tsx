import React, { useState } from 'react';

interface AvatarProps {
  src?: string;
  name: string;
  className?: string;
  alt?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, name, className = '', alt = 'Avatar' }) => {
  const defaultFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=6366f1&color=fff`;
  const [imageSrc, setImageSrc] = useState<string>(src || defaultFallback);

  const handleError = () => {
    // If the image fails to load, gracefully fallback to the UI Avatars initials
    if (imageSrc !== defaultFallback) {
      setImageSrc(defaultFallback);
    }
  };

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={`object-cover rounded-full ${className}`}
      onError={handleError}
    />
  );
};
