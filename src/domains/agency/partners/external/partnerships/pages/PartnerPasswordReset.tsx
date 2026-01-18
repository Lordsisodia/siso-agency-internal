import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, Shield, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const PartnerPasswordReset = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Implement Supabase password reset
      // For now, simulate email sending
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setEmailSent(true);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (error) {
      toast.error('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/auth/login');
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center px-4">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Success Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-3 px-6 py-3 bg-green-500/20 border border-green-500/30 
                rounded-full backdrop-blur-sm mb-6"
            >
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-green-400 font-semibold">Email Sent</span>
            </motion.div>
            
            <h1 className="text-3xl font-bold text-white mb-2">Check Your Email</h1>
            <p className="text-gray-400">We've sent password reset instructions to</p>
            <p className="text-orange-400 font-semibold">{email}</p>
          </div>

          {/* Success Card */}
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-green-500" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-white">Reset Link Sent</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Click the link in your email to reset your password. The link will expire in 24 hours.
                  </p>
                </div>

                <div className="pt-4 space-y-3">
                  <Button
                    onClick={handleBackToLogin}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>
                  
                  <p className="text-xs text-gray-500">
                    Didn't receive the email? Check your spam folder or{' '}
                    <button 
                      onClick={() => setEmailSent(false)}
                      className="text-orange-500 hover:text-orange-400 underline"
                    >
                      try again
                    </button>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center px-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-3 px-6 py-3 bg-gray-800/80 border border-orange-500/30 
              rounded-full backdrop-blur-sm mb-6"
          >
            <Shield className="w-5 h-5 text-orange-500" />
            <span className="text-orange-400 font-semibold">Password Reset</span>
          </motion.div>
          
          <h1 className="text-3xl font-bold text-white mb-2">Reset Your Password</h1>
          <p className="text-gray-400">Enter your email address and we'll send you a reset link</p>
        </div>

        {/* Reset Form */}
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-center">Password Recovery</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white pl-10 focus:border-orange-500"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">
                  We'll send a password reset link to this email address
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 text-lg font-semibold 
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending Reset Link...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Send Reset Link
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Navigation Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-6 space-y-4"
        >
          <div className="flex items-center justify-center gap-4">
            <Link 
              to="/auth/login" 
              className="text-orange-500 hover:text-orange-400 font-semibold transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
            <span className="text-gray-600">|</span>
            <Link 
              to="/auth/register" 
              className="text-orange-500 hover:text-orange-400 font-semibold transition-colors"
            >
              Create Account
            </Link>
          </div>
        </motion.div>

        {/* Back to Landing */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-4"
        >
          <Link 
            to="/partnership" 
            className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
          >
            ← Back to Partnership Program
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PartnerPasswordReset; 