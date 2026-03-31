import api from './api';
import { ApiResponse, AdminStats, LowStockItem } from './types';

const MOCK_STATS: AdminStats[] = [
  { title: 'Total Orders', value: '1,234', change: '+12%', icon: 'ShoppingCart' },
  { title: 'Active Customers', value: '892', change: '+8%', icon: 'Users' },
  { title: 'Products', value: '456', change: '+5%', icon: 'Package' },
  { title: 'Revenue', value: '₹12.5L', change: '+18%', icon: 'TrendingUp' },
];

const MOCK_LOW_STOCK: LowStockItem[] = [
  { name: 'Diamond Ring Set', stock: 2, category: 'Rings' },
  { name: 'Pearl Necklace', stock: 1, category: 'Necklaces' },
  { name: 'Gold Earrings', stock: 3, category: 'Earrings' },
];

export const adminService = {
  // Mock: GET /admin/stats
  async getStats(): Promise<ApiResponse<AdminStats[]>> {
    return { success: true, data: MOCK_STATS };
  },

  // Mock: GET /admin/low-stock
  async getLowStockItems(): Promise<ApiResponse<LowStockItem[]>> {
    return { success: true, data: MOCK_LOW_STOCK };
  },
};
