import React, { useState, useEffect } from 'react';

interface ProductImageProps {
  src?: string; // Base64 data from DB
  imagePath?: string; // Path to public/products
  alt: string;
  className?: string;
  fallbackSlug?: string;
}

const ProductImage: React.FC<ProductImageProps> = ({ 
  src, 
  imagePath, 
  alt, 
  className = "", 
  fallbackSlug 
}) => {
  // Priority: 
  // 1. imagePath (Actual saved file)
  // 2. src (Base64 fallback from DB)
  // 3. /products/{slug}.png (Default conventional path)
  
  const getInitialSrc = () => {
    if (imagePath) return imagePath;
    if (src) return src;
    if (fallbackSlug) return `/products/${fallbackSlug}.png`;
    return '/logo.png'; // Ultimate fallback
  };

  const [currentSrc, setCurrentSrc] = useState<string>(getInitialSrc());
  const [triedFilePath, setTriedFilePath] = useState(!!imagePath);
  const [triedBase64, setTriedBase64] = useState(false);

  useEffect(() => {
    setCurrentSrc(getInitialSrc());
    setTriedFilePath(!!imagePath);
    setTriedBase64(false);
  }, [src, imagePath, fallbackSlug]);

  const handleError = () => {
    // If imagePath failed, try Base64
    if (currentSrc === imagePath && src) {
      setCurrentSrc(src);
      setTriedBase64(true);
      return;
    }

    // If Base64 failed or wasn't there, try conventional path
    if (fallbackSlug && !currentSrc.includes(`${fallbackSlug}.png`)) {
      setCurrentSrc(`/products/${fallbackSlug}.png`);
      return;
    }

    // If everything failed
    if (currentSrc !== '/logo.png') {
      setCurrentSrc('/logo.png');
    }
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
};

export default ProductImage;
