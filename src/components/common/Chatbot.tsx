import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  ShoppingBag,
  Package,
  HeadphonesIcon,
  Gavel,
  CreditCard,
  ShoppingCart,
  ExternalLink,
  Phone,
  Mail,
  Clock,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const BASE_URL = import.meta.env.VITE_API_URL;;

// ==================== Types ====================

interface ProductItem {
  id: number;
  name: string;
  price: number;
  image: string | null;
  category: string;
  metal: string;
}

interface CartItemBot {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
}

interface OrderResponse {
  orderNumber: string;
  status: string;
  orderDate: string;
  expectedDelivery: string;
  total: number;
  deliveryType: string;
}

interface QuickAction {
  label: string;
  action: string;
  icon: string;
  data?: string;
}

interface ContactInfo {
  phone: string;
  email: string;
  workingHours: string;
  address: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  products?: ProductItem[];
  cartItems?: CartItemBot[];
  order?: OrderResponse;
  quickActions?: QuickAction[];
  contactInfo?: ContactInfo;
}

// ==================== Helper ====================

const getOrderStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'Order Placed': 'bg-blue-500',
    'Processing': 'bg-yellow-500',
    'Shipped': 'bg-purple-500',
    'In Transit': 'bg-orange-500',
    'Delivered': 'bg-green-500',
    'Cancelled': 'bg-red-500',
    'Order Failed': 'bg-red-700',
  };
  return colors[status] || 'bg-gray-500';
};

