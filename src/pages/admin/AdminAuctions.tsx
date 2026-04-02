import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { auctionService, Auction, CreateAuctionRequest } from '@/services/auctionService';
import { productService } from '@/services/productService';
import type { Product } from '@/services/types';
import {
  Gavel,
  Plus,
  Edit,
  Trash2,
  Eye,
  Ban,
  Clock,  
  Search,
  Loader2,
  TrendingUp,
  Package,
  DollarSign,
  Activity,
  AlertCircle,
} from 'lucide-react';

export default function AdminAuctions() {
  const navigate = useNavigate();
  
  // State
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAuctions: 0,
    activeAuctions: 0,
    totalBids: 0,
    totalRevenue: 0
  });
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialogs
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [saving, setSaving] = useState(false);
  const BASE_URL = import.meta.env.VITE_API_URL;
  
  // Create Form Data
  const [formData, setFormData] = useState({
    productId: '',
    startingPrice: '',
    reservePrice: '',
    bidIncrement: '',
    startTime: '',
    endTime: ''
  });

  useEffect(() => {
    fetchAuctions();
    fetchStats();
    fetchProducts();
  }, [statusFilter, searchQuery]);

  const fetchAuctions = async () => {
    setLoading(true);
    try {
      const response = await auctionService.getAllAuctionsAdmin(statusFilter, searchQuery);
      setAuctions(response.data);
    } catch (error) {
      toast.error('Failed to load auctions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const response = await auctionService.getAuctionStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productService.getProducts();
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const statsCards = [
    {
      title: 'Total Auctions',
      value: statsLoading ? '...' : stats.totalAuctions.toString(),
      change: '+12%',
      icon: Gavel,
      color: 'text-blue-600'
    },
    {
      title: 'Active Auctions',
      value: statsLoading ? '...' : stats.activeAuctions.toString(),
      change: '+5%',
      icon: Activity,
      color: 'text-green-600'
    },
    {
      title: 'Total Bids',
      value: statsLoading ? '...' : stats.totalBids.toString(),
      change: '+23%',
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    {
      title: 'Revenue',
      value: statsLoading ? '...' : `₹${(stats.totalRevenue / 100000).toFixed(1)}L`,
      change: '+18%',
      icon: DollarSign,
      color: 'text-yellow-600'
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; className: string }> = {
      ACTIVE: { variant: 'default', className: 'bg-green-500' },
      ENDING_SOON: { variant: 'destructive', className: 'bg-red-500 animate-pulse' },
      UPCOMING: { variant: 'secondary', className: 'bg-blue-500' },
      ENDED: { variant: 'secondary', className: 'bg-gray-500' },
      CANCELLED: { variant: 'destructive', className: 'bg-red-700' }
    };
    
    const config = variants[status] || variants.ENDED;
    return (
      <Badge className={config.className + ' text-white'}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const resetForm = () => {
    setFormData({
      productId: '',
      startingPrice: '',
      reservePrice: '',
      bidIncrement: '',
      startTime: '',
      endTime: ''
    });
  };

  const handleCreateAuction = async () => {
    if (!formData.productId || !formData.startingPrice || !formData.bidIncrement || 
        !formData.startTime || !formData.endTime) {
      toast.error('Please fill all required fields');
      return;
    }

    setSaving(true);
    try {
      const request: CreateAuctionRequest = {
        productId: parseInt(formData.productId),
        startingPrice: parseFloat(formData.startingPrice),
        reservePrice: formData.reservePrice ? parseFloat(formData.reservePrice) : parseFloat(formData.startingPrice),
        bidIncrement: parseFloat(formData.bidIncrement),
        startTime: formData.startTime + ':00',
        endTime: formData.endTime + ':00'
      };

      const response = await auctionService.createAuction(request);
      
      if (response.data.success) {
        toast.success('Auction created successfully! 🎉');
        setIsCreateDialogOpen(false);
        resetForm();
        fetchAuctions();
        fetchStats();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create auction');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelAuction = async (id: number, productName: string) => {
    if (!confirm(`Are you sure you want to cancel the auction for "${productName}"?`)) return;

    try {
      const response = await auctionService.cancelAuction(id);
      if (response.data.success) {
        toast.success('Auction cancelled successfully');
        fetchAuctions();
        fetchStats();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to cancel auction');
    }
  };

  const handleExtendAuction = async (id: number, productName: string) => {
    const minutes = prompt('How many minutes to extend?', '30');
    if (!minutes) return;

    try {
      const response = await auctionService.extendAuction(id, parseInt(minutes));
      if (response.data.success) {
        toast.success(`Auction extended by ${minutes} minutes`);
        fetchAuctions();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to extend auction');
    }
  };

  const handleEndAuction = async (id: number, productName: string) => {
    if (!confirm(`Are you sure you want to end the auction for "${productName}" now?`)) return;

    try {
      const response = await auctionService.endAuctionManually(id);
      if (response.data.success) {
        toast.success('Auction ended successfully');
        fetchAuctions();
        fetchStats();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to end auction');
    }
  };

  const handleDeleteAuction = async (id: number, productName: string) => {
    if (!confirm(`Are you sure you want to delete the auction for "${productName}"? This cannot be undone.`)) return;

    try {
      const response = await auctionService.deleteAuction(id);
      if (response.data.success) {
        toast.success('Auction deleted successfully');
        fetchAuctions();
        fetchStats();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete auction');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      
  <div className="container mx-auto px-4 py-8">
    {/* Header - Responsive */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 className="font-luxury text-3xl sm:text-4xl font-bold">Auction Management</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">Manage live bidding auctions</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <EnhancedButton
          variant="outline"
          onClick={() => navigate('/admin')}
          className="w-full sm:w-auto"
        >
          ← Back to Dashboard
        </EnhancedButton>
        <EnhancedButton 
          onClick={() => setIsCreateDialogOpen(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Auction
        </EnhancedButton>
      </div>
    </div>

    {/* Stats Cards - Already responsive with grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
      {statsCards.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
                <Badge variant="secondary" className="bg-success/10 text-success mt-1 text-xs">
                  {stat.change}
                </Badge>
              </div>
              <stat.icon className={`h-6 w-6 sm:h-8 sm:w-8 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Filters - Responsive */}
    <Card className="mb-6">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Label className="text-sm">Search Auctions</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by product name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <Label className="text-sm">Filter by Status</Label>
            <Select value={statusFilter || 'ALL'} onValueChange={(value) => setStatusFilter(value === 'ALL' ? '' : value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="UPCOMING">Upcoming</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="ENDING_SOON">Ending Soon</SelectItem>
                <SelectItem value="ENDED">Ended</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Auctions Table - Scrollable on mobile */}
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl">All Auctions ({auctions.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : auctions.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Gavel className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-semibold text-muted-foreground">No auctions found</p>
            <p className="text-sm text-muted-foreground mt-1">Create your first auction to get started</p>
          </div>
        ) : (
          // Make table scrollable on mobile
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Product</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[120px]">Current Price</TableHead>
                  <TableHead className="min-w-[80px]">Bids</TableHead>
                  <TableHead className="min-w-[150px]">Start Time</TableHead>
                  <TableHead className="min-w-[150px]">End Time</TableHead>
                  <TableHead className="min-w-[100px]">Winner</TableHead>
                  <TableHead className="min-w-[200px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auctions.map((auction) => (
                  <TableRow key={auction.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <img
                          src={`${BASE_URL}${auction.product.images?.[0] || '/placeholder.jpg'}`}
                          alt={auction.product.name}
                          className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">{auction.product.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {auction.product.category} • {auction.product.metal}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(auction.status)}</TableCell>
                    <TableCell className="font-semibold text-green-600 text-sm whitespace-nowrap">
                      ₹{auction.currentPrice.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">{auction.totalBids}</Badge>
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">
                      {formatDateTime(auction.startTime)}
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">
                      {formatDateTime(auction.endTime)}
                    </TableCell>
                    <TableCell>
                      {auction.winnerName ? (
                        <span className="text-xs sm:text-sm font-medium text-green-600 truncate block max-w-[100px]">
                          {auction.winnerName}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        <EnhancedButton
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/auctions/${auction.id}`)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </EnhancedButton>
                        
                        {auction.status === 'ACTIVE' && (
                          <>
                            <EnhancedButton
                              variant="ghost"
                              size="sm"
                              onClick={() => handleExtendAuction(auction.id, auction.product.name)}
                              title="Extend Time"
                            >
                              <Clock className="h-4 w-4 text-blue-600" />
                            </EnhancedButton>
                            <EnhancedButton
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEndAuction(auction.id, auction.product.name)}
                              title="End Now"
                            >
                              <AlertCircle className="h-4 w-4 text-orange-600" />
                            </EnhancedButton>
                          </>
                        )}
                        
                        {(auction.status === 'ACTIVE' || auction.status === 'UPCOMING') && (
                          <EnhancedButton
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelAuction(auction.id, auction.product.name)}
                            title="Cancel Auction"
                          >
                            <Ban className="h-4 w-4 text-red-600" />
                          </EnhancedButton>
                        )}
                        
                        {(auction.status === 'UPCOMING' || auction.status === 'CANCELLED') && (
                          <EnhancedButton
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAuction(auction.id, auction.product.name)}
                            title="Delete Auction"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </EnhancedButton>
                        )}
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

    {/* Dialog remains the same */}
    {/* ... rest of your dialog code ... */}
  </div>
);
      {/* Create Auction Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Auction</DialogTitle>
            <DialogDescription>
              Set up a new live bidding auction for a product
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Product Selection */}
            <div>
              <Label htmlFor="productId">Select Product *</Label>
              <Select value={formData.productId} onValueChange={(value) => setFormData(prev => ({ ...prev, productId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name} - ₹{product.price.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="startingPrice">Starting Price *</Label>
                <Input
                  id="startingPrice"
                  type="number"
                  value={formData.startingPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, startingPrice: e.target.value }))}
                  placeholder="50000"
                />
              </div>
              <div>
                <Label htmlFor="reservePrice">Reserve Price</Label>
                <Input
                  id="reservePrice"
                  type="number"
                  value={formData.reservePrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, reservePrice: e.target.value }))}
                  placeholder="75000"
                />
              </div>
              <div>
                <Label htmlFor="bidIncrement">Bid Increment *</Label>
                <Input
                  id="bidIncrement"
                  type="number"
                  value={formData.bidIncrement}
                  onChange={(e) => setFormData(prev => ({ ...prev, bidIncrement: e.target.value }))}
                  placeholder="1000"
                />
              </div>
            </div>

            {/* Timing */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Auction must be at least 1 hour long. Users will be able to place bids during the active period.
              </p>
            </div>
          </div>

          <DialogFooter>
            <EnhancedButton
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </EnhancedButton>
            <EnhancedButton onClick={handleCreateAuction} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Auction'
              )}
            </EnhancedButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}