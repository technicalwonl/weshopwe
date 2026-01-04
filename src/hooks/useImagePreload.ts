import { useEffect, useState } from 'react';

export const useImagePreload = (imageUrls: string[], priority: boolean = false) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!imageUrls.length) return;

    const preloadImage = (url: string) => {
      if (loadedImages.has(url) || loadingImages.has(url)) return;

      setLoadingImages(prev => new Set(prev).add(url));

      const img = new Image();
      
      img.onload = () => {
        setLoadedImages(prev => new Set(prev).add(url));
        setLoadingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(url);
          return newSet;
        });
      };

      img.onerror = () => {
        setLoadingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(url);
          return newSet;
        });
      };

      // Set priority for critical images
      if (priority) {
        img.fetchPriority = 'high';
      }

      img.src = url;
    };

    if (priority) {
      // Preload critical images immediately
      imageUrls.forEach(preloadImage);
    } else {
      // Use requestIdleCallback for non-critical images
      const preloadWhenIdle = () => {
        imageUrls.forEach(preloadImage);
      };

      if ('requestIdleCallback' in window) {
        requestIdleCallback(preloadWhenIdle);
      } else {
        setTimeout(preloadWhenIdle, 100);
      }
    }
  }, [imageUrls, loadedImages, loadingImages, priority]);

  return { loadedImages, loadingImages };
};
