import React from 'react';
import { motion } from 'framer-motion';
import { 
  HelpCircle,
  MessageSquare,
  FileText,
  Video,
  Download
} from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';

const SupportCenter: React.FC = () => {
  const supportOptions = [
    {
      name: 'Live Chat',
      description: 'Instant help',
      icon: MessageSquare
    },
    {
      name: 'Knowledge Base',
      description: 'Self-service',
      icon: FileText
    },
    {
      name: 'Video Guides',
      description: 'Step-by-step',
      icon: Video
    },
    {
      name: 'Resources',
      description: 'Templates & tools',
      icon: Download
    }
  ];

  const supportStats = [
    {
      value: '< 2min',
      label: 'Avg Response',
      color: 'orange'
    },
    {
      value: '98%',
      label: 'Satisfaction',
      color: 'green'
    },
    {
      value: '24/7',
      label: 'Available',
      color: 'blue'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.0 }}
      className="row-6"
    >
      <Card className="bg-black/60 backdrop-blur-xl border-orange-500/20 shadow-2xl hover:border-orange-500/40 transition-all overflow-hidden">
        <div className="relative">
          {/* Header with Background Pattern */}
          <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 p-6 border-b border-orange-500/20">
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
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                24/7 Available
              </Badge>
            </div>
          </div>
          
          <CardContent className="p-6 space-y-4">
            {/* Support Options */}
            <div className="grid grid-cols-2 gap-3">
              {supportOptions.map((option, index) => {
                const Icon = option.icon;
                return (
                  <div 
                    key={index}
                    className="p-3 bg-gray-900/50 border border-gray-700/30 rounded-lg hover:bg-orange-500/10 transition-colors cursor-pointer"
                  >
                    <Icon className="h-5 w-5 text-orange-400 mb-2" />
                    <div className="text-sm font-medium text-white">{option.name}</div>
                    <div className="text-xs text-gray-400">{option.description}</div>
                  </div>
                );
              })}
            </div>

            {/* Quick Stats */}
            <div className="flex justify-between text-sm">
              {supportStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className={`text-lg font-bold text-${stat.color}-400`}>{stat.value}</div>
                  <div className="text-xs text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Action Button */}
            <Button 
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              onClick={() => window.location.href = '/partner/support'}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Get Support Now
            </Button>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
};

export default SupportCenter;