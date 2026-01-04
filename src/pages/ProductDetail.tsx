import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, Minus, Plus, ShoppingCart, Heart, Truck, Shield, RotateCcw, Package, Palette } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useProduct, useProducts } from '@/hooks/useProducts';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/product/ProductCard';
import ProductGrid from '@/components/product/ProductGrid';
import { Skeleton } from '@/components/ui/skeleton';
import CustomizationSection from '@/components/product/CustomizationSection';
import { useCreateCustomizationOrder } from '@/hooks/useOrders';
import { cn } from '@/lib/utils';
import { getResponsiveImage, getSrcSet, getSizes } from '@/utils/imageUtils';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showCustomization, setShowCustomization] = useState(false);
  const [mainImageLoaded, setMainImageLoaded] = useState(false);
  const [thumbnailLoaded, setThumbnailLoaded] = useState<{ [key: number]: boolean }>({});
  const [imageError, setImageError] = useState(false);

  const { data: product, isLoading } = useProduct(id || '');
  const { data: allProducts = [] } = useProducts();
  const createCustomizationOrder = useCreateCustomizationOrder();

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <Skeleton className="aspect-square rounded-3xl" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-12 w-48" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="font-heading text-3xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/products')}>Browse Products</Button>
        </div>
      </Layout>
    );
  }

  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const images = product.images || [];
  const currentImage = images[selectedImage] || '/placeholder.svg';
  
  // Use responsive image utilities
  const getOptimizedImage = (imageUrl: string, type: 'gallery' | 'thumbnail' = 'gallery') => {
    return getResponsiveImage(imageUrl, type);
  };
  
  const price = product.price;
  const originalPrice = product.original_price;
  const rating = product.rating || 4.5;
  const reviews = product.reviews || 0;
  const stock = product.stock || 0;

  const handleAddToCart = () => {
    addToCart(product as any, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product as any, quantity);
    navigate('/checkout');
  };

  const handleCustomizationSubmit = (customization: {
    image: string | null;
    text: string;
    userContact: {
      name: string;
      email: string;
      phone: string;
      address: string;
      street: string;
      pincode: string;
    };
  }) => {
    createCustomizationOrder.mutateAsync({
      productId: id || '',
      productName: product.name,
      ...customization
    }).then(() => {
      setShowCustomization(false);
    });
  };

  // Check if this is an embroidery product
  const isEmbroideryProduct = product.category.toLowerCase().includes('embroidery') || 
                             product.name.toLowerCase().includes('embroidery');

  // Debug logging
  console.log('Product details:', {
    name: product.name,
    category: product.category,
    isEmbroideryProduct
  });

  return (
    <Layout>
      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8 flex-wrap">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-foreground transition-colors">Products</Link>
          <span>/</span>
          <Link 
            to={`/products?category=${product.category.toLowerCase().replace(/\s+/g, '-')}`}
            className="hover:text-foreground transition-colors"
          >
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-foreground line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-muted shadow-card">
              {/* Loading skeleton */}
              {!mainImageLoaded && !imageError && (
                <div className="absolute inset-0 bg-muted animate-pulse" />
              )}
              
              {/* Main image */}
              <img
                src={getOptimizedImage(currentImage, 'gallery')}
                alt={product.name}
                className={cn(
                  "w-full h-full object-cover transition-opacity duration-300",
                  mainImageLoaded ? "opacity-100" : "opacity-0"
                )}
                onLoad={() => setMainImageLoaded(true)}
                onError={() => setImageError(true)}
              />
              
              {/* Error fallback */}
              {imageError && (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📦</div>
                    <p className="text-muted-foreground">Image not available</p>
                  </div>
                </div>
              )}
              
              {product.discount && (
                <span className="absolute top-4 left-4 discount-badge text-primary-foreground text-sm font-bold px-4 py-2 rounded-full">
                  -{product.discount}% OFF
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedImage(index);
                      setMainImageLoaded(false);
                      setImageError(false);
                    }}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-primary shadow-glow'
                        : 'border-transparent hover:border-border'
                    }`}
                  >
                    {/* Thumbnail loading skeleton */}
                    {!thumbnailLoaded[index] && (
                      <div className="w-full h-full bg-muted animate-pulse" />
                    )}
                    
                    <img
                      src={getOptimizedImage(image, 'thumbnail')}
                      alt={`${product.name} ${index + 1}`}
                      className={cn(
                        "w-full h-full object-cover transition-opacity duration-200",
                        thumbnailLoaded[index] ? "opacity-100" : "opacity-0 absolute inset-0"
                      )}
                      onLoad={() => setThumbnailLoaded(prev => ({ ...prev, [index]: true }))}
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="animate-fade-in">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              {product.category}
            </span>

            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-muted text-muted'
                    }`}
                  />
                ))}
              </div>
              <span className="font-medium">{rating}</span>
              <span className="text-muted-foreground">
                ({reviews.toLocaleString()} reviews)
              </span>
            </div>

            {/* Price Display - Hide for embroidery products */}
            {!isEmbroideryProduct && (
              <div className="mb-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-primary">
                    ₹{price.toLocaleString()}
                  </span>
                  {originalPrice && originalPrice > price && (
                    <>
                      <span className="text-xl text-muted-foreground line-through">
                        ₹{originalPrice.toLocaleString()}
                      </span>
                      <span className="px-2 py-1 rounded-md bg-green-100 text-green-700 text-sm font-medium">
                        Save ₹{(originalPrice - price).toLocaleString()}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            {isEmbroideryProduct && (
              <div className="mb-6">
                <p className="text-lg text-purple-600 font-medium">
                  <Palette className="h-5 w-5 inline mr-2" />
                  Custom Embroidery Available
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Price will be quoted after reviewing your customization requirements
                </p>
              </div>
            )}

            {/* Stock Status - Hide for embroidery products */}
            {!isEmbroideryProduct && (
              <div className="mb-6">
                {stock > 0 ? (
                  <span className="text-green-600 font-medium">
                    ✓ In Stock ({stock} available)
                  </span>
                ) : (
                  <span className="text-destructive font-medium">Out of Stock</span>
                )}
              </div>
            )}

            {/* Description */}
            {product.description && (
              <p className="text-muted-foreground leading-relaxed mb-8">
                {product.description}
              </p>
            )}

            {/* Quantity Selector - Hide for embroidery products */}
            {!isEmbroideryProduct && (
              <div className="flex items-center gap-4 mb-8">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center gap-2 border border-border rounded-xl p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                    disabled={quantity >= stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              {isEmbroideryProduct ? (
                <Button
                  variant="gradient"
                  size="xl"
                  className="flex-1"
                  onClick={() => setShowCustomization(true)}
                >
                  <Palette className="h-5 w-5 mr-2" />
                  Customize & Order
                </Button>
              ) : (
                <>
                  <Button
                    variant="gradient"
                    size="xl"
                    className="flex-1"
                    onClick={handleAddToCart}
                    disabled={stock === 0}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline-primary"
                    size="xl"
                    className="flex-1"
                    onClick={handleBuyNow}
                    disabled={stock === 0}
                  >
                    Buy Now
                  </Button>
                </>
              )}
              <Button variant="outline" size="xl">
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-2xl">
              <div className="flex flex-col items-center text-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                <span className="text-xs text-muted-foreground">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-xs text-muted-foreground">Secure Payment</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <RotateCcw className="h-5 w-5 text-primary" />
                <span className="text-xs text-muted-foreground">7-Day Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <h2 className="font-heading text-2xl md:text-3xl font-bold mb-8">
              You May Also Like
            </h2>
            <ProductGrid>
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ProductGrid>
          </section>
        )}

        {/* Customization Modal */}
        {showCustomization && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-heading text-2xl font-bold">Customize Your Order</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCustomization(false)}
                  >
                    ×
                  </Button>
                </div>
                
                <CustomizationSection
                  onSubmitCustomization={handleCustomizationSubmit}
                  isLoading={createCustomizationOrder.isPending}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetail;
