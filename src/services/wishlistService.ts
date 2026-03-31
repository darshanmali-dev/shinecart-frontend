import api from './api';
import { ApiResponse, WishlistItem } from './types';

export const wishlistService = {
  // Get user's wishlist
  async getWishlist(): Promise<ApiResponse<WishlistItem[]>> {
    try {
      const response = await api.get<WishlistItem[]>('/wishlist');
      return { success: true, data: response.data };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        data: [],
        message: err.response?.data?.message || 'Failed to fetch wishlist',
      };
    }
  },

  // Add product to wishlist
  async addToWishlist(productId: number): Promise<ApiResponse<WishlistItem>> {
    try {
      const response = await api.post<WishlistItem>('/wishlist', { productId });
      return { 
        success: true, 
        data: response.data,
        message: 'Added to wishlist' 
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        data: {} as WishlistItem,
        message: err.response?.data?.message || 'Failed to add to wishlist',
      };
    }
  },

  // Remove product from wishlist
  async removeFromWishlist(productId: number): Promise<ApiResponse<null>> {
    try {
      await api.delete(`/wishlist/${productId}`);
      return { 
        success: true, 
        data: null, 
        message: 'Removed from wishlist' 
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        data: null,
        message: err.response?.data?.message || 'Failed to remove from wishlist',
      };
    }
  },

  // Check if product is in wishlist
  async checkWishlist(productId: number): Promise<ApiResponse<boolean>> {
    try {
      const response = await api.get<{ isInWishlist: boolean }>(`/wishlist/check/${productId}`);
      return { 
        success: true, 
        data: response.data.isInWishlist 
      };
    } catch (error: unknown) {
      return {
        success: false,
        data: false,
        message: 'Failed to check wishlist',
      };
    }
  },

  // Clear entire wishlist
  async clearWishlist(): Promise<ApiResponse<null>> {
    try {
      await api.delete('/wishlist');
      return { 
        success: true, 
        data: null, 
        message: 'Wishlist cleared' 
      };
    } catch (error: unknown) {
      return {
        success: false,
        data: null,
        message: 'Failed to clear wishlist',
      };
    }
  },

  // Legacy method name for backward compatibility
  async getWishlistItems(): Promise<ApiResponse<WishlistItem[]>> {
    return this.getWishlist();
  },
};