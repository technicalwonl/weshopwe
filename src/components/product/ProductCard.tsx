import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import WishlistButton from './WishlistButton';
import { getResponsiveImage, getSrcSet, getSizes } from '@/utils/imageUtils';

interface ProductCardProps {
  product: Product;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  const { addToCart } = useCart();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  // Check if this is an embroidery product
  const isEmbroideryProduct = product.category.toLowerCase().includes('embroidery') || 
                             product.name.toLowerCase().includes('embroidery');

  // Handle both static and Supabase data structures
  const images = product.images || [];
  const originalImage = images[0] || '/placeholder.svg';
  
  // Use responsive image utilities
  const optimizedImage = getResponsiveImage(originalImage, 'card');
  const placeholderImage = originalImage.includes('unsplash.com')
    ? originalImage.replace(/w=\d+/, 'w=50&blur=10&q=20')
    : '/placeholder.svg';

  const rating = product.rating || 4.5;
  const reviews = product.reviews || 0;
  const originalPrice = product.original_price || product.originalPrice;

  return (
    <Link to={`/product/${product.id}`} className={cn('group block', className)}>
      <article className="bg-card rounded-2xl overflow-hidden shadow-card card-float border border-border/50">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {/* Low-quality placeholder */}
          {!imageLoaded && !imageError && (
            <img
              src={placeholderImage}
              alt={product.name}
              className="w-full h-full object-cover scale-110 blur-sm"
            />
          )}
          
          {/* Main image */}
          <img
            src={optimizedImage}
            alt={product.name}
            className={cn(
              "w-full h-full object-cover transition-all duration-500 group-hover:scale-110",
              imageLoaded ? "opacity-100" : "opacity-0 absolute inset-0"
            )}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
          
          {/* Fallback for error */}
          {imageError && (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <div className="text-center p-4">
                <div className="text-4xl mb-2">📦</div>
                <p className="text-sm text-muted-foreground">Image not available</p>
              </div>
            </div>
          )}
          
          {/* Discount Badge */}
          {product.discount && (
            <span className="absolute top-2 left-2 discount-badge text-primary-foreground text-xs font-bold px-2 py-1 rounded-full sm:top-3 sm:left-3 sm:px-3 sm:py-1.5">
              -{product.discount}%
            </span>
          )}

          {/* Wishlist Button */}
          <WishlistButton productId={product.id} />

          {/* Quick Add - Desktop: hover, Mobile: always visible - Hide for embroidery */}
          {!isEmbroideryProduct && (
            <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 bg-gradient-to-t from-foreground/60 to-transparent sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 backdrop-blur-sm text-xs sm:text-sm"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Add to Cart</span>
                <span className="xs:hidden">Add</span>
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4">
          {/* Category */}
          <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            {product.category}
          </p>

          {/* Title */}
          <h3 className="font-medium text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors text-sm sm:text-base">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 sm:gap-1.5 mb-2 sm:mb-3">
            <div className="flex items-center gap-0.5">
              <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs sm:text-sm font-medium">{rating}</span>
            </div>
            <span className="text-[10px] sm:text-xs text-muted-foreground">
              ({reviews.toLocaleString()} reviews)
            </span>
          </div>

          {/* Price - Hide for embroidery products */}
          {!isEmbroideryProduct ? (
            <div className="flex items-baseline gap-2">
              <span className="text-base sm:text-lg font-bold gradient-text">
                ₹{product.price.toLocaleString()}
              </span>
              {originalPrice && originalPrice > product.price && (
                <span className="text-xs sm:text-sm text-muted-foreground line-through">
                  ₹{originalPrice.toLocaleString()}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold text-purple-600">
                Custom Embroidery
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground">
                Price to be quoted
              </span>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
};

export default ProductCard;
