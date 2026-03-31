// src/pages/Checkout.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { orderService, storeService, StoreResponse } from '@/services/orderService';
import { cartService } from '@/services/cartService';
import { Truck, Store, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useCartWishlist } from '@/context/CartWishlistContext';
import { toast } from 'sonner';

// Declare Razorpay for TypeScript
declare global {
  interface Window {
    Razorpay: any;
  }
}

// ─────────────────────────────────────────
//  VALIDATION TYPES
// ─────────────────────────────────────────
interface FieldErrors {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  store?: string;
}

// ─────────────────────────────────────────
//  VALIDATION RULES
// ─────────────────────────────────────────
const VALIDATIONS = {
  name: {
    required: true,
    minLength: 3,
    pattern: /^[a-zA-Z\s]+$/,
    messages: {
      required: 'Full name is required',
      minLength: 'Name must be at least 3 characters',
      pattern: 'Name should only contain letters and spaces',
    },
  },
  phone: {
    required: true,
    pattern: /^[6-9]\d{9}$/,
    messages: {
      required: 'Phone number is required',
      pattern: 'Enter a valid 10-digit Indian mobile number',
    },
  },
  email: {
    required: false,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    messages: {
      pattern: 'Enter a valid email address',
    },
  },
  address: {
    required: true,
    minLength: 10,
    messages: {
      required: 'Address is required',
      minLength: 'Please enter a complete address (min 10 characters)',
    },
  },
  city: {
    required: true,
    minLength: 2,
    pattern: /^[a-zA-Z\s]+$/,
    messages: {
      required: 'City is required',
      minLength: 'Enter a valid city name',
      pattern: 'City should only contain letters',
    },
  },
  state: {
    required: true,
    minLength: 2,
    pattern: /^[a-zA-Z\s]+$/,
    messages: {
      required: 'State is required',
      minLength: 'Enter a valid state name',
      pattern: 'State should only contain letters',
    },
  },
  pincode: {
    required: true,
    pattern: /^[1-9][0-9]{5}$/,
    messages: {
      required: 'Pincode is required',
      pattern: 'Enter a valid 6-digit pincode',
    },
  },
};

// ─────────────────────────────────────────
//  VALIDATE A SINGLE FIELD
// ─────────────────────────────────────────
const validateField = (field: keyof typeof VALIDATIONS, value: string): string => {
  const rules = VALIDATIONS[field];
  if (!rules) return '';

  if (rules.required && !value.trim()) {
    return rules.messages.required!;
  }

  if (value.trim() && rules.minLength && value.trim().length < rules.minLength) {
    return rules.messages.minLength!;
  }

  if (value.trim() && rules.pattern && !rules.pattern.test(value.trim())) {
    return rules.messages.pattern!;
  }

  return '';
};

// ─────────────────────────────────────────
//  VALIDATED INPUT COMPONENT
// ─────────────────────────────────────────
interface ValidatedInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  type?: string;
}

const ValidatedInput: React.FC<ValidatedInputProps> = ({
  label, value, onChange, onBlur,
  placeholder, error, required = false, type = 'text',
}) => (
  <div>
    <Label className="flex items-center gap-1">
      {label}
      {required && <span className="text-destructive">*</span>}
    </Label>
    <div className="relative mt-1">
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`pr-8 ${
          error
            ? 'border-destructive focus-visible:ring-destructive'
            : value.trim()
            ? 'border-green-500 focus-visible:ring-green-500'
            : ''
        }`}
      />
      {/* Icon feedback */}
      {value.trim() && !error && (
        <CheckCircle2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
      )}
      {error && (
        <AlertCircle className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
      )}
    </div>
    {/* Error message */}
    {error && (
      <p className="text-destructive text-xs mt-1 flex items-center gap-1">
        <AlertCircle className="h-3 w-3" />
        {error}
      </p>
    )}
  </div>
);

