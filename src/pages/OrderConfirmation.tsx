// src/pages/OrderConfirmation.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Card, CardContent } from '@/components/ui/card';
import { orderService, OrderResponse } from '@/services/orderService';
import { CheckCircle, Package } from 'lucide-react';

const OrderConfirmation = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderNumber) {
      loadOrder();
    }
  }, [orderNumber]);

  const loadOrder = async () => {
    try {
      const orderData = await orderService.getOrder(orderNumber!);
      setOrder(orderData);
    } catch (error) {
      console.error('Failed to load order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-16 text-center">Loading...</div>;
  }

  if (!order) {
    return <div className="container mx-auto px-4 py-16 text-center">Order not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="font-luxury text-4xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground text-lg">
            Thank you for your purchase. Your order has been placed successfully.
          </p>
        </div>

        <Card className="text-left mb-8">
          <CardContent className="p-8 space-y-6">
            <div>
              <h2 className="font-semibold text-lg mb-4">Order Details</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Order Number</p>
                  <p className="font-semibold">{order.orderNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Order Date</p>
                  <p className="font-semibold">{order.orderDate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Amount</p>
                  <p className="font-semibold">₹{order.total.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Expected Delivery</p>
                  <p className="font-semibold">{order.expectedDelivery}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Items Ordered</h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <img src={`${import.meta.env.BASE_URL}${item.image}`} alt={item.name} className="w-16 h-16 object-cover rounded" />
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">₹{item.price.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {order.deliveryType === 'HOME_DELIVERY' && order.shippingAddress && (
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-2">Delivery Address</h3>
                <p>{order.shippingAddress.name}</p>
                <p className="text-sm text-muted-foreground">
                  {order.shippingAddress.address}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}<br />
                  Phone: {order.shippingAddress.phone}
                </p>
              </div>
            )}

            {order.deliveryType === 'STORE_PICKUP' && order.storePickup && (
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-2">Pickup Store</h3>
                <p>{order.storePickup.storeName}</p>
                <p className="text-sm text-muted-foreground">
                  {order.storePickup.storeAddress}<br />
                  {order.storePickup.storeCity}<br />
                  Phone: {order.storePickup.storePhone}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <EnhancedButton
            variant="luxury"
            size="lg"
            className="w-full"
            onClick={() => navigate(`/order-tracking?orderNumber=${order.orderNumber}`)}
          >
            <Package className="h-5 w-5 mr-2" />
            Track Your Order
          </EnhancedButton>

          <EnhancedButton
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => navigate('/')}
          >
            Continue Shopping
          </EnhancedButton>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;