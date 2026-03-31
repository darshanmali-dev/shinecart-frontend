import api from './api';

export interface UserReportItem {
  username: string;
  email: string;
  phone: string;
  createdAt: string;
  status: string;
  role: string;
}

export interface OrderReportItem {
  orderNumber: string;
  customerName: string;
  orderDate: string;
  deliveryType: string;
  paymentStatus: string;
  status: string;
  total: number;
}

export interface OrderReportResponse {
  orders: OrderReportItem[];
  totalOrders: number;
  totalRevenue: number;
}

export interface ProductReportItem {
  productName: string;
  category: string;
  metal: string;
  totalQuantitySold: number;
  totalRevenue: number;
}

export const reportService = {

  async getUserReport(
      from: string, to: string): Promise<UserReportItem[]> {
    const response = await api.get(
      `/admin/reports/users?from=${from}&to=${to}`);
    return response.data;
  },

  async getOrderReport(
      from: string, to: string): Promise<OrderReportResponse> {
    const response = await api.get(
      `/admin/reports/orders?from=${from}&to=${to}`);
    return response.data;
  },

  async getProductReport(
      from: string, to: string): Promise<ProductReportItem[]> {
    const response = await api.get(
      `/admin/reports/products?from=${from}&to=${to}`);
    return response.data;
  },
};