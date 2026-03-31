// src/services/orderService.ts
import api from './api';

export interface CreateOrderRequest {
  deliveryType: 'HOME_DELIVERY' | 'STORE_PICKUP';
  shippingAddress?: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
    email?: string;
    landmark?: string;
  };
  storeId?: number;
  items: {
    productId: number;
    quantity: number;
    size?: string;
  }[];
}

export interface OrderResponse {
  orderNumber: string;
  status: string;
  orderDate: string;
  expectedDelivery: string;
  total: number;
  deliveryType: string;
  items: {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  shippingAddress?: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  storePickup?: {
    storeName: string;
    storeAddress: string;
    storeCity: string;
    storePhone: string;
  };
  trackingSteps: {
    status: string;
    date: string;
    time: string;
    description: string;
    completed: boolean;
    current?: boolean;
    icon: string;
  }[];
}

export interface RazorpayOrderResponse {
  razorpayOrderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  key: string;
}

export const orderService = {
  // Create order (Proceed to Checkout)
  async createOrder(request: CreateOrderRequest): Promise<OrderResponse> {
    const response = await api.post('/orders', request);
    return response.data;
  },

  // Get order by order number
  async getOrder(orderNumber: string): Promise<OrderResponse> {
    const response = await api.get(`/orders/${orderNumber}`);
    return response.data;
  },

  // Get user's all orders
  async getMyOrders(): Promise<OrderResponse[]> {
    const response = await api.get('/orders/my-orders');
    return response.data;
  },

  // Create Razorpay order for payment
  async createRazorpayOrder(orderNumber: string): Promise<RazorpayOrderResponse> {
    const response = await api.post(`/payments/create-order?orderNumber=${orderNumber}`);
    return response.data;
  },

  // Verify payment
  async verifyPayment(paymentData: {
    orderNumber: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/payments/verify', paymentData);
    return response.data;
  },

  // Handle payment failure
  async handlePaymentFailure(orderNumber: string): Promise<void> {
    await api.post(`/payments/failure?orderNumber=${orderNumber}`);
  },
};

// Store service
export interface StoreResponse {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  openingHours: string;
  workingDays: string;
  latitude?: number;
  longitude?: number;
}

export const storeService = {
  // Get all stores
  async getAllStores(): Promise<StoreResponse[]> {
    const response = await api.get('/stores');
    return response.data;
  },

  // Get stores by city
  async getStoresByCity(city: string): Promise<StoreResponse[]> {
    const response = await api.get(`/stores/city/${city}`);
    return response.data;
  },
};