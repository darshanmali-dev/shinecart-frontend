import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auctionService, Auction } from '../services/auctionService';
import { toast } from 'sonner';

export default function Auctions() {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'ended'>('active');
  const [loading, setLoading] = useState(true);
  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    loadAuctions();
  }, [filter]);

  const loadAuctions = async () => {
    setLoading(true);
    try {
      let response;
      
      switch (filter) {
        case 'active':
          response = await auctionService.getActiveAuctions();
          break;
        case 'upcoming':
          response = await auctionService.getUpcomingAuctions();
          break;
        case 'ended':
          response = await auctionService.getEndedAuctions();
          break;
        default:
          response = await auctionService.getAllAuctions();
      }
      
      setAuctions(response.data);
    } catch (error) {
      toast.error('Failed to load auctions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      ACTIVE: 'bg-green-500 text-white',
      ENDING_SOON: 'bg-red-500 text-white',
      UPCOMING: 'bg-blue-500 text-white',
      ENDED: 'bg-gray-500 text-white',
      CANCELLED: 'bg-red-700 text-white'
    };
    
    return badges[status] || 'bg-gray-500 text-white';
  };

  const formatTimeRemaining = (seconds: number) => {
    if (seconds <= 0) return 'Ended';
    
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Live Auctions</h1>
          <p className="text-gray-600">Bid on exclusive jewellery pieces</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Auctions
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'active' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'upcoming' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('ended')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'ended' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Ended
          </button>
        </div>

        {/* Auctions Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading auctions...</p>
          </div>
        ) : auctions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600 text-lg">No auctions found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map((auction) => (
              <div
                key={auction.id}
                onClick={() => navigate(`/auction/${auction.id}`)}
                className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
              >
                {/* Image */}
                <div className="relative">
                  <img
                    src={`${BASE_URL}${auction.product.images?.[0] || '/placeholder.jpg'}`}
                    alt={auction.product.name}
                    className="w-full h-64 object-cover"
                  />
                  <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(auction.status)}`}>
                    {auction.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                    {auction.product.name}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Current Bid:</span>
                      <span className="font-bold text-green-600">
                        ₹{auction.currentPrice.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Bids:</span>
                      <span className="font-semibold">{auction.totalBids}</span>
                    </div>
                    
                    {(auction.status === 'ACTIVE' || auction.status === 'ENDING_SOON') && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Time Left:</span>
                        <span className={`font-semibold ${
                          auction.status === 'ENDING_SOON' ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {formatTimeRemaining(auction.timeRemaining)}
                        </span>
                      </div>
                    )}
                    
                    {auction.status === 'ENDED' && auction.winnerName && (
                      <div className="text-sm">
                        <span className="text-gray-600">Winner: </span>
                        <span className="font-semibold text-green-600">{auction.winnerName}</span>
                      </div>
                    )}
                  </div>

                  <button
                    className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {auction.status === 'ACTIVE' || auction.status === 'ENDING_SOON' 
                      ? 'Bid Now' 
                      : 'View Details'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}