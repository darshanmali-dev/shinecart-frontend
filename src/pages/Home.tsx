import React from 'react';
import { Link } from 'react-router-dom';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollAnimation } from '@/hooks/use-scroll-animation';
import { toast } from 'sonner';
import { 
  Star, 
  ArrowRight, 
  Crown, 
  Shield, 
  Truck,
  Award,
  Timer,
  Users,
  TrendingUp,
  Gavel
} from 'lucide-react';
import heroVideo from '@/assets/hero-video.mp4';
import diamondCollection from '@/assets/collections/diamond-elegance.jpg';
import goldCollection from '@/assets/collections/gold-heritage.jpg';
import bridalCollection from '@/assets/collections/bridal-collection.jpg';

const Home = () => {
  const featuredCollections = [
    {
      id: 1,
      name: 'Diamond Elegance',
      description: 'Timeless diamond jewellery for special moments',
      image: diamondCollection,
      itemCount: 156,
      startingPrice: '₹25,000'
    },
    {
      id: 2,
      name: 'Gold Heritage',
      description: 'Traditional gold craftsmanship meets modern design',
      image: goldCollection,
      itemCount: 234,
      startingPrice: '₹15,000'
    },
    {
      id: 3,
      name: 'Bridal Collection',
      description: 'Exquisite wedding jewellery sets',
      image: bridalCollection,
      itemCount: 89,
      startingPrice: '₹45,000'
    }
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      rating: 5,
      text: 'Absolutely stunning quality! The diamond ring I purchased exceeded my expectations.',
      purchase: 'Diamond Ring Set'
    },
    {
      name: 'Rajesh Kumar',
      rating: 5,
      text: 'Excellent service and beautiful jewellery. The bidding experience was thrilling!',
      purchase: 'Gold Necklace'
    },
    {
      name: 'Meera Singh',
      rating: 5,
      text: 'Perfect for my wedding! The bridal set was exactly what I dreamed of.',
      purchase: 'Bridal Collection'
    }
  ];

  const features = [
    { icon: Shield, title: 'Certified Authentic', description: 'BIS Hallmarked & Certified' },
    { icon: Truck, title: 'Free Shipping', description: 'On orders above ₹50,000' },
    { icon: Award, title: '30-Day Returns', description: 'Hassle-free returns' },
    { icon: Crown, title: 'Premium Quality', description: 'Handcrafted excellence' }
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={heroVideo} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent"></div>
        </div>
        
        <div className="relative container mx-auto px-4 text-center lg:text-left">
          <div className="max-w-3xl">
            <ScrollAnimation animation="fade-up" duration={800}>
              <h1 className="font-luxury text-5xl lg:text-7xl font-bold text-background mb-6">
                Discover
                <span className="block bg-gradient-to-r from-primary to-luxury bg-clip-text text-transparent">
                  Luxury Jewellery
                </span>
              </h1>
            </ScrollAnimation>
            <ScrollAnimation animation="fade-up" delay={200} duration={800}>
              <p className="text-xl lg:text-2xl text-background/90 mb-8">
                Experience the finest collection of handcrafted jewellery with live bidding
                and premium service that exceeds expectations.
              </p>
            </ScrollAnimation>
            <ScrollAnimation animation="fade-up" delay={400} duration={800}>
              <div className="flex flex-col sm:flex-row gap-4">
                <EnhancedButton variant="luxury" size="xl" asChild>
                  <Link to="/products">
                    Explore Collections <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </EnhancedButton>
                <EnhancedButton variant="elegant" size="xl" asChild>
                  <Link to="/auctions">
                    <Timer className="mr-2 h-5 w-5" />
                    Live Auctions
                  </Link>
                </EnhancedButton>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <ScrollAnimation 
                key={index} 
                animation="fade-up" 
                delay={index * 100}
                duration={600}
              >
                <Card className="text-center card-elevated hover-lift h-full">
                  <CardContent className="p-6">
                    <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="font-luxury text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <ScrollAnimation animation="fade-up" duration={700}>
            <div className="text-center mb-16">
              <h2 className="font-luxury text-4xl lg:text-5xl font-bold mb-6">
                Featured Collections
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Discover our carefully curated collections of premium jewellery, 
                each piece crafted with precision and passion.
              </p>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCollections.map((collection, index) => (
              <ScrollAnimation 
                key={collection.id} 
                animation="scale" 
                delay={index * 150}
                duration={700}
              >
                <Card className="card-product group h-full">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img 
                      src={collection.image} 
                      alt={collection.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-luxury text-xl font-semibold">{collection.name}</h3>
                      <Badge variant="secondary">{collection.itemCount} items</Badge>
                    </div>
                    <p className="text-muted-foreground mb-4">{collection.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-lg text-primary">
                        Starting {collection.startingPrice}
                      </span>
                      <EnhancedButton variant="outline" size="sm" asChild>
                        <Link to={`/products?collection=${collection.id}`}>
                          View Collection
                        </Link>
                      </EnhancedButton>
                    </div>
                  </CardContent>
                </Card>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>


      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <ScrollAnimation animation="fade-up" duration={700}>
            <div className="text-center mb-16">
              <h2 className="font-luxury text-4xl lg:text-5xl font-bold mb-6">
                What Our Customers Say
              </h2>
              <p className="text-xl text-muted-foreground">
                Join thousands of satisfied customers who trust ShineCart
              </p>
            </div>
          </ScrollAnimation>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <ScrollAnimation 
                key={index} 
                animation="fade-up" 
                delay={index * 150}
                duration={600}
              >
                <Card className="card-luxury h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-primary fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-muted-foreground mb-4 italic">
                      "{testimonial.text}"
                    </blockquote>
                    <div className="border-t border-border pt-4">
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">Purchased: {testimonial.purchase}</p>
                    </div>
                  </CardContent>
                </Card>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
