import React from 'react';
import { cn } from '@/lib/utils';

interface ProductGridProps {
  children: React.ReactNode;
  className?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6',
        className
      )}
    >
      {children}
    </div>
  );
};

export default ProductGrid;
