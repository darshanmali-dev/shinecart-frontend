import React, { useState, useEffect } from 'react';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Timer, 
  Eye, 
  Gavel, 
  TrendingUp, 
  Users,
  Clock,
  IndianRupee,
  Crown,
  Award
} from 'lucide-react';

// Import auction images
import vintageDiamondTiara from '@/assets/auctions/vintage-diamond-tiara.jpg';
import emeraldParureSet from '@/assets/auctions/emerald-parure-set.jpg';
import royalSapphireNecklace from '@/assets/auctions/royal-sapphire-necklace.jpg';
import pinkDiamondSolitaire from '@/assets/auctions/pink-diamond-solitaire.jpg';
import antiquePearlChoker from '@/assets/auctions/antique-pearl-choker.jpg';
import rubyTennisBracelet from '@/assets/auctions/ruby-tennis-bracelet.jpg';
import artDecoBrooch from '@/assets/auctions/art-deco-brooch.jpg';

const Bidding = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 32,
    seconds: 45
  });

  // Mock countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const liveAuctions = [
    {
      id: 1,
      title: 'Vintage Diamond Tiara',
      description: 'Rare 1920s Art Deco diamond tiara with 3.5 carats',
      currentBid: 450000,
      startingBid: 200000,
      bidCount: 23,
      watchers: 156,
      timeLeft: '2h 14m',
      image: vintageDiamondTiara,
      status: 'live',
      category: 'Vintage'
    },
    {
      id: 2,
      title: 'Emerald Parure Set',
      description: 'Complete parure set with Colombian emeralds',
      currentBid: 780000,
      startingBid: 500000,
      bidCount: 41,
      watchers: 298,
      timeLeft: '5h 42m',
      image: emeraldParureSet,
      status: 'live',
      category: 'Sets'
    },
    {
      id: 3,
      title: 'Royal Sapphire Necklace',
      description: 'Kashmir sapphire necklace with diamonds',
      currentBid: 1200000,
      startingBid: 800000,
      bidCount: 67,
      watchers: 423,
      timeLeft: '1d 8h',
      image: royalSapphireNecklace,
      status: 'live',
      category: 'Necklaces'
    }
  ];

  const upcomingAuctions = [
    {
      id: 4,
      title: 'Pink Diamond Solitaire',
      description: 'Rare 2.3ct pink diamond engagement ring',
      startingBid: 2500000,
      startTime: '2024-01-25 10:00 AM',
      watchers: 892,
      image: pinkDiamondSolitaire,
      category: 'Rings'
    },
    {
      id: 5,
      title: 'Antique Pearl Choker',
      description: '19th century Mikimoto pearl choker',
      startingBid: 150000,
      startTime: '2024-01-26 2:00 PM',
      watchers: 234,
      image: antiquePearlChoker,
      category: 'Vintage'
    }
  ];

  const recentWins = [
    {
      id: 6,
      title: 'Ruby Tennis Bracelet',
      finalBid: 325000,
      winner: 'Anonymous',
      endTime: '2024-01-20 6:30 PM',
      image: rubyTennisBracelet
    },
    {
      id: 7,
      title: 'Art Deco Brooch',
      finalBid: 89000,
      winner: 'J****h',
      endTime: '2024-01-19 4:15 PM',
      image: artDecoBrooch
    }
  ];

  const BidCard = ({ auction, type = 'live' }: any) => (
    <Card className="card-luxury group">
      <div className="aspect-[4/3] overflow-hidden relative">
        <img 
          src={"http://localhost:8080"+auction.image} 
          alt={auction.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <Badge variant={type === 'live' ? 'destructive' : 'secondary'}>
            {type === 'live' ? 'LIVE' : 'UPCOMING'}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
            {auction.category}
          </Badge>
        </div>
        {type === 'live' && (
          <div className="absolute bottom-3 left-3 right-3">
            <div className="bg-destructive text-destructive-foreground px-3 py-1 rounded-md text-center font-semibold">
              <Clock className="inline h-4 w-4 mr-1" />
              {auction.timeLeft}
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-luxury text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
              {auction.title}
            </h3>
            <p className="text-muted-foreground text-sm">{auction.description}</p>
          </div>

          {type === 'live' ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Current Bid</span>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{auction.bidCount} bids</span>
                </div>
              </div>
              
              <div className="text-2xl font-bold text-primary">
                ₹{auction.currentBid.toLocaleString()}
              </div>
              
              <div className="text-sm text-muted-foreground">
                Starting bid: ₹{auction.startingBid.toLocaleString()}
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{auction.watchers} watching</span>
                </div>
                <TrendingUp className="h-4 w-4" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <EnhancedButton variant="outline" size="sm">
                  Watch
                </EnhancedButton>
                <EnhancedButton variant="luxury" size="sm">
                  <Gavel className="h-4 w-4 mr-1" />
                  Bid Now
                </EnhancedButton>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-2xl font-bold text-primary">
                Starting ₹{auction.startingBid.toLocaleString()}
              </div>
              
              <div className="text-sm text-muted-foreground">
                Starts: {auction.startTime}
              </div>

              <div className="flex items-center text-sm text-muted-foreground">
                <Eye className="h-4 w-4 mr-1" />
                <span>{auction.watchers} interested</span>
              </div>

              <EnhancedButton variant="outline" size="sm" className="w-full">
                Set Reminder
              </EnhancedButton>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Promotional Banner */}
      <div className="mb-8 bg-gradient-gold rounded-luxury overflow-hidden">
        <div className="p-8 text-center text-luxury-foreground">
          <div className="flex items-center justify-center mb-4">
            <Timer className="h-8 w-8 mr-3 animate-pulse" />
            <span className="text-3xl font-luxury font-bold">LIVE BIDDING NOW!</span>
            <Timer className="h-8 w-8 ml-3 animate-pulse" />
          </div>
          <p className="text-lg mb-4">Exclusive jewellery auctions happening right now</p>
          <div className="flex items-center justify-center space-x-4 text-sm font-medium">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              Live Auctions Active
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              892+ Bidders Online
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="font-luxury text-4xl lg:text-6xl font-bold mb-6 animate-fade-in">
          Live Jewellery Auctions
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 animate-fade-in">
          Bid on exclusive, one-of-a-kind jewellery pieces from renowned artisans and collectors worldwide
        </p>
        
        {/* Featured Countdown */}
        <Card className="max-w-2xl mx-auto bg-gradient-luxury text-luxury-foreground shadow-luxury animate-scale-in">
          <CardContent className="p-8">
            <div className="flex items-center justify-center mb-4">
              <Crown className="h-8 w-8 text-primary mr-3 animate-pulse" />
              <h2 className="font-luxury text-2xl font-bold">Next Premium Auction</h2>
            </div>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="hover-scale">
                <div className="text-3xl font-bold text-primary animate-pulse">{timeLeft.days}</div>
                <div className="text-sm opacity-90">Days</div>
              </div>
              <div className="hover-scale">
                <div className="text-3xl font-bold text-primary animate-pulse">{timeLeft.hours}</div>
                <div className="text-sm opacity-90">Hours</div>
              </div>
              <div className="hover-scale">
                <div className="text-3xl font-bold text-primary animate-pulse">{timeLeft.minutes}</div>
                <div className="text-sm opacity-90">Minutes</div>
              </div>
              <div className="hover-scale">
                <div className="text-3xl font-bold text-primary animate-pulse">{timeLeft.seconds}</div>
                <div className="text-sm opacity-90">Seconds</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Auction Tabs */}
      <Tabs defaultValue="live" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="live">Live Auctions</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="results">Recent Results</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Live Auction */}
            <div className="lg:col-span-2">
              <Card className="card-luxury">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Timer className="h-6 w-6 text-destructive mr-2" />
                      Featured Live Auction
                    </CardTitle>
                    <Badge variant="destructive" className="animate-pulse">
                      LIVE NOW
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video mb-6 rounded-lg overflow-hidden bg-muted">
                    <img 
                      src={vintageDiamondTiara} 
                      alt="Live auction - Vintage Diamond Tiara"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-luxury text-2xl font-bold">Vintage Diamond Tiara</h3>
                    <p className="text-muted-foreground">
                      Exceptional 1920s Art Deco diamond tiara featuring 3.5 carats of brilliant-cut diamonds 
                      set in platinum. Provenance: European Royal Collection.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Current Bid</span>
                        <div className="text-3xl font-bold text-primary">₹4,50,000</div>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Next Bid</span>
                        <div className="text-2xl font-semibold">₹4,75,000</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>23 bidders</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>156 watching</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>2h 14m left</span>
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <div className="flex-1">
                        <Input placeholder="Enter bid amount" className="text-lg" />
                      </div>
                      <EnhancedButton variant="luxury" size="lg">
                        <Gavel className="h-5 w-5 mr-2" />
                        Place Bid
                      </EnhancedButton>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Live Bid History */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Live Bid History</CardTitle>
                </CardHeader>
                <CardContent className="max-h-96 overflow-y-auto space-y-3">
                  {[
                    { bidder: 'B****r', amount: 450000, time: '2 min ago' },
                    { bidder: 'J****h', amount: 425000, time: '5 min ago' },
                    { bidder: 'A****a', amount: 400000, time: '8 min ago' },
                    { bidder: 'M****l', amount: 375000, time: '12 min ago' },
                    { bidder: 'S****e', amount: 350000, time: '15 min ago' }
                  ].map((bid, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-semibold">{bid.bidder}</div>
                        <div className="text-sm text-muted-foreground">{bid.time}</div>
                      </div>
                      <div className="font-bold text-primary">
                        ₹{bid.amount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Other Live Auctions */}
          <div className="mt-12">
            <h2 className="font-luxury text-3xl font-bold mb-8">Other Live Auctions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveAuctions.slice(1).map((auction) => (
                <BidCard key={auction.id} auction={auction} type="live" />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingAuctions.map((auction) => (
              <BidCard key={auction.id} auction={auction} type="upcoming" />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="results" className="mt-8">
          <div className="space-y-6">
            <h2 className="font-luxury text-3xl font-bold">Recent Auction Results</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recentWins.map((result) => (
                <Card key={result.id} className="card-elevated">
                  <CardContent className="p-6">
                    <div className="flex space-x-4">
                      <img 
                        src={"http://localhost:8080"+result.image} 
                        alt={result.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{result.title}</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Final Bid</span>
                            <span className="font-bold text-primary">₹{result.finalBid.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Winner</span>
                            <span>{result.winner}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Ended</span>
                            <span>{result.endTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* How It Works */}
      <div className="mt-20 text-center">
        <h2 className="font-luxury text-3xl font-bold mb-12">How Bidding Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center p-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Register & Verify</h3>
            <p className="text-muted-foreground">Create an account and verify your identity to participate in auctions</p>
          </Card>
          
          <Card className="text-center p-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Browse & Watch</h3>
            <p className="text-muted-foreground">Explore upcoming auctions and add items to your watchlist</p>
          </Card>
          
          <Card className="text-center p-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gavel className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Bid & Win</h3>
            <p className="text-muted-foreground">Place your bids during live auctions and win exclusive pieces</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Bidding;
