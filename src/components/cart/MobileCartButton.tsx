import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const MobileCartButton: React.FC = () => {
  const { totalItems, totalPrice } = useCart();

  if (totalItems === 0) return null;

  return (
    <Link
      to="/cart"
      className="fixed bottom-4 left-4 right-4 md:hidden z-50 gradient-primary text-primary-foreground rounded-2xl shadow-glow p-4 flex items-center justify-between animate-fade-in"
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <ShoppingCart className="h-6 w-6" />
          <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-background text-foreground text-xs font-bold flex items-center justify-center">
            {totalItems}
          </span>
        </div>
        <span className="font-medium">{totalItems} item{totalItems > 1 ? 's' : ''}</span>
      </div>
      <span className="font-bold text-lg">₹{totalPrice.toLocaleString()}</span>
    </Link>
  );
};

export default MobileCartButton;
