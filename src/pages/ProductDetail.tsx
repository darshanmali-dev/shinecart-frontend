import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { productService } from '@/services/productService';
import { cartService } from '@/services/cartService';
import { wishlistService } from '@/services/wishlistService';
import { useCartWishlist } from '@/context/CartWishlistContext';
import { useAuth } from '@/context/AuthContext';
import { 
  Heart, 
  Star, 
  Share2, 
  Truck, 
  Shield, 
  RotateCcw,
  Plus,
  Minus,
  Award,
  Loader2
} from 'lucide-react';
import type { ProductDetail } from '@/services/types';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(0);
  const { incrementCartCount, incrementWishlistCount, decrementWishlistCount , decrementCartCount } = useCartWishlist();
  const BASE_URL = 'http://localhost:8080';

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await productService.getProductById(Number(id));
        if (res.success) {
          setProduct(res.data);
          // Set default size if available
          if (res.data.sizes && res.data.sizes.length > 0) {
            setSelectedSize(res.data.sizes[0]);
          }
        } else {
          toast.error('Product not found');
          navigate('/products');
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load product');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  // Check if product is in wishlist
  useEffect(() => {
    if (!id) return;

    const checkWishlist = async () => {
      try {
        const res = await wishlistService.checkWishlist(Number(id));
        if (res.success) {
          setIsWishlisted(res.data);
        }
      } catch (err) {
        console.error('Failed to check wishlist:', err);
      }
    };

    checkWishlist();
  }, [id]);

  useEffect(() => {
  if (!id) return;

  const loadCartItem = async () => {
    try {
      const response = await cartService.getCart();
      if (response.success) {
        const cartItem = response.data.find(item => item.id === Number(id));
        if (cartItem) {
          setCartQuantity(cartItem.quantity);
        }
      }
    } catch (err) {
      console.error('Failed to load cart item:', err);
    }
  };

  loadCartItem();
}, [id]);

 const handleAddToCart = async () => {
  if (!isAuthenticated) {
    toast.error('Please login to add items to cart');
    navigate('/login');
    return;
  }
  if (!product) return;

  if (product.sizes && product.sizes.length > 0 && !selectedSize) {
    toast.error('Please select a size');
    return;
  }

  setAddingToCart(true);
  try {
    const response = await cartService.addToCart({
      productId: product.id,
      quantity: quantity,
      size: selectedSize || undefined,
    });

    if (response.success) {
      toast.success(`${product.name} added to cart!`);
      setCartQuantity(prev => prev + quantity); // ✅ Update local cart quantity
      incrementCartCount();
    } else {
      toast.error(response.message || 'Failed to add to cart');
    }
  } catch (error) {
    toast.error('Failed to add to cart');
  } finally {
    setAddingToCart(false);
  }
};

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      navigate('/login');
      return;
    }
    if (!product) return;

    try {
      if (isWishlisted) {
        const response = await wishlistService.removeFromWishlist(product.id);
        if (response.success) {
          setIsWishlisted(false);
          toast.info('Removed from wishlist');
          decrementWishlistCount();
        } else {
          toast.error(response.message || 'Failed to remove from wishlist');
        }
      } else {
        const response = await wishlistService.addToWishlist(product.id);
        if (response.success) {
          setIsWishlisted(true);
          toast.success('Added to wishlist!');
          incrementWishlistCount();
        } else {
          toast.error(response.message || 'Failed to add to wishlist');
        }
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const handleSizeGuide = () => {
    toast.info('Size guide: Measure the inside diameter of an existing ring');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-xl text-muted-foreground">Product not found</p>
        <EnhancedButton onClick={() => navigate('/products')} className="mt-4">
          Back to Products
        </EnhancedButton>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square overflow-hidden rounded-luxury bg-muted">
            <img 
              src={product.images && product.images.length > 0 
                ? BASE_URL + product.images[selectedImage] 
                : '/api/placeholder/600/600'
              } 
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/api/placeholder/600/600';
              }}
            />
          </div>

          {/* Thumbnail Gallery */}
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-4 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? 'border-primary' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <img 
                    src={BASE_URL + image} 
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/api/placeholder/80/80';
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between mb-2">
              {product.badge && (
                <Badge variant="secondary" className="bg-primary text-primary-foreground">
                  {product.badge}
                </Badge>
              )}
              <div className="flex items-center space-x-2">
                <EnhancedButton variant="ghost" size="icon" onClick={()=>{
                  if(isAdmin){
                    toast.error("Admin cannot add to wishlist!!")
                    navigate('/admin/dashboard')
                  }else{
                    handleToggleWishlist()
                  }
                }}>
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current text-destructive' : ''}`} />
                </EnhancedButton>
                <EnhancedButton variant="ghost" size="icon" onClick={handleShare}>
                  <Share2 className="h-5 w-5" />
                </EnhancedButton>
              </div>
            </div>

            <h1 className="font-luxury text-3xl font-bold mb-4">{product.name}</h1>
            
            <div className="flex items-center space-x-4 mb-4">
              <Badge variant="outline">SKU: {product.sku}</Badge>
            </div>

            <div className="flex items-baseline space-x-4 mb-6">
              <span className="text-4xl font-bold text-primary">
                ₹{product.price.toLocaleString()}
              </span>
              {product.originalPrice > product.price && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                  <Badge variant="destructive">{product.discount}% OFF</Badge>
                </>
              )}
            </div>

            {/* Stock Status */}
{product.stockQuantity !== undefined && (
  <p className={`text-sm font-medium mb-4 ${
    product.stockQuantity === 0 
      ? "text-red-500" 
      : product.stockQuantity <= 5 
        ? "text-orange-500" 
        : "text-green-500"
  }`}>
    {product.stockQuantity === 0 
      ? "Out of Stock" 
      : product.stockQuantity <= 5 
        ? `Only ${product.stockQuantity} left in stock — order soon!` 
        : "In Stock"}
  </p>
)}
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Metal & Stone</h3>
              <div className="flex space-x-4">
                <Badge variant="outline">{product.metal}</Badge>
                {product.stone && <Badge variant="outline">{product.stone}</Badge>}
              </div>
            </div>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Size</h3>
                <div className="grid grid-cols-6 gap-2">
                  {product.sizes.map((size) => (
                    <EnhancedButton
                      key={size}
                      variant={selectedSize === size ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </EnhancedButton>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Not sure about your size? <button className="text-primary hover:underline" onClick={handleSizeGuide}>Size Guide</button>
                </p>
              </div>
            )}

            
          </div>

          {/* Actions */}
<div className="space-y-4">
  {cartQuantity > 0 ? (
    // Show quantity controls if already in cart
    <div className="space-y-3">
      <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg p-3">
        <span className="font-semibold text-primary">
          {cartQuantity} item{cartQuantity > 1 ? 's' : ''} in cart
        </span>
        <div className="flex items-center gap-2">
          <EnhancedButton
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={async () => {
              const newQty = cartQuantity - 1;
              if (newQty === 0) {
                await cartService.removeFromCart(product.id);
                setCartQuantity(0);
                decrementCartCount();
              } else {
                await cartService.updateQuantity(product.id, newQty);
                setCartQuantity(newQty);
                decrementCartCount();
              }
            }}
          >
            <Minus className="h-4 w-4" />
          </EnhancedButton>
          <span className="w-8 text-center font-bold">{cartQuantity}</span>
          <EnhancedButton
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleAddToCart}
            disabled={addingToCart}
          >
            <Plus className="h-4 w-4" />
          </EnhancedButton>
        </div>
      </div>
      <EnhancedButton
        variant="luxury"
        size="lg"
        className="w-full"
        onClick={() => navigate('/cart')}
      >
        Go to Cart
      </EnhancedButton>
    </div>
  ) : (
    // Show Add to Cart button if not in cart
    <EnhancedButton
  variant="luxury"
  size="lg"
  className="w-full"
  onClick={()=>{if(isAdmin){
        toast.error("Admin cannot add to cart!!")
        navigate('/admin/dashboard')
      }else{
        handleAddToCart()
      }
  }}
  disabled={addingToCart || product.stockQuantity === 0}
>
  {addingToCart ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Adding to Cart...
    </>
  ) : product.stockQuantity === 0 ? (
    'Out of Stock'
  ) : (
    'Add to Cart'
  )}
</EnhancedButton>
  )}

  <div className="grid grid-cols-3 gap-4 text-center">
    <div className="flex flex-col items-center space-y-2">
      <Truck className="h-6 w-6 text-primary" />
      <span className="text-sm font-medium">Free Shipping</span>
    </div>
    <div className="flex flex-col items-center space-y-2">
      <Shield className="h-6 w-6 text-primary" />
      <span className="text-sm font-medium">Certified</span>
    </div>
    <div className="flex flex-col items-center space-y-2">
      <RotateCcw className="h-6 w-6 text-primary" />
      <span className="text-sm font-medium">30-Day Returns</span>
    </div>
  </div>
</div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-16">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="care">Care Guide</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-luxury text-2xl font-semibold mb-4">Product Description</h3>
                <p className="text-muted-foreground mb-6">{product.description}</p>
                
                {product.features && product.features.length > 0 && (
                  <>
                    <h4 className="font-semibold mb-4">Key Features</h4>
                    <ul className="space-y-2">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-3">
                          <Award className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specifications" className="mt-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-luxury text-2xl font-semibold mb-4">Technical Specifications</h3>
                {product.specifications && product.specifications.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.specifications.map((spec, index) => (
                      <div key={index} className="flex justify-between py-2 border-b border-border">
                        <span className="font-medium">{spec.label}</span>
                        <span className="text-muted-foreground">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No specifications available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="care" className="mt-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-luxury text-2xl font-semibold mb-4">Care Instructions</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Daily Care</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Remove jewellery before swimming, exercising, or cleaning</li>
                      <li>Store in a soft pouch or jewellery box when not wearing</li>
                      <li>Avoid contact with perfumes, lotions, and harsh chemicals</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Cleaning</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Clean with warm soapy water and a soft brush</li>
                      <li>Professional cleaning recommended every 6 months</li>
                      <li>Avoid ultrasonic cleaners for gemstone jewellery</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProductDetailPage;