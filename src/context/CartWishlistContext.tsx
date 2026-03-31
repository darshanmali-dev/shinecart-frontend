import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { cartService } from '@/services/cartService';
import { wishlistService } from '@/services/wishlistService';
import { useAuth } from './AuthContext';

interface CartWishlistContextType {
  cartCount: number;
  wishlistCount: number;
  refreshCounts: () => Promise<void>;
  incrementCartCount: () => void;
  decrementCartCount: () => void;
  incrementWishlistCount: () => void;
  decrementWishlistCount: () => void;
  setCartCount: (count: number) => void;
  setWishlistCount: (count: number) => void;
}

const CartWishlistContext = createContext<CartWishlistContextType | undefined>(undefined);

export const CartWishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const { isAuthenticated } = useAuth();

  // Fetch counts when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshCounts();
    } else {
      setCartCount(0);
      setWishlistCount(0);
    }
  }, [isAuthenticated]);

  const refreshCounts = async () => {
    try {
      // Fetch cart count
      const cartResponse = await cartService.getCartCount();
      if (cartResponse.success) {
        setCartCount(cartResponse.data);
      }

      // Fetch wishlist count
      const wishlistResponse = await wishlistService.getWishlist();
      if (wishlistResponse.success) {
        setWishlistCount(wishlistResponse.data.length);
      }
    } catch (error) {
      console.error('Failed to fetch counts:', error);
    }
  };

  const incrementCartCount = () => setCartCount(prev => prev + 1);
  const decrementCartCount = () => setCartCount(prev => Math.max(0, prev - 1));
  const incrementWishlistCount = () => setWishlistCount(prev => prev + 1);
  const decrementWishlistCount = () => setWishlistCount(prev => Math.max(0, prev - 1));

  const value: CartWishlistContextType = {
    cartCount,
    wishlistCount,
    refreshCounts,
    incrementCartCount,
    decrementCartCount,
    incrementWishlistCount,
    decrementWishlistCount,
    setCartCount,
    setWishlistCount,
  };

  return (
    <CartWishlistContext.Provider value={value}>
      {children}
    </CartWishlistContext.Provider>
  );
};

export const useCartWishlist = () => {
  const context = useContext(CartWishlistContext);
  if (context === undefined) {
    throw new Error('useCartWishlist must be used within a CartWishlistProvider');
  }
  return context;
};