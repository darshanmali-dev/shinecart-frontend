import React from 'react';
import { Link } from 'react-router-dom';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Star } from 'lucide-react';

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    price: number;
    originalPrice: number;
    rating: number;
    reviews: number;
    image: string;
    category: string;
    metal: string;
    discount: number;
    badge: string;
  };
  view?: 'grid' | 'list';
  isWishlisted?: boolean;
  onAddToCart?: (name: string) => void;
  onToggleWishlist?: (id: number, name: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  view = 'grid',
  isWishlisted = false,
  onAddToCart,
  onToggleWishlist,
}) => {
  return (
    <Card className={`card-product group ${view === 'list' ? 'flex flex-row' : ''}`}>
      <div className={`relative overflow-hidden ${view === 'list' ? 'w-48 h-48' : 'aspect-square'}`}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-primary text-primary-foreground">
            {product.badge}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <EnhancedButton
            variant="ghost"
            size="icon"
            className={`bg-background/80 backdrop-blur-sm ${
              isWishlisted ? 'text-destructive' : 'text-muted-foreground'
            } hover:text-destructive`}
            onClick={() => onToggleWishlist?.(product.id, product.name)}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </EnhancedButton>
        </div>
        {product.discount > 0 && (
          <div className="absolute bottom-3 left-3">
            <Badge variant="destructive">{product.discount}% OFF</Badge>
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

          <div className="flex items-center space-x-2 mb-3">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-primary fill-current" />
              <span className="ml-1 text-sm font-medium">{product.rating}</span>
            </div>
            <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
          </div>
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
            <EnhancedButton size="sm" className="flex-1" onClick={() => onAddToCart?.(product.name)}>
              Add to Cart
            </EnhancedButton>
            <EnhancedButton variant="outline" size="sm" asChild>
              <Link to={`/product/${product.id}`}>View Details</Link>
            </EnhancedButton>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
