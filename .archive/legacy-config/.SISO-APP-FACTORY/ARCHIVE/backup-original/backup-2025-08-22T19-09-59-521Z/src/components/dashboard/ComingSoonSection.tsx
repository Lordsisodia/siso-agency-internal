import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Rocket, 
  Star, 
  Users, 
  TrendingUp, 
  Zap, 
  Mail, 
  CheckCircle,
  Calendar,
  Target,
  BarChart3,
  Smartphone,
  Globe,
  Shield,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface UpcomingFeature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'planning' | 'development' | 'testing' | 'launching';
  progress: number;
  launchDate: string;
  category: 'analytics' | 'automation' | 'mobile' | 'integration';
}

const upcomingFeatures: UpcomingFeature[] = [
  {
    id: 'advanced-analytics',
    title: 'Advanced Analytics Dashboard',
    description: 'Deep insights into partner performance with predictive analytics and custom reporting.',
    icon: <BarChart3 className="h-6 w-6" />,
    status: 'development',
    progress: 75,
    launchDate: '2025-02-15',
    category: 'analytics'
  },
  {
    id: 'automated-campaigns',
    title: 'Automated Marketing Campaigns',
    description: 'AI-powered email sequences and social media campaigns for partner recruitment.',
    icon: <Zap className="h-6 w-6" />,
    status: 'testing',
    progress: 90,
    launchDate: '2025-02-01',
    category: 'automation'
  },
  {
    id: 'mobile-app',
    title: 'Mobile Partner App',
    description: 'Native iOS and Android app for managing partnerships on the go.',
    icon: <Smartphone className="h-6 w-6" />,
    status: 'planning',
    progress: 25,
    launchDate: '2025-03-15',
    category: 'mobile'
  },
  {
    id: 'api-integrations',
    title: 'Third-Party Integrations',
    description: 'Connect with CRM, payment processors, and marketing tools seamlessly.',
    icon: <Globe className="h-6 w-6" />,
    status: 'development',
    progress: 60,
    launchDate: '2025-02-28',
    category: 'integration'
  },
  {
    id: 'advanced-security',
    title: 'Enhanced Security Suite',
    description: 'Multi-factor authentication, audit logs, and advanced permission controls.',
    icon: <Shield className="h-6 w-6" />,
    status: 'development',
    progress: 45,
    launchDate: '2025-03-01',
    category: 'integration'
  },
  {
    id: 'ai-insights',
    title: 'AI-Powered Insights',
    description: 'Machine learning recommendations for optimizing partner performance.',
    icon: <Sparkles className="h-6 w-6" />,
    status: 'planning',
    progress: 15,
    launchDate: '2025-04-01',
    category: 'analytics'
  }
];

export function ComingSoonSection() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const { toast } = useToast();

  // Countdown to next major release (February 1, 2025)
  const targetDate = new Date('2025-02-01T00:00:00Z');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleBetaSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to join the beta program.",
        variant: "destructive",
      });
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setIsSubscribed(true);
      toast({
        title: "Welcome to Beta!",
        description: "You'll be the first to know when new features launch.",
      });
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'development': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'testing': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'launching': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'analytics': return 'bg-purple-500/20 text-purple-400';
      case 'automation': return 'bg-green-500/20 text-green-400';
      case 'mobile': return 'bg-blue-500/20 text-blue-400';
      case 'integration': return 'bg-orange-500/20 text-orange-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center py-12 bg-gradient-to-r from-orange-500/10 to-purple-500/10 rounded-2xl border border-gray-700"
      >
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6"
          >
            <Rocket className="h-16 w-16 text-orange-500 mx-auto mb-4" />
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              The Future is
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-purple-500">
                {" "}Coming Soon
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Revolutionary features are being crafted to transform your partner experience. 
              Be the first to access cutting-edge tools that will redefine partnership success.
            </p>
          </motion.div>

          {/* Countdown Timer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-4 gap-4 max-w-md mx-auto mb-8"
          >
            {[
              { label: 'Days', value: timeLeft.days },
              { label: 'Hours', value: timeLeft.hours },
              { label: 'Minutes', value: timeLeft.minutes },
              { label: 'Seconds', value: timeLeft.seconds }
            ].map((item, index) => (
              <div key={item.label} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-2xl font-bold text-white">{item.value.toString().padStart(2, '0')}</div>
                <div className="text-sm text-gray-400">{item.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Beta Signup Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="max-w-md mx-auto"
          >
            {!isSubscribed ? (
              <form onSubmit={handleBetaSignup} className="flex gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email for early access"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                />
                <Button 
                  type="submit" 
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Join Beta
                </Button>
              </form>
            ) : (
              <div className="flex items-center justify-center gap-2 text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span>You're on the beta list! Check your email for updates.</span>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Feature Preview Grid */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">What's Coming Next</h2>
          <p className="text-gray-400">Exciting features in development that will revolutionize your partnership experience</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingFeatures.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-gray-800 border-gray-700 hover:border-orange-500/50 transition-colors h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-orange-500/20 rounded-lg text-orange-500">
                        {feature.icon}
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">{feature.title}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getStatusColor(feature.status)}>
                            {feature.status.charAt(0).toUpperCase() + feature.status.slice(1)}
                          </Badge>
                          <Badge variant="outline" className={getCategoryColor(feature.category)}>
                            {feature.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300 mb-4">
                    {feature.description}
                  </CardDescription>
                  
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white">{feature.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${feature.progress}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="bg-gradient-to-r from-orange-500 to-purple-500 h-2 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Launch Date */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                    <div className="flex items-center text-sm text-gray-400">
                      <Calendar className="h-4 w-4 mr-1" />
                      Target Launch
                    </div>
                    <div className="text-sm text-white font-medium">
                      {new Date(feature.launchDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Development Roadmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="bg-gray-800 rounded-lg p-6 border border-gray-700"
      >
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-white mb-2">Development Roadmap</h3>
          <p className="text-gray-400">Our commitment to continuous innovation and improvement</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { quarter: 'Q1 2025', focus: 'Analytics & Automation', features: 3, icon: <TrendingUp className="h-6 w-6" /> },
            { quarter: 'Q2 2025', focus: 'Mobile & Integration', features: 2, icon: <Smartphone className="h-6 w-6" /> },
            { quarter: 'Q3 2025', focus: 'AI & Machine Learning', features: 4, icon: <Sparkles className="h-6 w-6" /> },
            { quarter: 'Q4 2025', focus: 'Enterprise Features', features: 5, icon: <Target className="h-6 w-6" /> }
          ].map((roadmap, index) => (
            <div key={roadmap.quarter} className="text-center">
              <div className="p-4 bg-orange-500/20 rounded-lg text-orange-500 w-fit mx-auto mb-3">
                {roadmap.icon}
              </div>
              <h4 className="text-lg font-semibold text-white mb-1">{roadmap.quarter}</h4>
              <p className="text-gray-300 text-sm mb-2">{roadmap.focus}</p>
              <Badge variant="outline" className="text-gray-400 border-gray-600">
                {roadmap.features} Features
              </Badge>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="text-center py-8"
      >
        <h3 className="text-2xl font-bold text-white mb-4">Ready to Shape the Future?</h3>
        <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
          Your feedback drives our development. Join our community of forward-thinking partners 
          and help us build the tools you need to succeed.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button className="bg-orange-600 hover:bg-orange-700 text-white">
            <Users className="h-4 w-4 mr-2" />
            Join Community
          </Button>
          <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
            <Star className="h-4 w-4 mr-2" />
            Request Feature
          </Button>
        </div>
      </motion.div>
    </div>
  );
} 