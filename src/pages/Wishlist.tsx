import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { wishlistService } from '@/services/wishlistService';
import { cartService } from '@/services/cartService';
import type { WishlistItem } from '@/services/types';
import { useCartWishlist } from '@/context/CartWishlistContext';
import { 
  Star, 
  ShoppingCart, 
  X,
  HeartOff,
  Loader2
} from 'lucide-react';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCartId, setAddingToCartId] = useState<number | null>(null);
  const { decrementWishlistCount, setWishlistCount, incrementCartCount } = useCartWishlist();
  const BASE_URL = 'http://localhost:8080';

  // Fetch wishlist on mount
  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const response = await wishlistService.getWishlist();
      if (response.success) {
        setWishlistItems(response.data);
      } else {
        toast.error(response.message || 'Failed to load wishlist');
      }
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (id: number, name: string) => {
    try {
      const response = await wishlistService.removeFromWishlist(id);
      if (response.success) {
        setWishlistItems(items => items.filter(item => item.id !== id));
        toast.info(`${name} removed from wishlist`);
        decrementWishlistCount();
      } else {
        toast.error(response.message || 'Failed to remove from wishlist');
      }
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    }
  };

  const addToCart = async (item: WishlistItem) => {
    if (item.availability === 'Out of Stock') {
      toast.error('Item is out of stock');
      return;
    }

    setAddingToCartId(item.id);
    try {
      const response = await cartService.addToCart({
        productId: item.id,
        quantity: 1,
        size: undefined, // No size selection from wishlist
      });

      if (response.success) {
        toast.success(`${item.name} added to cart!`);
        incrementCartCount();
        // Optionally remove from wishlist after adding to cart
        // await removeFromWishlist(item.id, item.name);
      } else {
        toast.error(response.message || 'Failed to add to cart');
      }
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCartId(null);
    }
  };

  const addAllToCart = async () => {
    const availableItems = wishlistItems.filter(item => item.availability !== 'Out of Stock');
    
    if (availableItems.length === 0) {
      toast.error('No available items to add');
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const item of availableItems) {
      try {
        const response = await cartService.addToCart({
          productId: item.id,
          quantity: 1,
          size: undefined,
        });

        if (response.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        failCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} ${successCount === 1 ? 'item' : 'items'} added to cart!`);
    }
    if (failCount > 0) {
      toast.error(`Failed to add ${failCount} ${failCount === 1 ? 'item' : 'items'}`);
    }
  };

  const clearWishlist = async () => {
    try {
      const response = await wishlistService.clearWishlist();
      if (response.success) {
        setWishlistItems([]);
        toast.info('Wishlist cleared');
        setWishlistCount(0);
      } else {
        toast.error('Failed to clear wishlist');
      }
    } catch (error) {
      toast.error('Failed to clear wishlist');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <HeartOff className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
          <h1 className="font-luxury text-3xl font-bold mb-4">Your Wishlist is Empty</h1>
          <p className="text-muted-foreground mb-8">
            Save items you love to your wishlist and keep track of them easily.
          </p>
          <EnhancedButton variant="luxury" size="lg" asChild>
            <Link to="/products">
              Explore jewellery
            </Link>
          </EnhancedButton>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-luxury text-4xl font-bold mb-2">My Wishlist</h1>
          <p className="text-muted-foreground">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>
        <EnhancedButton variant="ghost" onClick={clearWishlist}>
          Clear Wishlist
        </EnhancedButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistItems.map((item) => (
          <Card key={item.id} className="card-product group relative">
            {/* Remove Button */}
            <EnhancedButton
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 z-10 bg-background/80 backdrop-blur-sm text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeFromWishlist(item.id, item.name)}
            >
              <X className="h-4 w-4" />
            </EnhancedButton>

            {/* Product Image */}
            <div className="aspect-square overflow-hidden relative">
              <img 
                src={item.image ? BASE_URL + item.image : '/api/placeholder/300/300'} 
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.currentTarget.src = '/api/placeholder/300/300';
                }}
              />
              <div className="absolute top-3 left-3">
                <Badge 
                  variant={
                    item.availability === 'In Stock' 
                      ? 'secondary' 
                      : item.availability === 'Limited Stock'
                        ? 'destructive'
                        : 'outline'
                  }
                  className={
                    item.availability === 'In Stock' 
                      ? 'bg-success/10 text-success' 
                      : ''
                  }
                >
                  {item.availability}
                </Badge>
              </div>
              
              {/* Quick Add to Cart - Shows on hover */}
              {item.availability !== 'Out of Stock' && (
                <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <EnhancedButton 
                    variant="luxury" 
                    size="sm" 
                    className="w-full"
                    onClick={() => addToCart(item)}
                    disabled={addingToCartId === item.id}
                  >
                    {addingToCartId === item.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </>
                    )}
                  </EnhancedButton>
                </div>
              )}
            </div>

            {/* Product Details */}
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Category */}
                <Badge variant="outline" className="text-xs">
                  {item.category}
                </Badge>
                
                {/* Product Name */}
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
                  {item.name}
                </h3>

                {/* Rating */}
                {/* <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-primary fill-current" />
                    <span className="ml-1 text-sm font-medium">{item.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({item.reviews})
                  </span>
                </div> */}

                {/* Price */}
                <div className="flex items-baseline space-x-2">
                  <span className="text-xl font-bold text-primary">
                    ₹{item.price.toLocaleString()}
                  </span>
                  {item.originalPrice > item.price && (
                    <span className="text-sm text-muted-foreground line-through">
                      ₹{item.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  {item.availability === 'Out of Stock' ? (
                    <EnhancedButton variant="outline" size="sm" className="flex-1" disabled>
                      Out of Stock
                    </EnhancedButton>
                  ) : (
                    <EnhancedButton 
                      size="sm" 
                      className="flex-1"
                      onClick={() => addToCart(item)}
                      disabled={addingToCartId === item.id}
                    >
                      {addingToCartId === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Add to Cart'
                      )}
                    </EnhancedButton>
                  )}
                  
                  <EnhancedButton variant="outline" size="sm" asChild>
                    <Link to={`/product/${item.id}`}>
                      View
                    </Link>
                  </EnhancedButton>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12 p-6 bg-gradient-subtle rounded-luxury">
        <div>
          <h3 className="font-luxury text-xl font-semibold mb-1">Love Your Selections?</h3>
          <p className="text-muted-foreground">Add all available items to your cart</p>
        </div>
        <div className="flex space-x-4">
          <EnhancedButton variant="outline" asChild>
            <Link to="/products">
              Continue Shopping
            </Link>
          </EnhancedButton>
          <EnhancedButton variant="luxury" onClick={addAllToCart}>
            Add All to Cart
          </EnhancedButton>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;