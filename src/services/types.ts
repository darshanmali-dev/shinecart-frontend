export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  image: string;
  images?: string[];          // multiple images array
  category: string;
  description: string;
  stone: string;
  metal: string;
  discount: number;
  isWishlisted: boolean;
  badge: string;
  sku: string;
  availability: string;
  stockQuantity: number;      // was optional (?), now required
  sizes?: string[];           // available sizes
  features?: string[];        // product features list
  specifications?: {          // product specifications
    label: string;
    value: string;
  }[];
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  quantity: number;
  size: string;
  image: string;
  category: string;
  availability: string;
}

export interface WishlistItem {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  availability: string;
}

export interface Collection {
  id: number;
  name: string;
  description: string;
  image: string;
  itemCount: number;
  startingPrice: string;
}

export interface Testimonial {
  name: string;
  rating: number;
  text: string;
  purchase: string;
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface LiveAuction {
  id: number;
  title: string;
  description: string;
  currentBid: number;
  startingBid: number;
  bidCount: number;
  watchers: number;
  timeLeft: string;
  image: string;
  status: string;
  category: string;
}

export interface UpcomingAuction {
  id: number;
  title: string;
  description: string;
  startingBid: number;
  startTime: string;
  watchers: number;
  image: string;
  category: string;
}

export interface AuctionResult {
  id: number;
  title: string;
  finalBid: number;
  winner: string;
  endTime: string;
  image: string;
}

export interface BidHistoryEntry {
  bidder: string;
  amount: number;
  time: string;
}

export interface OrderData {
  orderNumber: string;
  status: string;
  orderDate: string;
  expectedDelivery: string;
  items: { id: number; name: string; price: number; quantity: number; image: string }[];
  total: number;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  trackingSteps: {
    status: string;
    date: string;
    time: string;
    description: string;
    completed: boolean;
    icon: string;
    current?: boolean;
  }[];
}

export interface AdminStats {
  title: string;
  value: string;
  change: string;
  icon: string;
}

export interface LowStockItem {
  name: string;
  stock: number;
  category: string;
}

export interface FilterOption {
  id: string;
  name: string;
  count: number;
}

export interface ProductDetail {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  category: string;
  metal: string;
  stone: string;
  discount: number;
  isWishlisted: boolean;
  badge: string;
  sku: string;
  stockQuantity: number;
  availability: string;
  images: string[];
  sizes: string[];
  description: string;
  features: string[];
  specifications: { label: string; value: string }[];
}

export interface Review {
  id: number;
  name: string;
  rating: number;
  date: string;
  text: string;
  verified: boolean;
}

export interface RelatedProduct {
  id: number;
  name: string;
  price: number;
  image: string;
  rating: number;
}

// Add these to your existing types.ts file

export interface BidUpdateMessage {
  auctionId: number;
  newPrice: number;
  bidderName: string;
  bidTime: string;
  totalBids: number;
  timeRemaining: number;
  timeExtended: boolean;
}

export interface AuctionStatusMessage {
  auctionId: number;
  status: 'UPCOMING' | 'ACTIVE' | 'ENDING_SOON' | 'ENDED' | 'CANCELLED';
  winnerName?: string;
  winnerId?: number;
  finalPrice?: number;
  message: string;
}