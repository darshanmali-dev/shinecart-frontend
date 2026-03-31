import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Bidding from "./pages/Bidding";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AuthLogin from "./pages/Login";
import AuthRegister from "./pages/Register";
import OrderTracking from "./pages/OrderTracking";
import UserHome from "./pages/UserHome";
import NotFound from "./pages/NotFound";
import { CartWishlistProvider } from "@/context/CartWishlistContext";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Auctions from './pages/Auctions';
import LiveAuction from './pages/LiveAuction';
import AdminAuctionDetail from "./pages/admin/AdminAuctionDetail";
import AdminAuctions from "./pages/admin/AdminAuctions";
import MyOrders from "./pages/MyOrders";
import './styles/custom.css';
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCustomers from "./pages/admin/AdminCustomers";
import ScrollToTop from "./components/common/ScrollToTop";
import ReportsPage from "./pages/admin/ReportsPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartWishlistProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Public Routes - Accessible to everyone */}
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/products" element={<Layout><Products /></Layout>} />

            
            
            {/* Auth Routes - Only accessible when NOT logged in */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <AuthLogin />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <AuthRegister />
                </PublicRoute>
              } 
            />
            <Route 
              path="/forgot-password" 
              element={
                <PublicRoute>
                  <ForgotPasswordPage />
                </PublicRoute>
              } 
            />
            <Route path="/my-orders" element={<MyOrders />} />
            
            {/* Protected User Routes - Requires authentication */}
            <Route 
              path="/cart" 
              element={
                <ProtectedRoute requiredRole="user">
                  <Layout><Cart /></Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/product/:id" 
              element={
                <ProtectedRoute requiredRole="user">
                  <Layout><ProductDetail /></Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/wishlist" 
              element={
                <ProtectedRoute requiredRole="user">
                  <Layout><Wishlist /></Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/bidding" 
              element={
                <ProtectedRoute requiredRole="user">
                  <Layout><Bidding /></Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/checkout" 
              element={
                <ProtectedRoute requiredRole="user">
                  <Layout><Checkout /></Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/order-confirmation/:orderNumber" 
              element={
                <ProtectedRoute requiredRole="user">
                  <Layout><OrderConfirmation /></Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/order-tracking/:orderNumber?" 
              element={
                <ProtectedRoute requiredRole="user">
                  <Layout><OrderTracking /></Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tracking" 
              element={
                <ProtectedRoute requiredRole="user">
                  <Layout><OrderTracking /></Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/user/home" 
              element={
                <ProtectedRoute requiredRole="user">
                  <Layout><UserHome /></Layout>
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Admin Routes - Requires admin role */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <Layout showFooter={false}><AdminDashboard /></Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <Layout showFooter={false}><AdminDashboard /></Layout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/admin/orders" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <Layout showFooter={false}><AdminOrders /></Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/reports" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <ReportsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/customers"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Layout showFooter={false}><AdminCustomers /></Layout>
                </ProtectedRoute>
              }
            />

            {/* Catch-all route - Must be last */}
            <Route path="*" element={<NotFound />} />

            {/* Auction routes */}
        <Route path="/auctions" element={<Layout><Auctions /></Layout>} />
        <Route path="/auction/:id" element={<Layout><LiveAuction /></Layout>} />

        // Inside your Routes component, add:
<Route path="/admin/auctions" element={<ProtectedRoute><AdminAuctions /></ProtectedRoute>} />
<Route path="/admin/auctions/:id" element={<ProtectedRoute><AdminAuctionDetail /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </CartWishlistProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;