import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/product/ProductCard';
import ProductGrid from '@/components/product/ProductGrid';
import { Skeleton } from '@/components/ui/skeleton';
import { useImagePreload } from '@/hooks/useImagePreload';

const FeaturedProducts: React.FC = () => {
  const { data: products = [], isLoading } = useProducts({ featured: true });
  const displayProducts = products.slice(0, 8);

  // Preload first 4 product images (above the fold)
  const criticalImages = displayProducts.slice(0, 4).map(product => 
    product.images?.[0] || ''
  ).filter(Boolean);
  
  useImagePreload(criticalImages, true);

  if (isLoading) {
    return (
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <Skeleton className="h-6 w-24 mb-3" />
              <Skeleton className="h-10 w-64 mb-2" />
              <Skeleton className="h-5 w-48" />
            </div>
          </div>
          <ProductGrid>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square rounded-2xl" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-32" />
              </div>
            ))}
          </ProductGrid>
        </div>
      </section>
    );
  }

  if (displayProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
              Featured
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">
              Handpicked for You
            </h2>
            <p className="text-muted-foreground">
              Discover our most popular products
            </p>
          </div>
          <Link
            to="/products?featured=true"
            className="hidden md:flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Products Grid */}
        <ProductGrid>
          {displayProducts.map((product, index) => (
            <div
              key={product.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </ProductGrid>

        {/* Mobile View All Link */}
        <div className="mt-8 text-center md:hidden">
          <Link
            to="/products?featured=true"
            className="inline-flex items-center gap-2 text-primary font-medium"
          >
            View All Products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
