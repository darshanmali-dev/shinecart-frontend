import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { 
  Search, 
  Grid3X3, 
  List, 
  Heart, 
  Star,
  Filter,
  X,
  Loader2
} from 'lucide-react';
import { productService } from '@/services/productService';
import { wishlistService } from '@/services/wishlistService';
import { cartService } from '@/services/cartService';
import { useCartWishlist } from '@/context/CartWishlistContext.tsx';
import type { Product } from '@/services/types';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Products = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const isAdmin = user?.role === 'admin';
  const { incrementCartCount, incrementWishlistCount, decrementWishlistCount , decrementCartCount} = useCartWishlist();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const BASE_URL = import.meta.env.VITE_API_URL;
  
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMetals, setSelectedMetals] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(null);
  const [customMinPrice, setCustomMinPrice] = useState('');
  const [customMaxPrice, setCustomMaxPrice] = useState('');

  // Wishlist state
  const [wishlistedItems, setWishlistedItems] = useState<number[]>([]);
  const [cartItems, setCartItems] = useState<{[productId: number]: number}>({});

  // Fetch products on mount and when URL params change
  useEffect(() => {
    fetchProducts();
    loadWishlist();
    loadCart();
    
    // Apply metal filter from URL
    const metalFromUrl = searchParams.get('metal');
    if (metalFromUrl) {
      setSelectedMetals([metalFromUrl]);
    }else {
    setSelectedMetals([]); // Clear metal filter when no metal param
  }

    const searchFromUrl = searchParams.get('search');
  if (searchFromUrl) {
    setSearchQuery(searchFromUrl);
  }else {
    setSearchQuery(''); // Clear search when no search param
  }
  }, [searchParams]);

  

  // Fetch all products
  const fetchProducts = async () => {
    setLoading(true);
    const response = await productService.getProducts();
    if (response.success) {
      setProducts(response.data);
      setFilteredProducts(response.data);
    } else {
      toast.error(response.message || 'Failed to load products');
    }
    setLoading(false);
  };

  // Load wishlist items
  const loadWishlist = async () => {
    const response = await wishlistService.getWishlist();
    if (response.success) {
      const wishlistIds = response.data.map(item => item.id);
      setWishlistedItems(wishlistIds);
    }
  };

  const loadCart = async () => {
  const response = await cartService.getCart();
  if (response.success) {
    const cartMap: {[productId: number]: number} = {};
    response.data.forEach(item => {
      cartMap[item.id] = item.quantity;
    });
    setCartItems(cartMap);
  }
};

  // Apply filters and search
  useEffect(() => {
    applyFilters();
  }, [products, searchQuery, selectedCategories, selectedMetals, selectedPriceRange, customMinPrice, customMaxPrice, sortBy]);

  const applyFilters = () => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.metal.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product =>
        selectedCategories.includes(product.category)
      );
    }

    // Metal filter
    if (selectedMetals.length > 0) {
      filtered = filtered.filter(product =>
        selectedMetals.includes(product.metal)
      );
    }

    // Price range filter
    if (selectedPriceRange) {
      const [min, max] = getPriceRange(selectedPriceRange);
      filtered = filtered.filter(product =>
        product.price >= min && (max === Infinity || product.price <= max)
      );
    }

    // Custom price filter
    if (customMinPrice || customMaxPrice) {
      const min = customMinPrice ? parseFloat(customMinPrice) : 0;
      const max = customMaxPrice ? parseFloat(customMaxPrice) : Infinity;
      filtered = filtered.filter(product =>
        product.price >= min && product.price <= max
      );
    }

    // Sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => b.id - a.id);
        break;
      default:
        // Featured - keep original order
        break;
    }

    setFilteredProducts(filtered);
  };

  const getPriceRange = (range: string): [number, number] => {
    switch (range) {
      case 'under-25k': return [0, 25000];
      case '25k-50k': return [25000, 50000];
      case '50k-1l': return [50000, 100000];
      case 'above-1l': return [100000, Infinity];
      default: return [0, Infinity];
    }
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleMetalToggle = (metal: string) => {
    setSelectedMetals(prev =>
      prev.includes(metal)
        ? prev.filter(m => m !== metal)
        : [...prev, metal]
    );
  };

  const handlePriceRangeToggle = (range: string) => {
    setSelectedPriceRange(prev => prev === range ? null : range);
  };

  const handleAddToCart = async (product: Product) => {
  if (!isAuthenticated) {
    toast.error('Please login to add items to cart');
    navigate('/login');
    return;
  }

  const currentQty = cartItems[product.id] || 0;

  const response = await cartService.addToCart({
    productId: product.id,
    quantity: 1,
    size: '7'
  });

  if (response.success) {
    // Update cart state locally
    setCartItems(prev => ({
      ...prev,
      [product.id]: currentQty + 1
    }));
    incrementCartCount();
    toast.success(`${product.name} added to cart!`);
  } else {
    toast.error(response.message || 'Failed to add to cart');
  }
};

  const handleToggleWishlist = async (product: Product) => {

    if (!isAuthenticated) {
          toast.error('Please login to add items to wishlist');
          navigate('/login');
          return;
        }
    if (wishlistedItems.includes(product.id)) {
      const response = await wishlistService.removeFromWishlist(product.id);
      if (response.success) {
        setWishlistedItems(prev => prev.filter(id => id !== product.id));
        decrementWishlistCount(); // Update navbar count
        toast.info(`${product.name} removed from wishlist`);
      }
    } else {
      const response = await wishlistService.addToWishlist(product.id);
      if (response.success) {
        setWishlistedItems(prev => [...prev, product.id]);
        incrementWishlistCount(); // Update navbar count
        toast.success(`${product.name} added to wishlist!`);
      }
    }
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedMetals([]);
    setSelectedPriceRange(null);
    setCustomMinPrice('');
    setCustomMaxPrice('');
    setSearchQuery('');
    toast.info('All filters cleared');
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const categories = [
    { id: 'Rings', name: 'Rings', count: products.filter(p => p.category === 'Rings').length },
    { id: 'Necklaces', name: 'Necklaces', count: products.filter(p => p.category === 'Necklaces').length },
    { id: 'Earrings', name: 'Earrings', count: products.filter(p => p.category === 'Earrings').length },
    { id: 'Bracelets', name: 'Bracelets', count: products.filter(p => p.category === 'Bracelets').length },
  ];

  const metals = [
    { id: 'Gold', name: 'Gold', count: products.filter(p => p.metal === 'Gold').length },
    { id: 'Silver', name: 'Silver', count: products.filter(p => p.metal === 'Silver').length },
    { id: 'Platinum', name: 'Platinum', count: products.filter(p => p.metal === 'Platinum').length },
    { id: 'Rose Gold', name: 'Rose Gold', count: products.filter(p => p.metal === 'Rose Gold').length },
  ];

  const priceRanges = [
    { id: 'under-25k', name: 'Under ₹25,000' },
    { id: '25k-50k', name: '₹25,000 - ₹50,000' },
    { id: '50k-1l', name: '₹50,000 - ₹1,00,000' },
    { id: 'above-1l', name: 'Above ₹1,00,000' },
  ];

  const FilterSection = ({ title, items, type = 'checkbox', onToggle, selected }) => (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">{title}</h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center space-x-3">
            <Checkbox 
              id={item.id} 
              checked={selected?.includes ? selected.includes(item.id) : selected === item.id}
              onCheckedChange={() => onToggle(item.id)}
            />
            <label 
              htmlFor={item.id} 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
            >
              <div className="flex justify-between">
                <span>{item.name}</span>
                {item.count !== undefined && <span className="text-muted-foreground">({item.count})</span>}
              </div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-luxury text-4xl font-bold mb-4">Jewellery Collections</h1>
        <p className="text-muted-foreground text-lg">
          Discover our exquisite range of handcrafted jewellery pieces
        </p>
      </div>

      {/* Search and Controls */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search jewellery, brands, or styles..." 
            className="pl-10 h-12"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48 h-12">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center border rounded-lg">
            <EnhancedButton
              variant={view === 'grid' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setView('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </EnhancedButton>
            <EnhancedButton
              variant={view === 'list' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setView('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </EnhancedButton>
          </div>

          <EnhancedButton
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </EnhancedButton>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className={`lg:w-80 space-y-8 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between lg:hidden">
              <h2 className="font-luxury text-xl font-semibold">Filters</h2>
              <EnhancedButton
                variant="ghost"
                size="icon"
                onClick={() => setShowFilters(false)}
              >
                <X className="h-4 w-4" />
              </EnhancedButton>
            </div>
            
            <FilterSection 
              title="Category" 
              items={categories} 
              onToggle={handleCategoryToggle}
              selected={selectedCategories}
            />
            
            <FilterSection 
              title="Metal Type" 
              items={metals} 
              onToggle={handleMetalToggle}
              selected={selectedMetals}
            />
            
            <FilterSection 
              title="Price Range" 
              items={priceRanges} 
              onToggle={handlePriceRangeToggle}
              selected={selectedPriceRange}
            />
            
            {/* Custom Price Range */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Custom Price Range</h3>
              <div className="flex items-center space-x-4">
                <Input 
                  placeholder="Min" 
                  className="flex-1" 
                  type="number"
                  value={customMinPrice}
                  onChange={(e) => setCustomMinPrice(e.target.value)}
                />
                <span className="text-muted-foreground">to</span>
                <Input 
                  placeholder="Max" 
                  className="flex-1" 
                  type="number"
                  value={customMaxPrice}
                  onChange={(e) => setCustomMaxPrice(e.target.value)}
                />
              </div>
            </div>

            <EnhancedButton variant="outline" className="w-full" onClick={handleClearFilters}>
              Clear All Filters
            </EnhancedButton>
          </Card>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              Showing {filteredProducts.length} of {products.length} products
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No products found</p>
              <EnhancedButton 
                variant="outline" 
                className="mt-4"
                onClick={handleClearFilters}
              >
                Clear Filters
              </EnhancedButton>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              view === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {filteredProducts.map((product) => (
                <Card key={product.id} className={`card-product group ${
                  view === 'list' ? 'flex flex-row' : ''
                }`}>
                  <div className={`relative overflow-hidden ${
                    view === 'list' ? 'w-48 h-48' : 'aspect-square'
                  }`}>
                    <img 
                      src={BASE_URL + product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                    {product.badge && (
                      <div className="absolute top-3 left-3">
                        <Badge variant="secondary" className="bg-primary text-primary-foreground">
                          {product.badge}
                        </Badge>
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <EnhancedButton
                        variant="ghost"
                        size="icon"
                        className={`bg-background/80 backdrop-blur-sm ${
                          wishlistedItems.includes(product.id) ? 'text-destructive' : 'text-muted-foreground'
                        } hover:text-destructive`}
                        onClick={() =>{if(isAdmin){
                                            toast.error("Admin cannot add to wishlist!!")
                                            navigate('/admin/dashboard')
                                          }else{ handleToggleWishlist(product)}}}
                      >
                        <Heart className={`h-4 w-4 ${wishlistedItems.includes(product.id) ? 'fill-current' : ''}`} />
                      </EnhancedButton>
                    </div>
                    {product.discount > 0 && (
                      <div className="absolute bottom-3 left-3">
                        <Badge variant="destructive">
                          {product.discount}% OFF
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className={`p-4 ${view === 'list' ? 'flex-1 flex flex-col justify-between' : ''}`}>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{product.metal}</span>
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-baseline space-x-2">
                        <span className="text-2xl font-bold text-primary">
                          ₹{product.price.toLocaleString()}
                        </span>
                        {product.originalPrice > product.price && (
                          <span className="text-sm text-muted-foreground line-through">
                            ₹{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <div className="flex space-x-2">
  {cartItems[product.id] ? (
    // Show quantity controls if already in cart
    <div className="flex items-center gap-1 flex-1">
      <EnhancedButton
        size="sm"
        variant="outline"
        className="h-8 w-8 p-0"
        onClick={async () => {
          const newQty = cartItems[product.id] - 1;
          decrementCartCount();
          if (newQty === 0) {
            await cartService.removeFromCart(product.id);
            setCartItems(prev => {
              const updated = { ...prev };
              delete updated[product.id];
              return updated;
            });
            decrementCartCount();
          } else {
            await cartService.updateQuantity(product.id, newQty);
            setCartItems(prev => ({ ...prev, [product.id]: newQty }));
          }
        }}
      >
        −
      </EnhancedButton>
      <span className="flex-1 text-center text-sm font-semibold">
        {cartItems[product.id]} in cart
      </span>
      <EnhancedButton
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => handleAddToCart(product)}
      >
        +
      </EnhancedButton>
    </div>
  ) : (
    // Show Add to Cart button if not in cart
    <EnhancedButton
      size="sm"
      className="flex-1"
      onClick={() =>{ if(isAdmin){
            toast.error("Admin cannot add to cart!!")
            navigate('/admin/dashboard')
          }
          else{

            handleAddToCart(product)}}
          }
    >
      Add to Cart
    </EnhancedButton>
  )}
  <EnhancedButton variant="outline" size="sm" asChild>
    <Link to={`/product/${product.id}`}>
      View Details
    </Link>
  </EnhancedButton>
</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;