import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Crown, Mail, Lock, User, Phone, Check } from 'lucide-react';
import { toast } from 'sonner';
import authBackground from '@/assets/auth-background.jpg';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number').max(10, 'Phone number must be exactly 10 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

const AuthRegister = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
  });

  const onSubmit = async (data: RegisterForm) => {
  try {
    const result = await register({
      username: data.fullName,
      email: data.email,
      phone: data.phone,
      password: data.password,
    });

    if (result.success) {
      toast.success('Account created successfully!');
      // Redirect based on role
      const savedUser = localStorage.getItem('auth_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/user/home');
        }
      }
    } else {
      toast.error(result.message || 'Registration failed. Please try again.');
    }
  } catch (error) {
    toast.error('Registration failed. Please try again.');
  }
};

  const benefits = [
    'Exclusive access to auctions',
    'Priority customer support',
    'Special offers and discounts',
    'Secure payment processing',
  ];

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${authBackground})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-background/85 backdrop-blur-sm"></div>
      </div>
      
      <div className="w-full max-w-6xl relative z-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left side - Benefits */}
          <div className="hidden md:block space-y-8 animate-fade-in">
            <div>
              <Link to="/" className="inline-flex items-center space-x-3 mb-6 group">
                <div className="relative p-3 rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/15 transition-all">
                  <Crown className="h-10 w-10 text-primary transition-transform group-hover:scale-110" />
                </div>
                <span className="font-luxury text-4xl font-bold text-foreground tracking-tight">
                  ShineCart
                </span>
              </Link>
              <h2 className="font-luxury text-3xl font-bold text-foreground mb-4">
                Join Our Exclusive Community
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Experience luxury jewellery shopping like never before
              </p>
            </div>
            
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="flex items-center space-x-3 p-4 rounded-lg bg-card/50 border border-border/50 backdrop-blur-sm"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-foreground font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Registration Form */}
          <div className="animate-scale-in">
            <div className="text-center mb-6 md:hidden">
              <Link to="/" className="inline-flex items-center justify-center space-x-3 mb-4 group">
                <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                  <Crown className="h-8 w-8 text-primary" />
                </div>
                <span className="font-luxury text-3xl font-bold text-foreground tracking-tight">
                  ShineCart
                </span>
              </Link>
              <h1 className="font-luxury text-2xl font-bold text-foreground mb-2">Create Account</h1>
              <p className="text-muted-foreground">Start your luxury journey today</p>
            </div>

            <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-8">
              <div className="hidden md:block mb-6">
                <h1 className="font-luxury text-2xl font-bold text-foreground mb-2">Create Account</h1>
                <p className="text-muted-foreground">Fill in your details to get started</p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                            <Input 
                              {...field} 
                              placeholder="Darshan Mali" 
                              className="pl-11 h-11 bg-background/50 border-border/50 focus:border-primary transition-all"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                            <Input 
                              {...field} 
                              type="email"
                              placeholder="you@example.com" 
                              className="pl-11 h-11 bg-background/50 border-border/50 focus:border-primary transition-all"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                            <Input 
                              {...field} 
                              type="tel"
                              placeholder="+91 9876543210" 
                              className="pl-11 h-11 bg-background/50 border-border/50 focus:border-primary transition-all"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                            <Input 
                              {...field} 
                              type="password"
                              placeholder="Create a strong password" 
                              className="pl-11 h-11 bg-background/50 border-border/50 focus:border-primary transition-all"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                            <Input 
                              {...field} 
                              type="password"
                              placeholder="Confirm your password" 
                              className="pl-11 h-11 bg-background/50 border-border/50 focus:border-primary transition-all"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="agreeToTerms"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-3">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="rounded border-border text-primary focus:ring-primary h-4 w-4 mt-1"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm">
                            I agree to the{' '}
                            <Link to="/terms" className="text-primary hover:underline">
                              Terms of Service
                            </Link>
                            {' '}and{' '}
                            <Link to="/privacy" className="text-primary hover:underline">
                              Privacy Policy
                            </Link>
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <EnhancedButton 
                    type="submit"
                    variant="luxury" 
                    size="lg" 
                    className="w-full h-11 text-base font-semibold"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? 'Creating Account...' : 'Create Account'}
                  </EnhancedButton>

                  <div className="text-center text-sm">
                    <span className="text-muted-foreground">Already have an account? </span>
                    <Link 
                      to="/login" 
                      className="text-primary hover:underline font-semibold transition-colors"
                    >
                      Sign in
                    </Link>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthRegister;