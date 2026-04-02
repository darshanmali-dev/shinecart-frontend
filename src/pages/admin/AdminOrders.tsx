import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Search,
  Loader2,
  ShoppingCart,
  TrendingUp,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  RefreshCw,
  DollarSign,
} from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_URL;

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
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

interface Order {
  orderNumber: string;
  status: string;
  orderDate: string;
  expectedDelivery: string;
  total: number;
  deliveryType: string;
  userId: number;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress | null;
  storePickup: StorePickup | null;
}

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  inTransitOrders: number;
  deliveredOrders: number;
  failedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
}

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    inTransitOrders: 0,
    deliveredOrders: 0,
    failedOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusDescription, setStatusDescription] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, searchQuery, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/orders/admin/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        toast.error('Failed to load orders');
      }
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/orders/admin/stats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;

    setUpdating(true);
    try {
      const response = await fetch(
        `${BASE_URL}/api/orders/${selectedOrder.orderNumber}/status?status=${encodeURIComponent(newStatus)}&description=${encodeURIComponent(statusDescription)}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }
      );

      if (response.ok) {
        toast.success('Order status updated successfully!');
        setIsUpdateDialogOpen(false);
        setNewStatus('');
        setStatusDescription('');
        fetchOrders();
        fetchStats();
      } else {
        toast.error('Failed to update order status');
      }
    } catch (error) {
      toast.error('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, string> = {
      'Order Placed': 'bg-blue-500 text-white',
      Processing: 'bg-yellow-500 text-white',
      Shipped: 'bg-purple-500 text-white',
      'In Transit': 'bg-orange-500 text-white',
      Delivered: 'bg-green-500 text-white',
      Cancelled: 'bg-red-500 text-white',
      'Order Failed': 'bg-red-700 text-white',
    };
    return (
      <Badge className={config[status] || 'bg-gray-500 text-white'}>
        {status}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Order Placed': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'Processing': return <Package className="h-4 w-4 text-yellow-500" />;
      case 'Shipped': return <Truck className="h-4 w-4 text-purple-500" />;
      case 'In Transit': return <Truck className="h-4 w-4 text-orange-500" />;
      case 'Delivered': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

const statsCards = [
  {
    title: 'Total Orders',
    value: statsLoading ? '...' : (stats.totalOrders || 0).toString(),
    icon: ShoppingCart,
    color: 'text-blue-600',
  },
  {
    title: 'Pending',
    value: statsLoading ? '...' : (stats.pendingOrders || 0).toString(),
    icon: Clock,
    color: 'text-blue-500',
  },
  {
    title: 'Processing',
    value: statsLoading ? '...' : (stats.processingOrders || 0).toString(),
    icon: Package,
    color: 'text-yellow-600',
  },
  {
    title: 'Shipped',
    value: statsLoading ? '...' : (stats.shippedOrders || 0).toString(),
    icon: Truck,
    color: 'text-purple-600',
  },
  {
    title: 'In Transit',
    value: statsLoading ? '...' : (stats.inTransitOrders || 0).toString(),
    icon: Truck,
    color: 'text-orange-600',
  },
  {
    title: 'Delivered',
    value: statsLoading ? '...' : (stats.deliveredOrders || 0).toString(),
    icon: CheckCircle,
    color: 'text-green-600',
  },
  {
    title: 'Cancelled',
    value: statsLoading ? '...' : (stats.cancelledOrders || 0).toString(),
    icon: XCircle,
    color: 'text-red-600',
  },
  {
    title: 'Order Delivered Revenue',
    value: statsLoading ? '...' : `₹${((stats.totalRevenue || 0) / 100000).toFixed(2)}L`,
    icon: DollarSign,
    color: 'text-primary',
  },
];

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <EnhancedButton
            variant="ghost"
            onClick={() => navigate('/admin')}
            className="mb-2 -ml-2"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </EnhancedButton>
          <h1 className="font-luxury text-3xl sm:text-4xl font-bold">Order Management</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage and track all customer orders
          </p>
        </div>
        <EnhancedButton
          variant="outline"
          onClick={() => { fetchOrders(); fetchStats(); }}
          className="w-full sm:w-auto"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </EnhancedButton>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                  <p className="text-lg sm:text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-5 w-5 sm:h-7 sm:w-7 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-4 sm:mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label className="text-sm">Search Orders</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order number, customer name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Label className="text-sm">Filter by Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Orders</SelectItem>
                  <SelectItem value="Order Placed">Order Placed</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Shipped">Shipped</SelectItem>
                  <SelectItem value="In Transit">In Transit</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="Order Failed">Order Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">
            All Orders ({filteredOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 px-4">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-semibold text-muted-foreground">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[130px]">Order No.</TableHead>
                    <TableHead className="min-w-[150px]">Customer</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="min-w-[100px]">Date</TableHead>
                    <TableHead className="min-w-[80px]">Items</TableHead>
                    <TableHead className="min-w-[100px]">Total</TableHead>
                    <TableHead className="min-w-[100px]">Delivery</TableHead>
                    <TableHead className="min-w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.orderNumber}>
                      <TableCell className="font-mono text-sm font-semibold">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{order.userName}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {order.userEmail}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          {getStatusBadge(order.status)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {new Date(order.orderDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{order.items?.length || 0}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-sm whitespace-nowrap">
                        ₹{order.total?.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs whitespace-nowrap">
                          {order.deliveryType === 'HOME_DELIVERY' ? '🏠 Home' : '🏪 Store'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <EnhancedButton
                            variant="ghost"
                            size="sm"
                            title="View Details"
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsDetailDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </EnhancedButton>
                          <EnhancedButton
                            variant="ghost"
                            size="sm"
                            title="Update Status"
                            onClick={() => {
                              setSelectedOrder(order);
                              setNewStatus(order.status);
                              setIsUpdateDialogOpen(true);
                            }}
                          >
                            <RefreshCw className="h-4 w-4 text-blue-600" />
                          </EnhancedButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.orderNumber}</DialogTitle>
            <DialogDescription>
              Placed on {selectedOrder && new Date(selectedOrder.orderDate).toLocaleDateString('en-IN')}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 py-2">
              {/* Customer & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Customer</p>
                  <p className="font-semibold">{selectedOrder.userName}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.userEmail}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  {getStatusBadge(selectedOrder.status)}
                  <p className="text-xs text-muted-foreground mt-1">
                    Expected: {new Date(selectedOrder.expectedDelivery).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-2">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 border rounded-lg p-3">
                      <img
  src={item.image ? BASE_URL + item.image : '/placeholder.jpg'}
  alt={item.name}
  className="w-12 h-12 object-cover rounded"
  onError={(e) => { e.currentTarget.src = '/placeholder.jpg'; }}
/>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-sm">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center border-t pt-3">
                <span className="font-semibold">Total Amount</span>
                <span className="text-xl font-bold text-primary">
                  ₹{selectedOrder.total?.toLocaleString()}
                </span>
              </div>

              {/* Delivery Info */}
              <div>
                <h3 className="font-semibold mb-2">Delivery Information</h3>
                {selectedOrder.deliveryType === 'HOME_DELIVERY' && (
  <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
    {selectedOrder.shippingAddress.name ? (
      <>
        <p className="font-medium">{selectedOrder.shippingAddress.name}</p>
        <p className="text-muted-foreground">{selectedOrder.shippingAddress.address}</p>
        <p className="text-muted-foreground">
          {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}
        </p>
        <p className="text-muted-foreground">📞 {selectedOrder.shippingAddress.phone}</p>
      </>
    ) : (
      <p className="text-muted-foreground italic">No shipping address provided</p>
    )}
  </div>
)}
{selectedOrder.deliveryType === 'STORE_PICKUP' && (
  <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
    {selectedOrder.storePickup.storeName ? (
      <>
        <p className="font-medium">{selectedOrder.storePickup.storeName}</p>
        <p className="text-muted-foreground">{selectedOrder.storePickup.storeAddress}</p>
        <p className="text-muted-foreground">
          {selectedOrder.storePickup.storeCity}
        </p>
        <p className="text-muted-foreground">📞 {selectedOrder.storePickup.storePhone}</p>
      </>
    ) : (
      <p className="text-muted-foreground italic">No shipping address provided</p>
    )}
  </div>
)}
              </div>
            </div>
          )}

          <DialogFooter>
            <EnhancedButton variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Close
            </EnhancedButton>
            <EnhancedButton onClick={() => {
              setIsDetailDialogOpen(false);
              setNewStatus(selectedOrder?.status || '');
              setIsUpdateDialogOpen(true);
            }}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Update Status
            </EnhancedButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Order: {selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Current Status</Label>
              <div className="mt-1">{selectedOrder && getStatusBadge(selectedOrder.status)}</div>
            </div>

            <div>
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Order Placed">Order Placed</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Shipped">Shipped</SelectItem>
                  <SelectItem value="In Transit">In Transit</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status Description</Label>
              <Input
                className="mt-1"
                placeholder="e.g. Package picked up by courier"
                value={statusDescription}
                onChange={(e) => setStatusDescription(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <EnhancedButton
              variant="outline"
              onClick={() => setIsUpdateDialogOpen(false)}
            >
              Cancel
            </EnhancedButton>
            <EnhancedButton
              onClick={handleUpdateStatus}
              disabled={updating || !newStatus}
            >
              {updating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </EnhancedButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;