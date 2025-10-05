import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const PartnerLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('PartnerLogin - Attempting sign in with:', formData.email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      
      if (error) {
        console.error('PartnerLogin - Sign in error:', error);
        throw error;
      }
      
      console.log('PartnerLogin - Sign in successful:', data.user?.id);
      toast.success('Login successful! Welcome back.');
      
      // Check if user has partner profile
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('partner_profiles')
          .select('*')
          .eq('user_id', data.user.id)
          .single();
          
        if (profileError && profileError.code !== 'PGRST116') {
          console.error('PartnerLogin - Profile check error:', profileError);
        }
        
        console.log('PartnerLogin - Partner profile found:', !!profile);
      }
      
      // Redirect to dashboard or return URL
      const returnTo = location.state?.from || location.state?.returnTo || '/dashboard';
      navigate(returnTo, { replace: true });
    } catch (error: any) {
      console.error('PartnerLogin - Auth error:', error);
      
      // Handle specific error messages
      if (error.message?.includes('Email not confirmed')) {
        toast.error('Please verify your email address before signing in.');
      } else if (error.message?.includes('Invalid login')) {
        toast.error('Invalid email or password. Please check your credentials.');
      } else {
        toast.error('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

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
            <span className="text-orange-400 font-semibold">Partner Portal</span>
          </motion.div>
          
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Sign in to your partner dashboard</p>
        </div>

        {/* Login Form */}
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-center">Partner Login</CardTitle>
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
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white pl-10 focus:border-orange-500"
                    placeholder="partner@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white pl-10 pr-10 focus:border-orange-500"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) => setFormData({...formData, rememberMe: checked as boolean})}
                    className="border-gray-600 data-[state=checked]:bg-orange-500"
                  />
                  <Label htmlFor="rememberMe" className="text-sm text-gray-300">Remember me</Label>
                </div>
                <Link 
                  to="/auth/reset-password" 
                  className="text-sm text-orange-500 hover:text-orange-400 transition-colors"
                >
                  Forgot password?
                </Link>
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
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Sign In
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Register Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-6"
        >
          <p className="text-gray-400">
            Don't have an account?{' '}
            <Link 
              to="/auth/register" 
              className="text-orange-500 hover:text-orange-400 font-semibold transition-colors"
            >
              Apply to become a partner
            </Link>
          </p>
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

export default PartnerLogin; 