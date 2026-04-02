import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import websocketService from '../services/websocketService';
import { auctionService, Auction, Bid } from '../services/auctionService';
import { BidUpdateMessage, AuctionStatusMessage } from '../services/types';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

export default function LiveAuction() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [placingBid, setPlacingBid] = useState(false);

  useEffect(() => {
    loadAuction();
    loadBids();

    // Connect WebSocket
    websocketService.connect(() => {
      console.log('WebSocket connected for auction', id);
      
      // Subscribe to bid updates
      const bidSubscription = websocketService.subscribeToAuction(Number(id), (message: BidUpdateMessage) => {
        console.log('New bid update:', message);
        
        // Update auction price and bid count
        setAuction(prev => prev ? {
          ...prev,
          currentPrice: message.newPrice,
          totalBids: message.totalBids,
          timeRemaining: message.timeRemaining
        } : null);
        
        // Show notification
        if (message.bidderName !== user?.name) {
          toast.info(`${message.bidderName} placed a bid of ₹${message.newPrice.toLocaleString()}`);
        }
        
        // Reload bid history
        loadBids();
      });
      
      // Subscribe to status updates
      const statusSubscription = websocketService.subscribeToAuctionStatus(Number(id), (message: AuctionStatusMessage) => {
        console.log('Auction status update:', message);
        
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
      const response = await auctionService.getAuctionById(Number(id));
      setAuction(response.data);
      setBidAmount(response.data.currentPrice + response.data.bidIncrement);
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

  const handlePlaceBid = async () => {
    if (!user) {
      toast.error('Please login to place a bid');
      navigate('/login');
      return;
    }

    if (bidAmount < (auction!.currentPrice + auction!.bidIncrement)) {
      toast.error(`Minimum bid is ₹${(auction!.currentPrice + auction!.bidIncrement).toLocaleString()}`);
      return;
    }

    setPlacingBid(true);
    try {
      const response = await auctionService.placeBid({
        auctionId: Number(id),
        amount: bidAmount
      });
      
      toast.success('Bid placed successfully! 🎉');
      setBidAmount(prev => prev + auction!.bidIncrement);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to place bid');
    } finally {
      setPlacingBid(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading auction...</p>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Auction not found</h2>
          <button
            onClick={() => navigate('/auctions')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Auctions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/auctions')}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4"
          >
            ← Back to Auctions
          </button>
          
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Live Auction</h1>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadge(auction.status)}`}>
              {auction.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Product Image & Details */}
          <div className="space-y-6">
            {/* Product Image */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <img 
                src={`${import.meta.env.BASE_URL}${auction.product.images?.[0] || '/placeholder.jpg'}`} 
                alt={auction.product.name}
                className="w-full h-96 object-cover"
              />
            </div>

            {/* Product Details */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {auction.product.name}
              </h2>
              
              <div className="space-y-3 text-gray-700">
                <div className="flex justify-between">
                  <span className="font-medium">Category:</span>
                  <span>{auction.product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Metal:</span>
                  <span>{auction.product.metal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Starting Price:</span>
                  <span className="text-green-600 font-semibold">
                    ₹{auction.startingPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              {auction.product.description && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-600 text-sm">{auction.product.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Bidding Area */}
          <div className="space-y-6">
            {/* Current Bid Info */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="space-y-4">
                {/* Current Price */}
                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Bid</p>
                  <p className="text-4xl font-bold text-green-600">
                    ₹{auction.currentPrice.toLocaleString()}
                  </p>
                </div>

                {/* Time Remaining */}
                <div className="flex justify-between items-center pb-4 border-b">
                  <div>
                    <p className="text-sm text-gray-600">Time Remaining</p>
                    <p className={`text-2xl font-bold ${
                      auction.status === 'ENDING_SOON' ? 'text-red-600 animate-pulse' : 'text-gray-900'
                    }`}>
                      {timeLeft}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total Bids</p>
                    <p className="text-2xl font-bold text-gray-900">{auction.totalBids}</p>
                  </div>
                </div>

                {/* Bid Increment Info */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Bid Increment:</span> ₹{auction.bidIncrement.toLocaleString()}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    Minimum next bid: ₹{(auction.currentPrice + auction.bidIncrement).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Bid Form */}
              {auction.status === 'ACTIVE' || auction.status === 'ENDING_SOON' ? (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Bid Amount
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                      <input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(Number(e.target.value))}
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min={auction.currentPrice + auction.bidIncrement}
                        step={auction.bidIncrement}
                      />
                    </div>
                    <button
                      onClick={handlePlaceBid}
                      disabled={placingBid}
                      className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {placingBid ? 'Placing...' : 'Place Bid'}
                    </button>
                  </div>
                  
                  {/* Quick Bid Buttons */}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => setBidAmount(auction.currentPrice + auction.bidIncrement)}
                      className="flex-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Min Bid
                    </button>
                    <button
                      onClick={() => setBidAmount(auction.currentPrice + (auction.bidIncrement * 5))}
                      className="flex-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                    >
                      +₹{(auction.bidIncrement * 5).toLocaleString()}
                    </button>
                    <button
                      onClick={() => setBidAmount(auction.currentPrice + (auction.bidIncrement * 10))}
                      className="flex-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                    >
                      +₹{(auction.bidIncrement * 10).toLocaleString()}
                    </button>
                  </div>
                </div>
              ) : auction.status === 'ENDED' ? (
                <div className="mt-6 p-4 bg-gray-100 rounded-lg text-center">
                  <p className="text-lg font-semibold text-gray-900 mb-2">Auction Ended</p>
                  {auction.winnerName && (
                    <p className="text-gray-700">
                      Winner: <span className="font-bold text-green-600">{auction.winnerName}</span>
                      <br />
                      Final Price: <span className="font-bold">₹{auction.currentPrice.toLocaleString()}</span>
                    </p>
                  )}
                </div>
              ) : auction.status === 'UPCOMING' ? (
                <div className="mt-6 p-4 bg-blue-100 rounded-lg text-center">
                  <p className="text-lg font-semibold text-blue-900">Auction Starting Soon</p>
                  <p className="text-sm text-blue-700 mt-2">
                    Starts: {new Date(auction.startTime).toLocaleString()}
                  </p>
                </div>
              ) : (
                <div className="mt-6 p-4 bg-red-100 rounded-lg text-center">
                  <p className="text-lg font-semibold text-red-900">Auction Cancelled</p>
                </div>
              )}
            </div>

            {/* Bid History */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Bid History ({bids.length})
              </h3>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {bids.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No bids yet. Be the first to bid!</p>
                ) : (
                  bids.map((bid) => (
                    <div 
                      key={bid.id} 
                      className={`flex justify-between items-center p-3 rounded-lg ${
                        bid.isWinning ? 'bg-green-50 border-2 border-green-500' : 'bg-gray-50'
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {bid.userName}
                          {bid.isWinning && (
                            <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                              Winning
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(bid.bidTime).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-lg font-bold text-green-600">
                        ₹{bid.amount.toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}