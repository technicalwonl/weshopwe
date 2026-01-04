import React from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useWishlist, useAddToWishlist, useRemoveFromWishlist } from '@/hooks/useWishlist';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface WishlistButtonProps {
  productId: string;
  variant?: 'icon' | 'button';
  className?: string;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ 
  productId, 
  variant = 'icon',
  className 
}) => {
  const { isAuthenticated } = useAuth();
  const { data: wishlist = [] } = useWishlist();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const navigate = useNavigate();

  const isInWishlist = wishlist.some((item) => item.product_id === productId);
  const isLoading = addToWishlist.isPending || removeFromWishlist.isPending;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist');
      navigate('/login');
      return;
    }

    if (isInWishlist) {
      removeFromWishlist.mutate(productId);
    } else {
      addToWishlist.mutate(productId);
    }
  };

  if (variant === 'button') {
    return (
      <Button
        variant="outline"
        size="lg"
        onClick={handleClick}
        disabled={isLoading}
        className={cn('gap-2', className)}
      >
        <Heart className={cn('h-5 w-5', isInWishlist && 'fill-red-500 text-red-500')} />
        {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        'absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background',
        className
      )}
    >
      <Heart 
        className={cn(
          'h-5 w-5 transition-colors',
          isInWishlist ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
        )} 
      />
    </Button>
  );
};

export default WishlistButton;
