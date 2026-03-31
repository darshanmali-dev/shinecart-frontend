import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { toast } from 'sonner';
import websocketService from '@/services/websocketService';
import { auctionService, Auction, Bid, UpdateAuctionRequest } from '@/services/auctionService';
import { BidUpdateMessage, AuctionStatusMessage } from '@/services/types';
import {
  ArrowLeft,
  Edit,
  Ban,
  Clock,
  Trash2,
  AlertCircle,
  Loader2,
  TrendingUp,
  Users,
  DollarSign,
  Timer,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export default function AdminAuctionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string>('');
  
  // Edit Dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editFormData, setEditFormData] = useState({
    startingPrice: '',
    reservePrice: '',
    bidIncrement: '',
    startTime: '',
    endTime: ''
  });

  useEffect(() => {
    loadAuction();
    loadBids();

    // Connect WebSocket
    websocketService.connect(() => {
      console.log('Admin WebSocket connected for auction', id);

      // Subscribe to bid updates
      const bidSubscription = websocketService.subscribeToAuction(Number(id), (message: BidUpdateMessage) => {
        console.log('Admin: New bid update:', message);

        setAuction(prev => prev ? {
          ...prev,
          currentPrice: message.newPrice,
          totalBids: message.totalBids,
          timeRemaining: message.timeRemaining
        } : null);

        toast.info(`New bid: ₹${message.newPrice.toLocaleString()} by ${message.bidderName}`);
        loadBids();
      });

      // Subscribe to status updates
      const statusSubscription = websocketService.subscribeToAuctionStatus(Number(id), (message: AuctionStatusMessage) => {
        console.log('Admin: Auction status update:', message);

        setAuction(prev => prev ? {
          ...prev,
          status: message.status,
          winnerName: message.winnerName,
          winnerId: message.winnerId
        } : null);

        toast.info(message.message);
      });

      return () => {
        if (bidSubscription) bidSubscription.unsubscribe();
        if (statusSubscription) statusSubscription.unsubscribe();
      };
    });

    // Countdown timer
    const timer = setInterval(() => {
      updateCountdown();
    }, 1000);

    return () => {
      clearInterval(timer);
      websocketService.disconnect();
    };
  }, [id]);

  const loadAuction = async () => {
    try {
      const response = await auctionService.getAuctionByIdAdmin(Number(id));
      setAuction(response.data);
      setLoading(false);
    } catch (error: any) {
      toast.error('Failed to load auction');
      console.error(error);
      setLoading(false);
    }
  };

  const loadBids = async () => {
    try {
      const response = await auctionService.getBidHistory(Number(id));
      setBids(response.data);
    } catch (error: any) {
      console.error('Failed to load bids:', error);
    }
  };

  const updateCountdown = () => {
    if (!auction) return;

    const end = new Date(auction.endTime).getTime();
    const now = new Date().getTime();
    const distance = end - now;

    if (distance < 0) {
      setTimeLeft('ENDED');
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (days > 0) {
      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    } else {
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      ACTIVE: 'bg-green-500 text-white',
      ENDING_SOON: 'bg-red-500 text-white animate-pulse',
      UPCOMING: 'bg-blue-500 text-white',
      ENDED: 'bg-gray-500 text-white',
      CANCELLED: 'bg-red-700 text-white'
    };

    return badges[status] || 'bg-gray-500 text-white';
  };

  const handleOpenEdit = () => {
    if (!auction) return;
    
    setEditFormData({
      startingPrice: auction.startingPrice.toString(),
      reservePrice: auction.reservePrice.toString(),
      bidIncrement: auction.bidIncrement.toString(),
      startTime: new Date(auction.startTime).toISOString().slice(0, 16),
      endTime: new Date(auction.endTime).toISOString().slice(0, 16)
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateAuction = async () => {
    if (!auction) return;

    setSaving(true);
    try {
      const request: UpdateAuctionRequest = {
        startingPrice: parseFloat(editFormData.startingPrice),
        reservePrice: parseFloat(editFormData.reservePrice),
        bidIncrement: parseFloat(editFormData.bidIncrement),
        startTime: editFormData.startTime,
        endTime: editFormData.endTime
      };

      const response = await auctionService.updateAuction(auction.id, request);
      
      if (response.data.success) {
        toast.success('Auction updated successfully!');
        setIsEditDialogOpen(false);
        loadAuction();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update auction');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelAuction = async () => {
    if (!auction) return;
    if (!confirm(`Are you sure you want to cancel this auction?`)) return;

    try {
      const response = await auctionService.cancelAuction(auction.id);
      if (response.data.success) {
        toast.success('Auction cancelled successfully');
        loadAuction();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to cancel auction');
    }
  };

  const handleExtendAuction = async () => {
    if (!auction) return;
    const minutes = prompt('How many minutes to extend?', '30');
    if (!minutes) return;

    try {
      const response = await auctionService.extendAuction(auction.id, parseInt(minutes));
      if (response.data.success) {
        toast.success(`Auction extended by ${minutes} minutes`);
        loadAuction();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to extend auction');
    }
  };

  const handleEndAuction = async () => {
    if (!auction) return;
    if (!confirm('Are you sure you want to end this auction now?')) return;

    try {
      const response = await auctionService.endAuctionManually(auction.id);
      if (response.data.success) {
        toast.success('Auction ended successfully');
        loadAuction();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to end auction');
    }
  };

  const handleDeleteAuction = async () => {
    if (!auction) return;
    if (!confirm('Are you sure you want to delete this auction? This cannot be undone.')) return;

    try {
      const response = await auctionService.deleteAuction(auction.id);
      if (response.data.success) {
        toast.success('Auction deleted successfully');
        navigate('/admin/auctions');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete auction');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading auction...</p>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Auction not found</h2>
          <EnhancedButton onClick={() => navigate('/admin/auctions')}>
            Back to Auctions
          </EnhancedButton>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
    {/* Header - Responsive */}
    <div className="mb-4 sm:mb-6">
      <EnhancedButton
        variant="ghost"
        onClick={() => navigate('/admin/auctions')}
        className="mb-4"
        size="sm"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Auctions
      </EnhancedButton>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Auction Details</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Monitor and manage this auction</p>
        </div>
        <Badge className={getStatusBadge(auction.status) + ' text-sm sm:text-lg px-3 sm:px-4 py-1 sm:py-2 whitespace-nowrap'}>
          {auction.status.replace('_', ' ')}
        </Badge>
      </div>
    </div>

    {/* Quick Stats - Responsive Grid */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Current Price</p>
              <p className="text-lg sm:text-2xl font-bold text-green-600">
                ₹{auction.currentPrice.toLocaleString()}
              </p>
            </div>
            <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Total Bids</p>
              <p className="text-lg sm:text-2xl font-bold">{auction.totalBids}</p>
            </div>
            <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Bidders</p>
              <p className="text-lg sm:text-2xl font-bold">
                {new Set(bids.map(b => b.userId)).size}
              </p>
            </div>
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Time Left</p>
              <p className={`text-base sm:text-2xl font-bold ${
                auction.status === 'ENDING_SOON' ? 'text-red-600 animate-pulse' : ''
              }`}>
                {timeLeft}
              </p>
            </div>
            <Timer className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Main Content - Responsive Layout */}
    <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Left Column - Product & Auction Info */}
      <div className="lg:col-span-1 space-y-4 sm:space-y-6">
        {/* Product Card */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Product Details</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <img
              src={"http://localhost:8080"+(auction.product.images?.[0] || '/placeholder.jpg')}
              alt={auction.product?.name}
              className="w-full h-40 sm:h-48 object-cover rounded-lg mb-3 sm:mb-4"
            />
            <h3 className="text-lg sm:text-xl font-bold mb-2">{auction.product.name}</h3>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category:</span>
                <span className="font-medium">{auction.product.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Metal:</span>
                <span className="font-medium">{auction.product.metal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Regular Price:</span>
                <span className="font-medium">
                  ₹{auction.product.price?.toLocaleString() || '0'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Auction Info Card */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Auction Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3 text-xs sm:text-sm p-4 sm:p-6 pt-0">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Starting Price:</span>
              <span className="font-semibold">₹{auction.startingPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reserve Price:</span>
              <span className="font-semibold">₹{auction.reservePrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bid Increment:</span>
              <span className="font-semibold">₹{auction.bidIncrement.toLocaleString()}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Start Time:</span>
              <span className="font-medium text-right">
                {new Date(auction.startTime).toLocaleString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">End Time:</span>
              <span className="font-medium text-right">
                {new Date(auction.endTime).toLocaleString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created By:</span>
              <span className="font-medium">{auction.createdByName}</span>
            </div>
            {auction.winnerName && (
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                    Winner:
                  </span>
                  <span className="font-bold text-green-600">{auction.winnerName}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin Actions */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Admin Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-4 sm:p-6 pt-0">
            {auction.status === 'UPCOMING' && (
              <EnhancedButton
                variant="outline"
                className="w-full text-sm sm:text-base"
                onClick={handleOpenEdit}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Auction
              </EnhancedButton>
            )}

            {auction.status === 'ACTIVE' && (
              <>
                <EnhancedButton
                  variant="outline"
                  className="w-full text-sm sm:text-base"
                  onClick={handleExtendAuction}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Extend Time
                </EnhancedButton>
                <EnhancedButton
                  variant="outline"
                  className="w-full text-sm sm:text-base"
                  onClick={handleEndAuction}
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  End Now
                </EnhancedButton>
              </>
            )}

            {(auction.status === 'ACTIVE' || auction.status === 'UPCOMING') && (
              <EnhancedButton
                variant="destructive"
                className="w-full text-sm sm:text-base"
                onClick={handleCancelAuction}
              >
                <Ban className="h-4 w-4 mr-2" />
                Cancel Auction
              </EnhancedButton>
            )}

            {(auction.status === 'UPCOMING' || auction.status === 'CANCELLED') && (
              <EnhancedButton
                variant="destructive"
                className="w-full text-sm sm:text-base"
                onClick={handleDeleteAuction}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Auction
              </EnhancedButton>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Live Bid Feed */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Live Bid Feed ({bids.length} bids)</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 sm:pt-0">
            <div className="max-h-[400px] sm:max-h-[600px] overflow-y-auto">
              {bids.length === 0 ? (
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No bids yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[120px]">Bidder</TableHead>
                        <TableHead className="min-w-[100px]">Amount</TableHead>
                        <TableHead className="min-w-[120px]">Time</TableHead>
                        <TableHead className="min-w-[80px]">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bids.map((bid) => (
                        <TableRow
                          key={bid.id}
                          className={bid.isWinning ? 'bg-green-50' : ''}
                        >
                          <TableCell className="font-medium text-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                              <span className="truncate">{bid.userName}</span>
                              {bid.isWinning && (
                                <Badge className="bg-green-500 text-xs w-fit">Winning</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-bold text-green-600 text-sm whitespace-nowrap">
                            ₹{bid.amount.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(bid.bidTime).toLocaleString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </TableCell>
                          <TableCell>
                            {bid.autoExtend && (
                              <Badge variant="secondary" className="text-xs">Extended</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

      {/* Edit Auction Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Auction</DialogTitle>
            <DialogDescription>
              Update auction details (only available for upcoming auctions)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Starting Price</Label>
                <Input
                  type="number"
                  value={editFormData.startingPrice}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, startingPrice: e.target.value }))}
                />
              </div>
              <div>
                <Label>Reserve Price</Label>
                <Input
                  type="number"
                  value={editFormData.reservePrice}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, reservePrice: e.target.value }))}
                />
              </div>
              <div>
                <Label>Bid Increment</Label>
                <Input
                  type="number"
                  value={editFormData.bidIncrement}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, bidIncrement: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Time</Label>
                <Input
                  type="datetime-local"
                  value={editFormData.startTime}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div>
                <Label>End Time</Label>
                <Input
                  type="datetime-local"
                  value={editFormData.endTime}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <EnhancedButton variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </EnhancedButton>
            <EnhancedButton onClick={handleUpdateAuction} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Auction'
              )}
            </EnhancedButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}