import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Footer = () => {
  const quickLinks = [
    { href: '/about', label: 'About Us' },
    { href: '/collections', label: 'Collections' },
    { href: '/bidding', label: 'Live Auctions' },
    { href: '/contact', label: 'Contact' }
  ];

  const policies = [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms & Conditions' },
    { href: '/shipping', label: 'Shipping Info' },
    { href: '/returns', label: 'Returns & Exchange' }
  ];

  const categories = [
    { href: '/rings', label: 'Rings' },
    { href: '/necklaces', label: 'Necklaces' },
    { href: '/earrings', label: 'Earrings' },
    { href: '/bracelets', label: 'Bracelets' }
  ];

  return (
    <footer className="bg-gradient-luxury text-luxury-foreground">
      <div className="container mx-auto px-4 py-16">
        {/* Newsletter Section */}
        <div className="border-b border-luxury-light/20 pb-12 mb-12">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="font-luxury text-3xl font-bold mb-4">Stay in the Loop</h3>
            <p className="text-luxury-light mb-6">
              Be the first to know about new collections, exclusive offers, and luxury events
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input 
                placeholder="Enter your email" 
                className="bg-background/10 border-luxury-light/30 text-luxury-foreground placeholder:text-luxury-light/70"
              />
              <Button variant="secondary" className="bg-primary hover:bg-primary-dark text-luxury">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Column */}
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <Crown className="h-8 w-8 text-primary" />
              <span className="font-luxury text-2xl font-bold">ShineCart</span>
            </div>
            <p className="text-luxury-light mb-6">
              India's most trusted online jewellery destination. Crafting dreams with premium 
              gold, silver, and diamond jewellery since 2020.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-sm">+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-sm">support@shinecart.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm">Mumbai, Maharashtra, India</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-luxury text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href} 
                    className="text-luxury-light hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-luxury text-lg font-semibold mb-6">Categories</h4>
            <ul className="space-y-3">
              {categories.map((category) => (
                <li key={category.href}>
                  <Link 
                    to={category.href} 
                    className="text-luxury-light hover:text-primary transition-colors text-sm"
                  >
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies & Social */}
          <div>
            <h4 className="font-luxury text-lg font-semibold mb-6">Policies</h4>
            <ul className="space-y-3 mb-6">
              {policies.map((policy) => (
                <li key={policy.href}>
                  <Link 
                    to={policy.href} 
                    className="text-luxury-light hover:text-primary transition-colors text-sm"
                  >
                    {policy.label}
                  </Link>
                </li>
              ))}
            </ul>
            
            <h5 className="font-medium mb-4">Follow Us</h5>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="text-luxury-light hover:text-primary">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-luxury-light hover:text-primary">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-luxury-light hover:text-primary">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-luxury-light hover:text-primary">
                <Youtube className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-luxury-light/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-luxury-light text-sm">
              © 2024 ShineCart. All rights reserved. | Designed with luxury in mind.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <span className="text-xs text-luxury-light">Certified by:</span>
              <div className="flex space-x-4 text-xs text-luxury-light">
                <span>BIS</span>
                <span>•</span>
                <span>Hallmarked</span>
                <span>•</span>
                <span>SSL Secured</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;