import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Mail, KeyRound, Lock, ArrowLeft } from 'lucide-react';
import api from '@/services/api';

type Step = 'email' | 'otp' | 'reset' | 'success';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 1 — Send OTP
  const handleSendOtp = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(
        '/auth/forgot-password/send-otp', { email });
      if (response.data.success) {
        toast.success('OTP sent to your email address');
        setStep('otp');
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter the 6 digit OTP');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(
        '/auth/forgot-password/verify-otp', { email, otp });
      if (response.data.success) {
        toast.success('OTP verified successfully');
        setStep('reset');
      } else {
        toast.error('Invalid or expired OTP. Please try again.');
      }
    } catch (error) {
      toast.error('Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 3 — Reset Password
  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(
        '/auth/forgot-password/reset',
        { email, otp, newPassword }
      );
      if (response.data.success) {
        setStep('success');
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center 
        bg-background px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-luxury text-3xl font-bold mb-2">
              {step === 'email' && 'Forgot Password'}
              {step === 'otp' && 'Enter OTP'}
              {step === 'reset' && 'Reset Password'}
              {step === 'success' && 'Password Reset!'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {step === 'email' && 
                'Enter your email to receive a reset OTP'}
              {step === 'otp' && 
                `Enter the 6 digit OTP sent to ${email}`}
              {step === 'reset' && 
                'Enter your new password'}
              {step === 'success' && 
                'Your password has been reset successfully'}
            </p>
          </div>

          {/* Step 1 — Email */}
          {step === 'email' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 
                    -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => 
                      e.key === 'Enter' && handleSendOtp()}
                    placeholder="Enter your registered email"
                    className="w-full pl-10 pr-4 py-2 border rounded-lg
                      bg-background focus:outline-none focus:ring-2
                      focus:ring-primary text-sm"
                  />
                </div>
              </div>
              <EnhancedButton
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP'
                )}
              </EnhancedButton>
            </div>
          )}

          {/* Step 2 — OTP */}
          {step === 'otp' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">
                  Enter OTP
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 
                    -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 6) setOtp(val);
                    }}
                    onKeyDown={(e) => 
                      e.key === 'Enter' && handleVerifyOtp()}
                    placeholder="Enter 6 digit OTP"
                    maxLength={6}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg
                      bg-background focus:outline-none focus:ring-2
                      focus:ring-primary text-sm tracking-widest 
                      font-mono text-center text-lg"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  OTP expires in 10 minutes
                </p>
              </div>
              <EnhancedButton
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </EnhancedButton>
              <EnhancedButton
                variant="ghost"
                onClick={() => {
                  setOtp('');
                  handleSendOtp();
                }}
                disabled={loading}
                className="w-full text-sm"
              >
                Resend OTP
              </EnhancedButton>
            </div>
          )}

          {/* Step 3 — Reset Password */}
          {step === 'reset' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 
                    -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full pl-10 pr-4 py-2 border rounded-lg
                      bg-background focus:outline-none focus:ring-2
                      focus:ring-primary text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 
                    -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={(e) => 
                      e.key === 'Enter' && handleResetPassword()}
                    placeholder="Confirm new password"
                    className="w-full pl-10 pr-4 py-2 border rounded-lg
                      bg-background focus:outline-none focus:ring-2
                      focus:ring-primary text-sm"
                  />
                </div>
              </div>
              <EnhancedButton
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </EnhancedButton>
            </div>
          )}

          {/* Step 4 — Success */}
          {step === 'success' && (
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">✅</div>
              <p className="text-muted-foreground text-sm">
                Your password has been reset successfully.
                You can now log in with your new password.
              </p>
              <EnhancedButton
                onClick={() => navigate('/login')}
                className="w-full"
              >
                Go to Login
              </EnhancedButton>
            </div>
          )}

          {/* Back to Login */}
          {step !== 'success' && (
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/login')}
                className="text-sm text-muted-foreground 
                  hover:text-primary flex items-center 
                  justify-center gap-1 mx-auto"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to Login
              </button>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;