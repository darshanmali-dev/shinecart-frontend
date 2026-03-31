import api from './api';
import { ApiResponse, Product, ProductDetail, Review, RelatedProduct, FilterOption } from './types';

export const productService = {
  // Get all products (public - only In Stock)
  async getProducts(): Promise<ApiResponse<Product[]>> {
    try {
      const response = await api.get<Product[]>('/products');
      return { success: true, data: response.data };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        data: [],
        message: err.response?.data?.message || 'Failed to fetch products',
      };
    }
  },

  // Get all products (admin - all including Out of Stock)
  async getProductsAdmin(): Promise<ApiResponse<Product[]>> {
    try {
      const response = await api.get<Product[]>('/products/admin');
      return { success: true, data: response.data };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        data: [],
        message: err.response?.data?.message || 'Failed to fetch products',
      };
    }
  },

  // Get product by ID
  async getProductById(id: number): Promise<ApiResponse<ProductDetail>> {
    try {
      const response = await api.get<ProductDetail>(`/products/${id}`);
      return { success: true, data: response.data };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        data: {} as ProductDetail,
        message: err.response?.data?.message || 'Failed to fetch product',
      };
    }
  },

  // Search products
  async searchProducts(keyword: string): Promise<ApiResponse<Product[]>> {
    try {
      const response = await api.get<Product[]>(`/products/search?q=${keyword}`);
      return { success: true, data: response.data };
    } catch (error: unknown) {
      return {
        success: false,
        data: [],
        message: 'Failed to search products',
      };
    }
  },

  // Filter products
  async filterProducts(filters: {
    category?: string;
    metal?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<ApiResponse<Product[]>> {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.metal) params.append('metal', filters.metal);
      if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());

      const response = await api.get<Product[]>(`/products/filter?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error: unknown) {
      return {
        success: false,
        data: [],
        message: 'Failed to filter products',
      };
    }
  },

  // Get products by category
  async getProductsByCategory(category: string): Promise<ApiResponse<Product[]>> {
    try {
      const response = await api.get<Product[]>(`/products/category/${category}`);
      return { success: true, data: response.data };
    } catch (error: unknown) {
      return {
        success: false,
        data: [],
        message: 'Failed to fetch products',
      };
    }
  },

  // Toggle product availability (admin only)
  // Calls PATCH /api/products/{id}/toggle-availability
  // In Stock / Limited Stock → Out of Stock
  // Out of Stock             → In Stock
  async toggleAvailability(id: number): Promise<ApiResponse<{ availability: string; message: string }>> {
    try {
      const response = await api.patch<{ availability: string; message: string }>(
        `/products/${id}/toggle-availability`
      );
      return { success: true, data: response.data };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        data: { availability: '', message: '' },
        message: err.response?.data?.message || 'Failed to toggle availability',
      };
    }
  },

  // Mock endpoints (these need backend implementation later)
  async getProductReviews(productId: number): Promise<ApiResponse<Review[]>> {
    // TODO: Implement reviews in backend
    return { success: true, data: [] };
  },

  async getRelatedProducts(productId: number): Promise<ApiResponse<RelatedProduct[]>> {
    // TODO: Implement related products in backend
    return { success: true, data: [] };
  },

  async getCategories(): Promise<ApiResponse<FilterOption[]>> {
    // TODO: Implement categories endpoint in backend
    return {
      success: true,
      data: [
        { id: 'rings',     name: 'Rings',        count: 234 },
        { id: 'necklaces', name: 'Necklaces',     count: 156 },
        { id: 'earrings',  name: 'Earrings',      count: 189 },
        { id: 'bracelets', name: 'Bracelets',     count: 98  },
        { id: 'sets',      name: 'jewellery Sets',  count: 67  },
      ],
    };
  },

  async getMetals(): Promise<ApiResponse<FilterOption[]>> {
    // TODO: Implement metals endpoint in backend
    return {
      success: true,
      data: [
        { id: 'gold',      name: 'Gold',      count: 445 },
        { id: 'silver',    name: 'Silver',    count: 234 },
        { id: 'platinum',  name: 'Platinum',  count: 89  },
        { id: 'rose-gold', name: 'Rose Gold', count: 156 },
      ],
    };
  },

  async getPriceRanges(): Promise<ApiResponse<FilterOption[]>> {
    // TODO: Implement price ranges endpoint in backend
    return {
      success: true,
      data: [
        { id: 'under-25k', name: 'Under ₹25,000',          count: 234 },
        { id: '25k-50k',   name: '₹25,000 - ₹50,000',      count: 189 },
        { id: '50k-1l',    name: '₹50,000 - ₹1,00,000',    count: 145 },
        { id: 'above-1l',  name: 'Above ₹1,00,000',        count: 98  },
      ],
    };
  },
};