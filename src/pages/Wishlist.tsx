import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useWishlistWithProducts, useRemoveFromWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/context/CartContext';
import { Skeleton } from '@/components/ui/skeleton';

const Wishlist: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { data: wishlistItems = [], isLoading } = useWishlistWithProducts();
  const removeFromWishlist = useRemoveFromWishlist();
  const { addToCart } = useCart();

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <Heart className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
          <h1 className="font-heading text-3xl font-bold mb-4">Please Login</h1>
          <p className="text-muted-foreground mb-8">Login to view your wishlist</p>
          <Link to="/login">
            <Button variant="gradient" size="lg">Login</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      images: product.images,
      category: product.category,
      rating: product.rating,
      reviews: product.reviews,
      description: product.description,
      stock: product.stock,
    });
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex items-center gap-4 mb-8">
          <Heart className="h-8 w-8 text-primary" />
          <h1 className="font-heading text-3xl font-bold">My Wishlist</h1>
          {wishlistItems.length > 0 && (
            <span className="text-muted-foreground">({wishlistItems.length} items)</span>
          )}
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl overflow-hidden">
                <Skeleton className="aspect-square" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="bg-card rounded-2xl p-12 text-center shadow-card">
            <Heart className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
            <h2 className="font-heading text-2xl font-bold mb-4">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-8">
              Save items you love to your wishlist and find them here anytime
            </p>
            <Link to="/products">
              <Button variant="gradient" size="lg">Explore Products</Button>
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlistItems.map((item: any) => {
              const product = item.products;
              if (!product) return null;
              
              return (
                <div 
                  key={item.id} 
                  className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all"
                >
                  <Link to={`/product/${product.id}`} className="block">
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={product.images?.[0] || '/placeholder.svg'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {product.discount > 0 && (
                        <span className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full">
                          -{product.discount}%
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold">₹{product.price.toLocaleString()}</span>
                        {product.original_price > product.price && (
                          <span className="text-sm text-muted-foreground line-through">
                            ₹{product.original_price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                  <div className="px-4 pb-4 flex gap-2">
                    <Button
                      variant="gradient"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeFromWishlist.mutate(product.id)}
                      disabled={removeFromWishlist.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Wishlist;
