import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCartWishlist } from '@/context/CartWishlistContext.tsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  Gem,
  Sparkles,
  Mic
} from 'lucide-react';
import { toast } from 'sonner';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const { cartCount, wishlistCount } = useCartWishlist();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  // Handle search
  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
      setSearchQuery('');
    }
  };

  // Handle search on Enter key
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
    }
  };

  // Voice search functionality
  const handleVoiceSearch = () => {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error('Voice search is not supported in your browser. Please try Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      toast.info('🎤 Listening... Speak now!');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      toast.success(`Heard: "${transcript}"`);
      handleSearch(transcript);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error === 'no-speech') {
        toast.error('No speech detected. Please try again.');
      } else if (event.error === 'not-allowed') {
        toast.error('Microphone access denied. Please enable it in browser settings.');
      } else {
        toast.error('Voice search error. Please try again.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Metal type sublinks
  const categoryItems = [
    { href: '/products', label: 'All Jewellery', icon: Gem },
    { href: '/products?metal=Gold', label: 'Gold', icon: Sparkles },
    { href: '/products?metal=Silver', label: 'Silver', icon: Gem },
    { href: '/products?metal=Platinum', label: 'Platinum', icon: Sparkles },
    { href: '/products?metal=Rose Gold', label: 'Rose Gold', icon: Gem },
    { href: '/products?metal=White Gold', label: 'White Gold', icon: Sparkles },
    { href: '/auctions', label: 'Live Bidding', icon: Gem, isLive: true }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <Link to="/" className="flex items-center space-x-2 group small-screen hidden">
            <img src="/logo.png" alt="ShineCart Logo" className="h-16 w-auto" />
          </Link>
      <div className="container mx-auto px-4">
        {/* Top Header */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group normal-screen">
            <img src="/logo.png" alt="ShineCart Logo" className="h-16 w-auto " />
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Search for Gold Jewellery, Diamond Jewellery and more..."
                className="pl-10 pr-12 bg-muted/50 border-muted-foreground/20 rounded-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
              />
              <Button
                variant="ghost"
                size="icon"
                className={`absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors ${
                  isListening ? 'text-destructive animate-pulse' : ''
                }`}
                onClick={handleVoiceSearch}
                disabled={isListening}
              >
                <Mic className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (user?.role === 'admin') {
                      navigate('/admin/dashboard');
                    } else {
                      navigate('/user/home');
                    }
                  }}
                  className="text-sm"
                >
                  <User className="h-4 w-4 mr-1" />
                  {user?.name || 'Profile'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    logout();
                    navigate('/');
                    toast.success('Logged out successfully');
                  }}
                  className="text-sm"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="icon" asChild className="relative">
                <Link to="/login">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            )}
            
            {/* Wishlist Icon with Count */}
            <Button variant="ghost" size="icon" asChild className="relative">
              <Link to="/wishlist">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center bg-destructive text-destructive-foreground text-[10px] font-bold">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </Badge>
                )}
              </Link>
            </Button>
            
            {/* Cart Icon with Count */}
            <Button variant="ghost" size="icon" asChild className="relative">
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold">
                    {cartCount > 9 ? '9+' : cartCount}
                  </Badge>
                )}
              </Link>
            </Button>
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Category Navigation - Metal Types */}
        <div className="hidden lg:flex items-center justify-center border-t border-border py-4">
          <div className="flex items-center space-x-8">
            {categoryItems.map((item) => {
              const IconComponent = item.icon;
              
              const isActivePath = location.search.includes(`metal=${item.label}`);
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary group relative ${
                    isActivePath
                      ? 'text-primary' 
                      : 'text-foreground/70'
                  }`}
                >
                  <IconComponent className="h-4 w-4 group-hover:text-primary transition-colors" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Mobile Search */}
        <div className="lg:hidden py-3 border-t border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="Search jewellery..."
              className="pl-10 pr-12 bg-muted/50 rounded-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
            />
            <Button
              variant="ghost"
              size="icon"
              className={`absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors ${
                isListening ? 'text-destructive animate-pulse' : ''
              }`}
              onClick={handleVoiceSearch}
              disabled={isListening}
            >
              <Mic className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-border py-3">
            <div className="flex flex-col space-y-3">
              {categoryItems.map((item) => {
                const IconComponent = item.icon;
                const isActivePath = location.search.includes(`metal=${item.label}`);
                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    className={`flex items-center space-x-3 text-sm font-medium transition-colors hover:text-primary py-2 relative ${
                      isActivePath
                        ? 'text-primary' 
                        : 'text-foreground/70'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;