/**
 * Integrated Search Section for Resources Help Template
 * 
 * Enhanced search experience integrated into the help center
 * with AI suggestions and real-time results
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Star,
  ArrowRight,
  Zap,
  Bot
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SearchSectionProps {
  onSearchClick?: () => void;
  onAIAssistantClick?: () => void;
  className?: string;
}

export function SearchSection({ onSearchClick, onAIAssistantClick, className }: SearchSectionProps) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const popularSearches = [
    { text: "How to submit referrals", trend: "up", searches: 234 },
    { text: "Commission rates", trend: "up", searches: 189 },
    { text: "Payment schedule", trend: "stable", searches: 156 },
    { text: "Partnership requirements", trend: "up", searches: 143 },
    { text: "Training materials", trend: "up", searches: 98 },
    { text: "API documentation", trend: "stable", searches: 67 }
  ];

  const quickActions = [
    { 
      title: "AI Assistant", 
      description: "Get instant answers from our AI", 
      icon: Bot, 
      color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      action: onAIAssistantClick
    },
    { 
      title: "Advanced Search", 
      description: "Detailed search with filters", 
      icon: Search, 
      color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      action: onSearchClick
    }
  ];

  const handleSearch = () => {
    if (query.trim()) {
      onSearchClick?.();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={cn("space-y-8", className)}>
      {/* Hero Search Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur-xl" />
          <div className="relative bg-black/30 backdrop-blur-sm border border-orange-500/20 rounded-2xl p-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <Sparkles className="h-12 w-12 text-orange-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">How can we help you?</h2>
              <p className="text-gray-300">Search our knowledge base or chat with our AI assistant</p>
            </motion.div>

            {/* Search Input */}
            <div className="relative mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Search for help articles, guides, FAQs..."
                  className="pl-12 pr-12 h-14 text-lg bg-gray-800/50 border-gray-600 text-white rounded-xl"
                />
                <Button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-600 hover:bg-orange-700 rounded-lg"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Search Suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600 rounded-xl shadow-xl z-50"
                  >
                    <div className="p-4">
                      <h4 className="text-white font-medium mb-3 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2 text-orange-400" />
                        Popular Searches
                      </h4>
                      <div className="space-y-2">
                        {popularSearches.slice(0, 4).map((search, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setQuery(search.text);
                              setShowSuggestions(false);
                            }}
                            className="w-full text-left flex items-center justify-between p-2 rounded-lg hover:bg-gray-700 transition-colors group"
                          >
                            <span className="text-gray-300 group-hover:text-white">
                              {search.text}
                            </span>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {search.searches}
                              </Badge>
                              <TrendingUp className={cn(
                                "h-3 w-3",
                                search.trend === "up" ? "text-green-400" : "text-gray-400"
                              )} />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  onClick={action.action}
                  className={cn(
                    "p-4 rounded-xl border transition-all hover:scale-105 text-left",
                    action.color
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <action.icon className="h-8 w-8" />
                    <div>
                      <h3 className="font-medium">{action.title}</h3>
                      <p className="text-sm opacity-80">{action.description}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Searches */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="max-w-4xl mx-auto"
      >
        <Card className="bg-gray-800/50 border-gray-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium flex items-center">
                <Clock className="h-5 w-5 mr-2 text-orange-400" />
                Trending Topics
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onSearchClick}
                className="text-orange-400 hover:text-orange-300"
              >
                View All
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularSearches.map((search, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  onClick={() => {
                    setQuery(search.text);
                    onSearchClick?.();
                  }}
                  className="text-left p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-sm font-medium group-hover:text-orange-400 transition-colors">
                      {search.text}
                    </span>
                    <ArrowRight className="h-3 w-3 text-gray-400 group-hover:text-orange-400 transition-colors" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {search.searches} searches
                    </Badge>
                    {search.trend === "up" && (
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-3 w-3 text-green-400" />
                        <span className="text-xs text-green-400">Trending</span>
                      </div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Assistant Promotion */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="max-w-3xl mx-auto"
      >
        <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Bot className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">
                    Can't find what you're looking for?
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Our AI assistant can help you find answers instantly and guide you through any process
                  </p>
                </div>
              </div>
              <Button
                onClick={onAIAssistantClick}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Zap className="h-4 w-4 mr-2" />
                Ask AI
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}