// ─────────────────────────────────────────
//  MAIN CHECKOUT COMPONENT
// ─────────────────────────────────────────
const Checkout = () => {
  const navigate = useNavigate();
  const [deliveryType, setDeliveryType] = useState<'HOME_DELIVERY' | 'STORE_PICKUP'>('HOME_DELIVERY');
  const [stores, setStores] = useState<StoreResponse[]>([]);
  const [selectedStore, setSelectedStore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Shipping address form
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    landmark: '',
  });

  // Field-level errors
  const [errors, setErrors] = useState<FieldErrors>({});

  // Track which fields have been touched (to show errors only after blur)
  const [touched, setTouched] = useState<Partial<Record<keyof FieldErrors, boolean>>>({});

  // Cart state
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartLoading, setCartLoading] = useState(true);
  const { setCartCount } = useCartWishlist();

  useEffect(() => {
    loadStores();
    loadRazorpayScript();
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setCartLoading(true);
      const response = await cartService.getCart();
      if (response.success && response.data) {
        setCartItems(response.data);
        const total = response.data.reduce(
          (sum: number, item: any) => sum + item.price * item.quantity, 0
        );
        setCartTotal(total);
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setCartLoading(false);
    }
  };

  const loadStores = async () => {
    try {
      const storeList = await storeService.getAllStores();
      setStores(storeList);
    } catch (error) {
      console.error('Failed to load stores:', error);
    }
  };

  const loadRazorpayScript = () => {
    if (document.querySelector('script[src*="razorpay"]')) return;
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  };

  // ─────────────────────────────────────────
  //  FIELD CHANGE + BLUR HANDLERS
  // ─────────────────────────────────────────
  const handleFieldChange = (field: keyof typeof shippingAddress, value: string) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }));

    // Live-validate only if field already touched
    if (touched[field as keyof FieldErrors]) {
      const error = validateField(field as keyof typeof VALIDATIONS, value);
      setErrors((prev) => ({ ...prev, [field]: error || undefined }));
    }
  };

  const handleFieldBlur = (field: keyof typeof shippingAddress) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field as keyof typeof VALIDATIONS, shippingAddress[field]);
    setErrors((prev) => ({ ...prev, [field]: error || undefined }));
  };

  // ─────────────────────────────────────────
  //  VALIDATE ALL FIELDS BEFORE SUBMIT
  // ─────────────────────────────────────────
  const validateAll = (): boolean => {
    if (deliveryType === 'STORE_PICKUP') {
      if (!selectedStore) {
        setErrors({ store: 'Please select a pickup store' });
        toast.error('Please select a pickup store');
        return false;
      }
      return true;
    }

    // Home delivery - validate all required fields
    const fields: Array<keyof typeof VALIDATIONS> = [
      'name', 'phone', 'address', 'city', 'state', 'pincode',
    ];

    const newErrors: FieldErrors = {};
    let isValid = true;

    fields.forEach((field) => {
      const value = shippingAddress[field as keyof typeof shippingAddress];
      const error = validateField(field, value);
      if (error) {
        newErrors[field as keyof FieldErrors] = error;
        isValid = false;
      }
    });

    // Optional email - validate format if provided
    if (shippingAddress.email.trim()) {
      const emailError = validateField('email', shippingAddress.email);
      if (emailError) {
        newErrors.email = emailError;
        isValid = false;
      }
    }

    // Mark all fields as touched
    const allTouched: Partial<Record<keyof FieldErrors, boolean>> = {};
    fields.forEach((f) => { allTouched[f as keyof FieldErrors] = true; });
    setTouched(allTouched);
    setErrors(newErrors);

    if (!isValid) {
      toast.error('Please fix the errors before proceeding');
    }

    return isValid;
  };

  // ─────────────────────────────────────────
  //  CHECKOUT HANDLER
  // ─────────────────────────────────────────
  const handleProceedToCheckout = async () => {
    // Cart check
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Run all validations
    if (!validateAll()) return;

    try {
      setLoading(true);

      const orderRequest: any = {
        deliveryType,
        items: cartItems.map((item: any) => ({
          productId: item.id,
          quantity: item.quantity,
          size: item.size,
        })),
      };

      if (deliveryType === 'HOME_DELIVERY') {
        orderRequest.shippingAddress = shippingAddress;
      } else {
        orderRequest.storeId = selectedStore;
      }

      // Step 1: Create order
      const order = await orderService.createOrder(orderRequest);

      // Step 2: Create Razorpay order
      const razorpayOrder = await orderService.createRazorpayOrder(order.orderNumber);

      // Step 3: Open Razorpay modal
      const options = {
        key: razorpayOrder.key,
        amount: razorpayOrder.amount * 100 + (deliveryType === 'HOME_DELIVERY' ? 50000 : 0),
        currency: razorpayOrder.currency,
        name: 'ShineCart',
        description: `Order #${order.orderNumber}`,
        order_id: razorpayOrder.razorpayOrderId,
        config: {
          display: {
            blocks: {
              banks: {
                name: 'All payment methods',
                instruments: [
                  { method: 'upi' },
                  { method: 'card' },
                  { method: 'netbanking' },
                  { method: 'wallet' },
                ],
              },
            },
            sequence: ['block.banks'],
            preferences: { show_default_blocks: true },
          },
        },
        handler: async (response: any) => {
          try {
            const verifyResult = await orderService.verifyPayment({
              orderNumber: order.orderNumber,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verifyResult.success) {
              try {
                await setCartCount(0);
                await cartService.clearCart();
              } catch (e) {
                console.error('Failed to clear cart:', e);
              }
              navigate(`/order-confirmation/${order.orderNumber}`);
            } else {
              toast.error('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: deliveryType === 'HOME_DELIVERY' ? shippingAddress.name : 'Customer',
          email: shippingAddress.email,
          contact: shippingAddress.phone,
        },
        theme: { color: '#8B7355' },
        modal: {
          ondismiss: async () => {
            await orderService.handlePaymentFailure(order.orderNumber);
            toast.warning('Payment was cancelled');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to process checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delivery fee
  const deliveryFee = deliveryType === 'HOME_DELIVERY' ? 500 : 0;
  const grandTotal = cartTotal + deliveryFee;

  // ─────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-luxury text-4xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left Column ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Delivery Method */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Method</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={deliveryType}
                onValueChange={(value: any) => {
                  setDeliveryType(value);
                  setErrors({});
                  setTouched({});
                }}
              >
                <div className={`flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                  deliveryType === 'HOME_DELIVERY' ? 'border-primary bg-accent/50' : ''
                }`}>
                  <RadioGroupItem value="HOME_DELIVERY" id="home" />
                  <Label htmlFor="home" className="flex items-center cursor-pointer flex-1">
                    <Truck className="h-5 w-5 mr-2 text-primary" />
                    <div>
                      <p className="font-semibold">Home Delivery</p>
                      <p className="text-sm text-muted-foreground">Delivered to your address in 5-7 days • ₹500</p>
                    </div>
                  </Label>
                </div>

                <div className={`flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors mt-4 ${
                  deliveryType === 'STORE_PICKUP' ? 'border-primary bg-accent/50' : ''
                }`}>
                  <RadioGroupItem value="STORE_PICKUP" id="pickup" />
                  <Label htmlFor="pickup" className="flex items-center cursor-pointer flex-1">
                    <Store className="h-5 w-5 mr-2 text-primary" />
                    <div>
                      <p className="font-semibold">Store Pickup</p>
                      <p className="text-sm text-muted-foreground">Collect from nearby store • FREE</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Home Delivery - Shipping Address */}
          {deliveryType === 'HOME_DELIVERY' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Shipping Address
                  <span className="text-sm font-normal text-muted-foreground">
                    (* required fields)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

                {/* Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ValidatedInput
                    label="Full Name"
                    required
                    value={shippingAddress.name}
                    onChange={(v) => handleFieldChange('name', v)}
                    onBlur={() => handleFieldBlur('name')}
                    placeholder="John Doe"
                    error={touched.name ? errors.name : undefined}
                  />
                  <ValidatedInput
                    label="Phone Number"
                    required
                    type="number"
                    value={shippingAddress.phone}
                    onChange={(v) => handleFieldChange('phone', v)}
                    onBlur={() => handleFieldBlur('phone')}
                    placeholder="9876543210"
                    error={touched.phone ? errors.phone : undefined}
                  />
                </div>

                {/* Address */}
                <ValidatedInput
                  label="Address"
                  required
                  value={shippingAddress.address}
                  onChange={(v) => handleFieldChange('address', v)}
                  onBlur={() => handleFieldBlur('address')}
                  placeholder="123 MG Road, Apartment 4B"
                  error={touched.address ? errors.address : undefined}
                />

                {/* Landmark (optional, no validation) */}
                <div>
                  <Label>Landmark <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                  <Input
                    value={shippingAddress.landmark}
                    onChange={(e) => setShippingAddress((p) => ({ ...p, landmark: e.target.value }))}
                    placeholder="Near City Mall"
                    className="mt-1"
                  />
                </div>

                {/* City & State */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ValidatedInput
                    label="City"
                    required
                    value={shippingAddress.city}
                    onChange={(v) => handleFieldChange('city', v)}
                    onBlur={() => handleFieldBlur('city')}
                    placeholder="Mumbai"
                    error={touched.city ? errors.city : undefined}
                  />
                  <ValidatedInput
                    label="State"
                    required
                    value={shippingAddress.state}
                    onChange={(v) => handleFieldChange('state', v)}
                    onBlur={() => handleFieldBlur('state')}
                    placeholder="Maharashtra"
                    error={touched.state ? errors.state : undefined}
                  />
                </div>

                {/* Pincode & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ValidatedInput
                    label="Pincode"
                    required
                    type="text"
                    value={shippingAddress.pincode}
                    onChange={(v) => handleFieldChange('pincode', v)}
                    onBlur={() => handleFieldBlur('pincode')}
                    placeholder="400001"
                    error={touched.pincode ? errors.pincode : undefined}
                  />
                  <ValidatedInput
                    label="Email"
                    type="email"
                    value={shippingAddress.email}
                    onChange={(v) => handleFieldChange('email', v)}
                    onBlur={() => handleFieldBlur('email')}
                    placeholder="john@example.com"
                    error={touched.email ? errors.email : undefined}
                  />
                </div>

                {/* Summary validation banner */}
                {Object.keys(errors).length > 0 && Object.values(errors).some(Boolean) && (
                  <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Please fix the highlighted fields before proceeding.</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Store Pickup - Store Selection */}
          {deliveryType === 'STORE_PICKUP' && (
            <Card>
              <CardHeader>
                <CardTitle>Select Pickup Store</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Store error */}
                {errors.store && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {errors.store}
                  </div>
                )}

                {stores.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Loading stores...</p>
                ) : (
                  stores.map((store) => (
                    <div
                      key={store.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-accent ${
                        selectedStore === store.id
                          ? 'border-primary bg-accent shadow-sm'
                          : 'border-border'
                      }`}
                      onClick={() => {
                        setSelectedStore(store.id);
                        setErrors((p) => ({ ...p, store: undefined }));
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{store.name}</h3>
                            {selectedStore === store.id && (
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                            {store.address}, {store.city}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {store.openingHours} • {store.workingDays}
                          </p>
                          <p className="text-sm text-muted-foreground">📞 {store.phone}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Order Summary (Right Column) ── */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartLoading ? (
                <p className="text-center text-muted-foreground py-4">Loading cart...</p>
              ) : cartItems.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Your cart is empty</p>
              ) : (
                <>
                  {/* Items */}
                  <div className="space-y-3 border-b pb-4 max-h-60 overflow-y-auto">
                    {cartItems.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-sm gap-2">
                        <span className="flex-1 text-muted-foreground">
                          {item.name}
                          <span className="ml-1 text-foreground font-medium">× {item.quantity}</span>
                        </span>
                        <span className="font-medium whitespace-nowrap">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery</span>
                      <span className={deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>
                        {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toLocaleString()}`}
                      </span>
                    </div>
                    <div className="border-t pt-3 flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>₹{grandTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <EnhancedButton
                    variant="luxury"
                    size="lg"
                    className="w-full"
                    onClick={handleProceedToCheckout}
                    disabled={loading || cartItems.length === 0}
                  >
                    {loading ? 'Processing...' : `Pay ₹${grandTotal.toLocaleString()}`}
                  </EnhancedButton>

                  <p className="text-xs text-center text-muted-foreground">
                    Secured by Razorpay. Your payment info is safe.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;