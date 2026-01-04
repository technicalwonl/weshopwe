export const getResponsiveImage = (
  imageUrl: string, 
  type: 'card' | 'thumbnail' | 'gallery' | 'hero' = 'card'
): string => {
  if (!imageUrl || !imageUrl.includes('unsplash.com')) {
    return imageUrl;
  }

  const sizeMap = {
    card: 300,      // Product cards
    thumbnail: 80,  // Thumbnail images
    gallery: 800,   // Product detail gallery
    hero: 1200      // Hero section images
  };

  const size = sizeMap[type];
  return imageUrl.replace(/w=\d+/, `w=${size}`);
};

export const getSrcSet = (imageUrl: string, type: 'card' | 'thumbnail' | 'gallery' | 'hero' = 'card'): string => {
  if (!imageUrl || !imageUrl.includes('unsplash.com')) {
    return imageUrl;
  }

  const sizes = {
    card: [200, 300, 400],
    thumbnail: [60, 80, 100],
    gallery: [600, 800, 1200],
    hero: [800, 1200, 1600]
  };

  const breakpoints = sizes[type];
  
  return breakpoints
    .map(size => {
      const optimizedUrl = imageUrl.replace(/w=\d+/, `w=${size}`);
      return `${optimizedUrl} ${size}w`;
    })
    .join(', ');
};

export const getSizes = (type: 'card' | 'thumbnail' | 'gallery' | 'hero' = 'card'): string => {
  const sizeMap = {
    card: '(max-width: 640px) 200px, (max-width: 768px) 300px, 400px',
    thumbnail: '80px',
    gallery: '(max-width: 640px) 600px, (max-width: 1024px) 800px, 1200px',
    hero: '(max-width: 640px) 800px, (max-width: 1024px) 1200px, 1600px'
  };

  return sizeMap[type];
};
