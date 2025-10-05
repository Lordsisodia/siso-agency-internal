import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  ExternalLink,
  AlertCircle,
  Zap,
  Star,
  Search,
  ArrowRight,
  Users,
  FileText,
  Book,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SupportShowcaseProps {
  onNavigateToSupport?: () => void;
}

interface SupportChannel {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'online' | 'available' | 'busy';
  responseTime: string;
  description: string;
  action: string;
}

interface QuickHelp {
  id: string;
  question: string;
  category: string;
  popular: boolean;
}

const supportChannels: SupportChannel[] = [
  {
    id: '1',
    name: 'Live Chat',
    icon: MessageCircle,
    status: 'online',
    responseTime: '< 2 min',
    description: 'Instant help from our team',
    action: 'Start Chat'
  },
  {
    id: '2',
    name: 'Email Support',
    icon: Mail,
    status: 'available',
    responseTime: '< 4 hours',
    description: 'Detailed assistance',
    action: 'Send Email'
  },
  {
    id: '3',
    name: 'Phone Support',
    icon: Phone,
    status: 'available',
    responseTime: 'Schedule',
    description: 'Talk to an expert',
    action: 'Call Now'
  }
];

const quickHelp: QuickHelp[] = [
  { id: '1', question: 'How do I track my referrals?', category: 'Getting Started', popular: true },
  { id: '2', question: 'Commission payment schedule?', category: 'Payments', popular: true },
  { id: '3', question: 'Dashboard login issues?', category: 'Technical', popular: false },
  { id: '4', question: 'How to generate referral links?', category: 'Tools', popular: true },
  { id: '5', question: 'Marketing materials access?', category: 'Resources', popular: false }
];

const supportStats = {
  responseTime: '< 2 min',
  satisfactionRate: '98%',
  onlineAgents: 12,
  articlesAvailable: 150
};

export const SupportShowcase: React.FC<SupportShowcaseProps> = ({ 
  onNavigateToSupport 
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedChannel, setSelectedChannel] = useState<SupportChannel | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleNavigateToSupport = () => {
    if (onNavigateToSupport) {
      onNavigateToSupport();
    } else {
      window.location.href = '/partner/support';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'available': return 'bg-blue-500';
      case 'busy': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'available': return 'Available';
      case 'busy': return 'Busy';
      default: return 'Offline';
    }
  };

  const isBusinessHours = () => {
    const hour = currentTime.getHours();
    const day = currentTime.getDay();
    return day >= 1 && day <= 5 && hour >= 9 && hour <= 18; // Mon-Fri 9-6
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
    >
      <Card className="bg-black/60 backdrop-blur-xl border-orange-500/20 shadow-2xl">
        <CardContent className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500">
                <HelpCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Support Center</h3>
                <p className="text-sm text-gray-400">Get help when you need it</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNavigateToSupport}
              className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Support
            </Button>
          </div>

          {/* Support Status */}
          <div className="flex items-center justify-between p-3 bg-gray-900/50 border border-orange-500/20 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", isBusinessHours() ? "bg-green-500" : "bg-yellow-500")} />
                <span className="text-sm text-white font-medium">
                  {isBusinessHours() ? 'Support Online' : 'Limited Hours'}
                </span>
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                {supportStats.responseTime} avg response
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-sm text-white">{supportStats.satisfactionRate} satisfaction</div>
              <div className="text-xs text-gray-400">{supportStats.onlineAgents} agents online</div>
            </div>
          </div>

          {/* Quick Support Channels */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-300 flex items-center">
              <Zap className="h-4 w-4 mr-2 text-orange-400" />
              Quick Access
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {supportChannels.map((channel) => (
                <motion.div
                  key={channel.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-3 bg-gray-900/30 border border-gray-700/30 rounded-lg hover:border-orange-500/30 transition-all cursor-pointer group"
                  onClick={() => setSelectedChannel(channel)}
                >
                  <div className="text-center space-y-2">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center mx-auto group-hover:bg-orange-500/30 transition-colors">
                      {React.createElement(channel.icon, { className: "h-5 w-5 text-orange-400" })}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-white group-hover:text-orange-300 transition-colors">
                        {channel.name}
                      </div>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <div className={cn("w-1.5 h-1.5 rounded-full", getStatusColor(channel.status))} />
                        <span className="text-xs text-gray-400">{channel.responseTime}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Popular Questions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-300 flex items-center">
                <Star className="h-4 w-4 mr-2 text-orange-400" />
                Popular Questions
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNavigateToSupport}
                className="text-xs text-gray-400 hover:text-orange-400 h-6 px-2"
              >
                View All
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
            <div className="space-y-2">
              {quickHelp.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2 bg-gray-900/30 border border-gray-700/30 rounded-lg hover:border-orange-500/30 transition-all cursor-pointer group"
                  onClick={handleNavigateToSupport}
                >
                  <div className="w-6 h-6 bg-orange-500/20 rounded flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="h-3 w-3 text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white group-hover:text-orange-300 transition-colors truncate">
                      {item.question}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-gray-700/50 text-gray-300 border-gray-600/50 text-xs">
                        {item.category}
                      </Badge>
                      {item.popular && (
                        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
                          Popular
                        </Badge>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-orange-400 transition-colors flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Resource Highlights */}
          <div className="p-4 bg-gradient-to-r from-orange-600/10 to-amber-600/10 border border-orange-500/20 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Book className="h-4 w-4 text-orange-400" />
                <span className="text-sm font-medium text-white">Knowledge Base</span>
              </div>
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
                {supportStats.articlesAvailable}+ articles
              </Badge>
            </div>
            <p className="text-xs text-gray-400 mb-3">
              Comprehensive guides, tutorials, and troubleshooting resources
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Search className="h-3 w-3" />
                  Searchable
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Updated Daily
                </span>
              </div>
              <Button
                size="sm"
                onClick={handleNavigateToSupport}
                className="bg-orange-600 hover:bg-orange-700 text-white text-xs h-7"
              >
                Browse
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedChannel(supportChannels[0])}
              className="border-green-500/30 text-green-400 hover:bg-green-500/10 text-xs h-9"
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              Start Chat
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNavigateToSupport}
              className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10 text-xs h-9"
            >
              <FileText className="h-3 w-3 mr-1" />
              Browse FAQ
            </Button>
          </div>

          {/* Channel Detail Modal */}
          <AnimatePresence>
            {selectedChannel && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setSelectedChannel(null)}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="bg-black border border-orange-500/20 rounded-lg p-6 max-w-md w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-orange-500/20 rounded-lg">
                      {React.createElement(selectedChannel.icon, { className: "h-6 w-6 text-orange-400" })}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{selectedChannel.name}</h3>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", getStatusColor(selectedChannel.status))} />
                        <span className="text-sm text-gray-400">{getStatusText(selectedChannel.status)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 mb-4">{selectedChannel.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-400">Response time:</span>
                    <span className="text-sm text-white font-medium">{selectedChannel.responseTime}</span>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                      onClick={() => {
                        setSelectedChannel(null);
                        handleNavigateToSupport();
                      }}
                    >
                      {selectedChannel.action}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedChannel(null)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};