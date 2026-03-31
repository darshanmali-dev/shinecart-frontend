import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cartService } from '@/services/cartService';
import { wishlistService } from '@/services/wishlistService';
import type { CartItem } from '@/services/types';
import { useCartWishlist } from '@/context/CartWishlistContext';
import { 
  Trash2, 
  Plus, 
  Minus, 
  Heart, 
  ShoppingBag,
  CreditCard,
  Truck,
  Shield,
  Tag,
  Loader2
} from 'lucide-react';

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState('');
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);
  const { decrementCartCount, setCartCount, incrementWishlistCount } = useCartWishlist();
  const BASE_URL = 'http://localhost:8080';

  // Fetch cart items on mount
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await cartService.getCart();
      if (response.success) {
        setCartItems(response.data);
      } else {
        toast.error(response.message || 'Failed to load cart');
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }

    setUpdatingItemId(productId);
    try {
      const response = await cartService.updateQuantity(productId, newQuantity);
      if (response.success) {
        // Update local state
        setCartItems(items =>
          items.map(item =>
            item.id === productId ? { ...item, quantity: newQuantity } : item
          )
          
        );
        setCartCount(newQuantity);
      } else {
        toast.error(response.message || 'Failed to update quantity');
      }
    } catch (error) {
      toast.error('Failed to update quantity');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const removeItem = async (productId: number) => {
    try {
      const response = await cartService.removeFromCart(productId);
      if (response.success) {
  const removedItem = cartItems.find(item => item.id === productId);
  setCartItems(items => items.filter(item => item.id !== productId));
  toast.success('Item removed from cart');
  if (removedItem) {
    const currentCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(currentCount - removedItem.quantity);
  }
}
    else {
        toast.error(response.message || 'Failed to remove item');
      }
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const moveToWishlist = async (productId: number) => {
    try {
      // Add to wishlist
      const wishlistResponse = await wishlistService.addToWishlist(productId);
      if (wishlistResponse.success) {
        // Remove from cart
        const cartResponse = await cartService.removeFromCart(productId);
        const removedItem = cartItems.find(item => item.id === productId);
        setCartItems(items => items.filter(item => item.id !== productId));
        toast.success('Item moved to wishlist');
        if (removedItem) {
          const currentCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
          setCartCount(currentCount - removedItem.quantity);
        }
      } else {
        toast.error(wishlistResponse.message || 'Failed to move to wishlist');
      }
    } catch (error) {
      toast.error('Failed to move to wishlist');
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    try {
      const response = await cartService.applyPromoCode(promoCode);
      if (response.success) {
        toast.success(`Promo code applied! ${response.data.discount}% discount`);
      } else {
        toast.error(response.message || 'Invalid promo code');
      }
    } catch (error) {
      toast.error('Failed to apply promo code');
    }
  };

  const handleCheckout = () => {
    toast.success('Proceeding to checkout...');
    navigate('/checkout');
    // TODO: Navigate to checkout page when implemented
    // navigate('/checkout');
  };

  const handleClearCart = async () => {
    try {
      const response = await cartService.clearCart();
      if (response.success) {
        setCartItems([]);
        toast.info('Cart cleared');
        setCartCount(0);
      } else {
        toast.error('Failed to clear cart');
      }
    } catch (error) {
      toast.error('Failed to clear cart');
    }
  };

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const originalTotal = cartItems.reduce((sum, item) => sum + (item.originalPrice * item.quantity), 0);
  const savings = originalTotal - subtotal;
  const shipping = subtotal > 50000 ? 0 : 500;
  // const tax = Math.round(subtotal * 0.03); // 3% tax
  const total = subtotal + shipping;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
          <h1 className="font-luxury text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8">
            Discover our beautiful jewellery collections and add items to your cart.
          </p>
          <EnhancedButton variant="luxury" size="lg" asChild>
            <Link to="/products">
              Continue Shopping
            </Link>
          </EnhancedButton>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-luxury text-4xl font-bold mb-2">Shopping Cart</h1>
        <p className="text-muted-foreground">
          {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {cartItems.map((item) => (
            <Card key={item.id} className="card-elevated">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <img 
                      src={item.image ? BASE_URL + item.image : '/api/placeholder/150/150'} 
                      alt={item.name}
                      className="w-32 h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = '/api/placeholder/150/150';
                      }}
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{item.name}</h3>
                          <div className="flex items-center space-x-4 mt-1">
                            <Badge variant="outline">{item.category}</Badge>
                            {item.size && (
                              <span className="text-sm text-muted-foreground">Size: {item.size}</span>
                            )}
                          </div>
                        </div>
                        <Badge 
                          variant={item.availability === 'In Stock' ? 'secondary' : 'destructive'}
                          className={item.availability === 'In Stock' ? 'bg-success/10 text-success' : ''}
                        >
                          {item.availability}
                        </Badge>
                      </div>

                      <div className="flex items-baseline space-x-2 mt-2">
                        <span className="text-xl font-bold text-primary">
                          ₹{item.price.toLocaleString()}
                        </span>
                        {item.originalPrice > item.price && (
                          <span className="text-sm text-muted-foreground line-through">
                            ₹{item.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity and Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center border rounded-lg">
                          <EnhancedButton
                            variant="ghost"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-8 w-8"
                            disabled={updatingItemId === item.id}
                          >
                            <Minus className="h-3 w-3" />
                          </EnhancedButton>
                          <span className="px-3 py-1 font-semibold">
                            {updatingItemId === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              item.quantity
                            )}
                          </span>
                          <EnhancedButton
                            variant="ghost"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8"
                            disabled={updatingItemId === item.id}
                          >
                            <Plus className="h-3 w-3" />
                          </EnhancedButton>
                        </div>

                        <span className="text-sm text-muted-foreground">
                          Total: ₹{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>

                      {/* Item Actions */}
                      <div className="flex items-center space-x-2">
                        <EnhancedButton
                          variant="ghost"
                          size="sm"
                          onClick={() => moveToWishlist(item.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Heart className="h-4 w-4 mr-1" />
                          Wishlist
                        </EnhancedButton>
                        <EnhancedButton
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </EnhancedButton>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Continue Shopping */}
          <div className="flex justify-between items-center pt-6">
            <EnhancedButton variant="outline" asChild>
              <Link to="/products">
                ← Continue Shopping
              </Link>
            </EnhancedButton>
            <EnhancedButton variant="ghost" onClick={handleClearCart}>
              Clear Cart
            </EnhancedButton>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
         

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal ({totalItems} items)</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              
              {savings > 0 && (
                <div className="flex justify-between text-success">
                  <span>Savings</span>
                  <span>-₹{savings.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-success' : ''}>
                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                </span>
              </div>


              {shipping === 0 && (
                <div className="flex items-center text-sm text-success bg-success/10 p-3 rounded-lg">
                  <Truck className="h-4 w-4 mr-2" />
                  Free shipping on orders over ₹50,000
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">₹{total.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <EnhancedButton variant="luxury" size="lg" className="w-full" onClick={handleCheckout}>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Proceed to Checkout
                </EnhancedButton>
                
                <div className="grid grid-cols-2 gap-3 text-center text-sm">
                  <div className="flex flex-col items-center space-y-1">
                    <Shield className="h-5 w-5 text-primary" />
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex flex-col items-center space-y-1">
                    <Truck className="h-5 w-5 text-primary" />
                    <span>Fast Delivery</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">We Accept</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 border rounded-lg">
                  <span className="text-sm font-medium">UPI</span>
                </div>
                <div className="p-3 border rounded-lg">
                  <span className="text-sm font-medium">Cards</span>
                </div>
                <div className="p-3 border rounded-lg">
                  <span className="text-sm font-medium">Net Banking</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;