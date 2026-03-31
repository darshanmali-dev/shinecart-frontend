// src/pages/OrderTracking.tsx - Updated version
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { orderService, OrderResponse } from '@/services/orderService';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  CheckCircle2,
  Clock, 
  MapPin,
  Phone,
  Mail,
  Calendar
} from 'lucide-react';

const OrderTracking = () => {
  const [searchParams ] = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');
  const [orderData, setOrderData] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderNumber) {
      handleTrackOrder(orderNumber);
    }
  }, [orderNumber]);

  const handleTrackOrder = async (ordNum?: string) => {
    const numToTrack = ordNum || orderNumber;
    if (!numToTrack.trim()) return;

    try {
      setLoading(true);
      setError('');
      const data = await orderService.getOrder(numToTrack);
      setOrderData(data);
    } catch (err) {
      setError('Order not found. Please check the order number.');
      setOrderData(null);
    } finally {
      setLoading(false);
    }
  };

  // Icon mapping
  const getIcon = (iconName: string) => {
    const icons: any = {
      CheckCircle,
      Package,
      Truck,
      MapPin,
      Clock
    };
    return icons[iconName] || Package;
  };

  if (!orderData) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Package className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="font-luxury text-4xl font-bold mb-6">Track Your Order</h1>
          <p className="text-muted-foreground mb-8">
            Enter your order number to get real-time updates on your jewellery delivery
          </p>
          
          <Card className="text-left">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Order Number</label>
                  <Input
                    placeholder="Enter your order number (e.g., SC240120001)"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleTrackOrder()}
                    className="text-lg"
                  />
                  {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>
                <EnhancedButton 
                  variant="luxury" 
                  size="lg" 
                  className="w-full"
                  onClick={() => handleTrackOrder()}
                  disabled={loading}
                >
                  {loading ? 'Searching...' : 'Track Order'}
                </EnhancedButton>
              </div>
              
              <div className="mt-8 pt-6 border-t border-border">
                <h3 className="font-semibold mb-4">Need Help?</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>Call us: +91 98765 43210</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-primary" />
                    <span>Email: support@shinecart.com</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-luxury text-4xl font-bold mb-2">Order Tracking</h1>
        <p className="text-muted-foreground">Track your jewellery delivery in real-time</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Order #{orderData.orderNumber}</span>
                <Badge variant="secondary" className="bg-warning/10 text-warning">
                  {orderData.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Order Date</span>
                  </div>
                  <p className="font-semibold">{orderData.orderDate}</p>
                </div>


                <div>
  <div className="flex items-center space-x-2 mb-2">
    {/* Icon changes based on whether delivered or upcoming */}
    {new Date(orderData.expectedDelivery) < new Date() ? (
      <CheckCircle2 className="h-4 w-4 text-green-500" />
    ) : (
      <Truck className="h-4 w-4 text-muted-foreground" />
    )}
    <span className="text-sm font-medium">
      {new Date(orderData.expectedDelivery) < new Date()
        ? 'Delivery On'
        : 'Expected Delivery'}
    </span>
  </div>
  <p className={`font-semibold ${
    new Date(orderData.expectedDelivery) < new Date()
      ? 'text-green-600'
      : 'text-primary'
  }`}>
    {orderData.expectedDelivery}
  </p>
</div>
                <div>


                  <div className="flex items-center space-x-2 mb-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Total Amount</span>
                  </div>
                  <p className="font-semibold">₹{orderData.total.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tracking Progress */}
          
          <Card>
            <CardHeader>
              <CardTitle>Tracking Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>
                
                <div className="space-y-8">
                  {orderData.trackingSteps.map((step, index) => {
                    const Icon = getIcon(step.icon);
                    return (
                      <div key={index} className="relative flex items-start space-x-4">
                        <div className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                          step.completed 
                            ? 'bg-primary border-primary text-primary-foreground' 
                            : step.current
                              ? 'bg-warning border-warning text-warning-foreground animate-pulse'
                              : 'bg-background border-border text-muted-foreground'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className={`font-semibold ${
                              step.completed || step.current ? 'text-foreground' : 'text-muted-foreground'
                            }`}>
                              {step.status}
                            </h3>
                            <span className="text-sm text-muted-foreground">
                              {step.date} • {step.time}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderData.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <img 
                      src={"http://localhost:8080"+item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{item.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Delivery Address or Store Pickup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                {orderData.deliveryType === 'HOME_DELIVERY' ? 'Delivery Address' : 'Pickup Store'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orderData.deliveryType === 'HOME_DELIVERY' && orderData.shippingAddress && (
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">{orderData.shippingAddress.name}</p>
                  <p>{orderData.shippingAddress.address}</p>
                  <p>{orderData.shippingAddress.city}, {orderData.shippingAddress.state}</p>
                  <p>{orderData.shippingAddress.pincode}</p>
                  <div className="pt-2 border-t border-border">
                    <p className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>{orderData.shippingAddress.phone}</span>
                    </p>
                  </div>
                </div>
              )}

              {orderData.deliveryType === 'STORE_PICKUP' && orderData.storePickup && (
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">{orderData.storePickup.storeName}</p>
                  <p>{orderData.storePickup.storeAddress}</p>
                  <p>{orderData.storePickup.storeCity}</p>
                  <div className="pt-2 border-t border-border">
                    <p className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>{orderData.storePickup.storePhone}</span>
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Have questions about your order? Our support team is here to help.
              </p>
              
              <div className="space-y-3">
                <EnhancedButton variant="outline" size="sm" className="w-full justify-start">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Support
                </EnhancedButton>
                <EnhancedButton variant="outline" size="sm" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Us
                </EnhancedButton>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Support Hours: 9:00 AM - 8:00 PM (Mon-Sat)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;