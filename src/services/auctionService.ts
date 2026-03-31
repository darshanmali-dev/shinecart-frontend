import api from './api';

export interface Auction {
  id: number;
  product: {
    id: number;
    name: string;
    price: number;
    images: string[];
    category: string;
    metal: string;
    description: string;
  };
  startingPrice: number;
  reservePrice: number;
  currentPrice: number;
  bidIncrement: number;
  startTime: string;
  endTime: string;
  status: 'UPCOMING' | 'ACTIVE' | 'ENDING_SOON' | 'ENDED' | 'CANCELLED';
  winnerName?: string;
  winnerId?: number;
  totalBids: number;
  timeRemaining: number;
  createdByName: string;
  createdAt: string;
}

export interface UpdateAuctionRequest {
  startingPrice?: number;
  reservePrice?: number;
  bidIncrement?: number;
  startTime?: string;
  endTime?: string;
}

export interface Bid {
  id: number;
  auctionId: number;
  auctionTitle: string;
  userId: number;
  userName: string;
  amount: number;
  bidTime: string;
  isWinning: boolean;
  autoExtend: boolean;
}

export interface PlaceBidRequest {
  auctionId: number;
  amount: number;
}

export interface CreateAuctionRequest {
  productId: number;
  startingPrice: number;
  reservePrice: number;
  bidIncrement: number;
  startTime: string;
  endTime: string;
}

export interface AuctionStats {
  totalAuctions: number;
  activeAuctions: number;
  totalBids: number;
  totalRevenue: number;
}

export const auctionService = {
  // ========== PUBLIC ENDPOINTS ==========
  
  getAllAuctions: () => api.get<Auction[]>('/auctions'),
  
  getActiveAuctions: () => api.get<Auction[]>('/auctions/active'),
  
  getUpcomingAuctions: () => api.get<Auction[]>('/auctions/upcoming'),
  
  getEndedAuctions: () => api.get<Auction[]>('/auctions/ended'),
  
  getAuctionById: (id: number) => api.get<Auction>(`/auctions/${id}`),
  
  getAuctionsByProduct: (productId: number) => 
    api.get<Auction[]>(`/auctions/product/${productId}`),
  
  // ========== BID ENDPOINTS ==========
  
  placeBid: (request: PlaceBidRequest) => 
    api.post<{ success: boolean; message: string; bid: Bid }>('/bids', request),
  
  getBidHistory: (auctionId: number) => 
    api.get<Bid[]>(`/bids/auction/${auctionId}`),
  
  getMyBids: () => api.get<Bid[]>('/bids/my-bids'),
  
  getWinningBid: (auctionId: number) => 
    api.get<Bid>(`/bids/auction/${auctionId}/winning`),
  
  checkUserBid: (auctionId: number) => 
    api.get<{ hasBid: boolean; maxBid: number }>(`/bids/check/${auctionId}`),
  
  getMyWinningBids: () => api.get<Bid[]>('/bids/winning'),
  
  // ========== ADMIN ENDPOINTS ==========
  
  // Get all auctions for admin with filters
  getAllAuctionsAdmin: (status?: string, search?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    return api.get<Auction[]>(`/admin/auctions?${params.toString()}`);
  },
  
  // Get single auction (admin)
  getAuctionByIdAdmin: (id: number) => 
    api.get<Auction>(`/admin/auctions/${id}`),
  
  // Create auction
  createAuction: (request: CreateAuctionRequest) => 
    api.post<{ success: boolean; message: string; auction: Auction }>('/admin/auctions', request),
  
  // Update auction
  updateAuction: (id: number, request: UpdateAuctionRequest) => 
    api.put<{ success: boolean; message: string; auction: Auction }>(`/admin/auctions/${id}`, request),
  
  // Delete auction
  deleteAuction: (id: number) => 
    api.delete<{ success: boolean; message: string }>(`/admin/auctions/${id}`),
  
  // Cancel auction
  cancelAuction: (id: number) => 
    api.put<{ success: boolean; message: string; auction: Auction }>(`/admin/auctions/${id}/cancel`),
  
  // Extend auction
  extendAuction: (id: number, minutes: number) => 
    api.put<{ success: boolean; message: string; auction: Auction }>(`/admin/auctions/${id}/extend?minutes=${minutes}`),
  
  // End auction manually
  endAuctionManually: (id: number) => 
    api.put<{ success: boolean; message: string; auction: Auction }>(`/admin/auctions/${id}/end`),
  
  // Get auction statistics
  getAuctionStats: () => 
    api.get<AuctionStats>('/admin/auctions/statistics'),
};