// ==================== Main Component ====================

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! 👋 I'm your ShineCart assistant. I can help you with:\n\n• 📦 Track your orders\n• 💎 Find products\n• 🛒 View your cart\n• 🔨 Live auctions\n• 💳 Payment info\n\nHow can I help you today?",
      sender: 'bot',
      timestamp: new Date(),
      quickActions: [
        { label: 'Find Products', action: 'find_products', icon: 'ShoppingBag' },
        { label: 'Track Order', action: 'track_order', icon: 'Package' },
        { label: 'Live Auctions', action: 'view_auctions', icon: 'Gavel' },
        { label: 'Help', action: 'help', icon: 'HeadphonesIcon' },
      ],
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [sessionId] = useState(() => uuidv4());
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickActionButtons = [
    { icon: ShoppingBag, label: 'Products', action: 'find products' },
    { icon: Package, label: 'Orders', action: 'track_order' },
    { icon: Gavel, label: 'Auctions', action: 'auction' },
    { icon: HeadphonesIcon, label: 'Help', action: 'help' },
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('auth_token');

      const response = await fetch(`${BASE_URL}/api/chatbot/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          sessionId,
          message: messageText,
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.message,
        sender: 'bot',
        timestamp: new Date(),
        products: data.products,
        cartItems: data.cartItems,
        order: data.order,
        quickActions: data.quickActions,
        contactInfo: data.contactInfo,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting. Please try again later.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionButtonClick = (action: string, data?: string) => {
    switch (action) {
      case 'login':
        window.location.href = '/login';
        break;
      case 'view_cart':
        window.location.href = '/cart';
        break;
      case 'checkout':
        window.location.href = '/checkout';
        break;
      case 'view_order':
        window.location.href = `/orders/${data}`;
        break;
      case 'view_auctions':
        window.location.href = '/auctions';
        break;
      case 'browse_products':
      case 'view_all_products':
        window.location.href = data
          ? `/products?search=${encodeURIComponent(data)}`
          : '/products';
        break;
      case 'search_product':
        if (data) handleSendMessage(data);
        break;
      case 'track_order':
        handleSendMessage('track_order');
        break;
      case 'find_products':
        handleSendMessage('find products');
        break;
      default:
        if (data) handleSendMessage(data);
        break;
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg transition-all duration-300 ${
          isOpen ? 'scale-0 pointer-events-none' : 'scale-100'
        } bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white`}
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card
          className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 shadow-2xl flex flex-col rounded-2xl overflow-hidden border-0"
          style={{ height: '600px' }}
        >
          {/* Header */}
          <CardHeader className="pb-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-white flex-shrink-0 p-4 rounded-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold text-white">
                    ShineCart Assistant
                  </CardTitle>
                  <p className="text-xs text-amber-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-300 rounded-full inline-block"></span>
                    Online
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 h-8 w-8 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                {/* Message Bubble */}
                <div
                  className={`flex ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`flex items-end gap-2 max-w-[85%] ${
                      message.sender === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center ${
                        message.sender === 'user'
                          ? 'bg-amber-500'
                          : 'bg-white border-2 border-amber-400'
                      }`}
                    >
                      {message.sender === 'user' ? (
                        <User className="h-3 w-3 text-white" />
                      ) : (
                        <Bot className="h-3 w-3 text-amber-500" />
                      )}
                    </div>

                    {/* Bubble */}
                    <div
                      className={`px-3 py-2 rounded-2xl shadow-sm ${
                        message.sender === 'user'
                          ? 'bg-amber-500 text-white rounded-br-sm'
                          : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line leading-relaxed">
                        {message.text}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender === 'user'
                            ? 'text-amber-100 text-right'
                            : 'text-gray-400'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Products */}
                {message.products && message.products.length > 0 && (
                  <div className="ml-8 space-y-2">
                    {message.products.map((product) => (
                      <div
                        key={product.id}
                        className="bg-white border border-gray-100 rounded-xl p-3 flex gap-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => (window.location.href = `/product/${product.id}`)}
                      >
                        <img
                          src={
                            product.image
                              ? BASE_URL + product.image
                              : '/placeholder.jpg'
                          }
                          alt={product.name}
                          className="w-14 h-14 object-cover rounded-lg border border-gray-100"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.jpg';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-800 truncate">
                            {product.name}
                          </p>
                          <p className="text-amber-600 font-bold text-sm">
                            ₹{product.price?.toLocaleString()}
                          </p>
                          <div className="flex gap-1 mt-1">
                            <Badge
                              variant="outline"
                              className="text-xs px-1 py-0"
                            >
                              {product.category}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-xs px-1 py-0"
                            >
                              {product.metal}
                            </Badge>
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Cart Items */}
                {message.cartItems && message.cartItems.length > 0 && (
                  <div className="ml-8 space-y-2">
                    {message.cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white border border-gray-100 rounded-xl p-3 flex gap-3 shadow-sm"
                      >
                        <img
                          src={
                            item.image
                              ? BASE_URL + item.image
                              : '/placeholder.jpg'
                          }
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg border border-gray-100"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.jpg';
                          }}
                        />
                        <div className="flex-1">
                          {/* ✅ Fixed: using item.name instead of item.productName */}
                          <p className="font-semibold text-sm text-gray-800">
                            {item.name}
                          </p>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-xs text-gray-500">
                              Qty: {item.quantity}
                            </p>
                            <p className="text-amber-600 font-bold text-sm">
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Order Card */}
                {message.order && (
                  <div className="ml-8">
                    <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-sm text-gray-800">
                          #{message.order.orderNumber}
                        </p>
                        <Badge
                          className={`${getOrderStatusColor(message.order.status)} text-white text-xs`}
                        >
                          {message.order.status}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-xs text-gray-500">
                        <div className="flex justify-between">
                          <span>Order Date:</span>
                          <span className="font-medium text-gray-700">
                            {new Date(message.order.orderDate).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Expected Delivery:</span>
                          <span className="font-medium text-gray-700">
                            {new Date(message.order.expectedDelivery).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Delivery Type:</span>
                          <span className="font-medium text-gray-700">
                            {message.order.deliveryType === 'HOME_DELIVERY'
                              ? '🏠 Home Delivery'
                              : '🏪 Store Pickup'}
                          </span>
                        </div>
                        <div className="flex justify-between border-t pt-1 mt-1">
                          <span className="font-semibold text-gray-700">Total:</span>
                          <span className="font-bold text-amber-600">
                            ₹{message.order.total?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contact Info */}
                {message.contactInfo && (
                  <div className="ml-8">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm space-y-2">
                      <p className="font-semibold text-amber-900 text-sm">
                        📞 Contact Us
                      </p>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Phone className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                          <span className="text-xs">{message.contactInfo.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Mail className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                          <span className="text-xs">{message.contactInfo.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                          <span className="text-xs">{message.contactInfo.workingHours}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                {message.quickActions && message.quickActions.length > 0 && (
                  <div className="ml-8 flex flex-wrap gap-2">
                    {message.quickActions.map((action, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleActionButtonClick(action.action, action.data)
                        }
                        className="text-xs border-amber-300 text-amber-700 hover:bg-amber-50 rounded-full h-7 px-3"
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-end gap-2">
                  <div className="w-6 h-6 bg-white border-2 border-amber-400 rounded-full flex items-center justify-center">
                    <Bot className="h-3 w-3 text-amber-500" />
                  </div>
                  <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                    <div className="flex space-x-1.5">
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.15s' }}
                      />
                      <div
                        className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.3s' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer */}
          <CardContent className="p-3 border-t bg-white flex-shrink-0">
            {/* Quick Action Buttons */}
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              {quickActionButtons.map((action) => (
                <Button
                  key={action.action}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendMessage(action.action)}
                  className="flex flex-col items-center p-1.5 h-auto text-xs border-amber-200 hover:bg-amber-50 hover:border-amber-400 rounded-xl gap-1"
                >
                  <action.icon className="h-3.5 w-3.5 text-amber-600" />
                  <span className="text-gray-600 text-xs leading-none">
                    {action.label}
                  </span>
                </Button>
              ))}
            </div>

            {/* Input Row */}
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1 border-gray-200 focus:border-amber-400 rounded-full text-sm h-9 px-4"
                disabled={isLoading}
              />
              <Button
                onClick={() => handleSendMessage()}
                size="icon"
                disabled={!inputValue.trim() || isLoading}
                className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white rounded-full h-9 w-9 flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default Chatbot;