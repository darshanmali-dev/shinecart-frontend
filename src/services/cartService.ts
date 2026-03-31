import api from './api';
import { ApiResponse, CartItem } from './types';

export const cartService = {
  // Get user's cart
  async getCart(): Promise<ApiResponse<CartItem[]>> {
    try {
      const response = await api.get<CartItem[]>('/cart');
      return { success: true, data: response.data };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        data: [],
        message: err.response?.data?.message || 'Failed to fetch cart',
      };
    }
  },

  // Add product to cart
  async addToCart(request: {
    productId: number;
    quantity: number;
    size?: string;
  }): Promise<ApiResponse<CartItem>> {
    try {
      const response = await api.post<CartItem>('/cart', request);
      return { 
        success: true, 
        data: response.data,
        message: 'Item added to cart' 
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        data: {} as CartItem,
        message: err.response?.data?.message || 'Failed to add to cart',
      };
    }
  },

  // Update cart item
  async updateCartItem(productId: number, request: {
    quantity?: number;
    size?: string;
  }): Promise<ApiResponse<CartItem>> {
    try {
      const response = await api.put<CartItem>(`/cart/${productId}`, request);
      return { 
        success: true, 
        data: response.data,
        message: 'Cart updated' 
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        data: {} as CartItem,
        message: err.response?.data?.message || 'Failed to update cart',
      };
    }
  },

  // Remove product from cart
  async removeFromCart(productId: number): Promise<ApiResponse<null>> {
    try {
      await api.delete(`/cart/${productId}`);
      return { 
        success: true, 
        data: null, 
        message: 'Item removed from cart' 
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        data: null,
        message: err.response?.data?.message || 'Failed to remove from cart',
      };
    }
  },

  // Clear entire cart
  async clearCart(): Promise<ApiResponse<null>> {
    try {
      await api.delete('/cart');
      return { 
        success: true, 
        data: null, 
        message: 'Cart cleared' 
      };
    } catch (error: unknown) {
      return {
        success: false,
        data: null,
        message: 'Failed to clear cart',
      };
    }
  },

  // Get cart total
  async getCartTotal(): Promise<ApiResponse<number>> {
    try {
      const response = await api.get<{ total: number }>('/cart/total');
      return { 
        success: true, 
        data: response.data.total 
      };
    } catch (error: unknown) {
      return {
        success: false,
        data: 0,
        message: 'Failed to get cart total',
      };
    }
  },

  // Get cart item count
  async getCartCount(): Promise<ApiResponse<number>> {
    try {
      const response = await api.get<{ count: number }>('/cart/count');
      return { 
        success: true, 
        data: response.data.count 
      };
    } catch (error: unknown) {
      return {
        success: false,
        data: 0,
        message: 'Failed to get cart count',
      };
    }
  },

  // Update quantity (convenience method)
  async updateQuantity(productId: number, quantity: number): Promise<ApiResponse<CartItem>> {
    return this.updateCartItem(productId, { quantity });
  },

  // Apply promo code (TODO: implement in backend)
  async applyPromoCode(code: string): Promise<ApiResponse<{ discount: number }>> {
    // TODO: Implement promo code endpoint in backend
    if (code.toUpperCase() === 'SHINE10') {
      return { success: true, data: { discount: 10 }, message: 'Promo code applied!' };
    }
    return { success: false, data: { discount: 0 }, message: 'Invalid promo code' };
  },

  // Legacy method name for backward compatibility
  async getCartItems(): Promise<ApiResponse<CartItem[]>> {
    return this.getCart();
  },
};