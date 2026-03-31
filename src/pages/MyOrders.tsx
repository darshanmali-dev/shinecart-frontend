import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { toast } from 'sonner';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock,
  ChevronRight,
  Loader2,
  ShoppingBag,
  Home,
  Store
} from 'lucide-react';
import api from '@/services/api';
import Navigation from '@/components/layout/Navigation';

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  image: string | null;
}

interface TrackingStep {
  status: string;
  date: string;
  time: string;
  description: string;
  completed: boolean;
  current: boolean;
  icon: string;
}

interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

interface StorePickup {
  storeName: string;
  storeAddress: string;
  storeCity: string;
  storePhone: string;
}

interface OrderResponse {
  orderNumber: string;
  status: string;
  orderDate: string;
  expectedDelivery: string;
  total: number;
  deliveryType: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress | null;
  storePickup: StorePickup | null;
  trackingSteps: TrackingStep[];
}

const MyOrders = () => {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get<OrderResponse[]>('/orders/my-orders');
      setOrders(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    const statusUpper = status.toUpperCase().replace(' ', '_');
    switch (statusUpper) {
      case 'ORDER_PLACED':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'PROCESSING':
        return <Package className="h-5 w-5 text-purple-500" />;
      case 'SHIPPED':
        return <Truck className="h-5 w-5 text-indigo-500" />;
      case 'IN_TRANSIT':
        return <Truck className="h-5 w-5 text-cyan-500" />;
      case 'DELIVERED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'CANCELLED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    const statusUpper = status.toUpperCase().replace(' ', '_');
    switch (statusUpper) {
      case 'ORDER_PLACED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PROCESSING':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'SHIPPED':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'IN_TRANSIT':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
        <Navigation />
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-luxury text-4xl font-bold mb-2">My Orders</h1>
        <p className="text-muted-foreground text-lg">
          Track and manage your orders
        </p>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        
        <Card className="text-center py-16">
          <CardContent>
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
            <p className="text-muted-foreground mb-6">
              You haven't placed any orders yet. Start shopping to see your orders here!
            </p>
            <EnhancedButton asChild>
              <Link to="/products">Browse Products</Link>
            </EnhancedButton>
          </CardContent>
        </Card>
      ) : (

        <div className="space-y-6">
          {orders.map((order, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="border-b">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl mb-2">
                      Order #{order.orderNumber}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Placed on {formatDate(order.orderDate)} • Expected: {formatDate(order.expectedDelivery)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusIcon(order.status)}
                    <Badge 
                      variant="outline" 
                      className={`${getStatusColor(order.status)} font-medium`}
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                {/* Order Items */}
                <div className="space-y-4 mb-6">
                  {order.items.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex items-start gap-4 pb-4 border-b last:border-0"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.name}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>Quantity: {item.quantity}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">
                          ₹{((item.price || 0) * item.quantity).toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ₹{(item.price || 0).toLocaleString()} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 border-t">
                  <div className="flex-1">
                    <div className="flex items-start gap-2 mb-2">
                      {order.deliveryType === 'HOME_DELIVERY' ? (
                        <Home className="h-5 w-5 text-muted-foreground mt-0.5" />
                      ) : (
                        <Store className="h-5 w-5 text-muted-foreground mt-0.5" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          {order.deliveryType === 'HOME_DELIVERY' ? 'Home Delivery' : 'Store Pickup'}
                        </p>
                        
                        {order.deliveryType === 'HOME_DELIVERY' && order.shippingAddress ? (
                          <>
                            <p className="font-medium">
                              {order.shippingAddress.name || 'N/A'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.shippingAddress.address || 'No address provided'}
                              {order.shippingAddress.city && `, ${order.shippingAddress.city}`}
                              {order.shippingAddress.state && `, ${order.shippingAddress.state}`}
                              {order.shippingAddress.pincode && ` - ${order.shippingAddress.pincode}`}
                            </p>
                          </>
                        ) : order.storePickup ? (
                          <>
                            <p className="font-medium">
                              {order.storePickup.storeName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.storePickup.storeAddress}, {order.storePickup.storeCity}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              📞 {order.storePickup.storePhone}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground">No delivery information</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:items-end gap-3">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="text-2xl font-bold text-primary">
                        ₹{(order.total || 0).toLocaleString()}
                      </p>
                    </div>
                    {order.status.toUpperCase() !== 'ORDER FAILED' &&
                    <EnhancedButton variant="outline" asChild>
                      <Link to={`/order-tracking?orderNumber=${order.orderNumber}`}>
                        Track Order
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Link>
                    </EnhancedButton>
}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;