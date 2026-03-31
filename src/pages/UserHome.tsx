import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { orderService } from '@/services/orderService';
import { cartService } from '@/services/cartService';
import { wishlistService } from '@/services/wishlistService';
import { productService } from '@/services/productService';
import { 
  Crown, 
  ShoppingBag, 
  Heart, 
  Package, 
  ArrowRight,
  Loader2
} from 'lucide-react';

const UserHome = () => {
  const { user } = useAuth();
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({
    orders: 0,
    wishlist: 0,
    cart: 0,
    products: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load orders
      const ordersResponse = await orderService.getMyOrders();
      if (ordersResponse && ordersResponse.length > 0) {
        setRecentOrders(ordersResponse.slice(0, 3)); // Get latest 3 orders
        setStats(prev => ({ ...prev, orders: ordersResponse.length }));
      }

      // Load product count
      const productsResponse = await productService.getProducts();
      if (productsResponse.success) {
        setStats(prev => ({ ...prev, products: productsResponse.data.length || 0 }));
      }

      // Load cart count
      const cartResponse = await cartService.getCartCount();
      if (cartResponse.success) {
        setStats(prev => ({ ...prev, cart: cartResponse.data || 0 }));
      }

      // Load wishlist count
      const wishlistResponse = await wishlistService.getWishlist();
      if (wishlistResponse.success) {
        setStats(prev => ({ ...prev, wishlist: wishlistResponse.data?.length || 0 }));
      }

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'In Transit':
      case 'Shipped':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Order Placed':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return '';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-10">
        <h1 className="font-luxury text-4xl font-bold mb-2">
          Welcome back, {user?.name || 'Guest'}!
        </h1>
        <p className="text-muted-foreground text-lg">
          Your personalized jewellery dashboard
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          { icon: ShoppingBag, label: 'My Orders', href: '/my-orders', count: loading ? '...' : stats.orders.toString() },
          { icon: Heart, label: 'Wishlist', href: '/wishlist', count: loading ? '...' : stats.wishlist.toString() },
          { icon: Package, label: 'Cart', href: '/cart', count: loading ? '...' : stats.cart.toString() },
          { icon: Crown, label: 'Browse', href: '/products', count: stats.products },
        ].map((action) => (
          <Card key={action.label} className="card-elevated hover-lift">
            <CardContent className="p-6 text-center">
              <Link to={action.href} className="block space-y-3">
                <action.icon className="h-10 w-10 text-primary mx-auto" />
                <h3 className="font-semibold text-lg">{action.label}</h3>
                <Badge variant="secondary">{action.count}</Badge>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-luxury text-2xl font-bold">Recent Orders</h2>
          <EnhancedButton variant="outline" size="sm" asChild>
            <Link to="/my-orders">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </EnhancedButton>
        </div>

        {loading ? (
          <Card className="card-elevated">
            <CardContent className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-muted-foreground">Loading your orders...</p>
            </CardContent>
          </Card>
        ) : recentOrders.length === 0 ? (
          <Card className="card-elevated">
            <CardContent className="p-8 text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-4">Start shopping to see your orders here</p>
              <EnhancedButton variant="luxury" asChild>
                <Link to="/products">Browse Products</Link>
              </EnhancedButton>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <Card key={order.orderNumber} className="card-elevated hover-lift cursor-pointer">
                <Link to={`/order-tracking/${order.orderNumber}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-lg">Order #{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">{order.orderDate}</p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Items:</span>
                        <span className="font-medium">{order.items?.length || 0} item(s)</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total:</span>
                        <span className="font-semibold text-primary">₹{order.total?.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Delivery:</span>
                        <span className="font-medium">
                          {order.deliveryType === 'HOME_DELIVERY' ? 'Home Delivery' : 'Store Pickup'}
                        </span>
                      </div>
                    </div>

                    {order.items && order.items.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-muted-foreground">
                          {order.items.map((item: any) => item.name).join(', ')}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <Card className="bg-gradient-gold text-luxury-foreground">
        <CardContent className="p-8 text-center">
          <Crown className="h-12 w-12 mx-auto mb-4" />
          <h2 className="font-luxury text-3xl font-bold mb-3">Discover New Arrivals</h2>
          <p className="text-lg mb-6 opacity-90">Explore our latest handcrafted jewellery collections</p>
          <EnhancedButton variant="premium" size="lg" asChild>
            <Link to="/products">
              Shop Now <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </EnhancedButton>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserHome;