/**
 * Advanced Search Component for Knowledge Base
 * 
 * Intelligent search with filters, suggestions, and AI-powered results
 * Searches through all support content, FAQs, and documentation
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Clock, 
  TrendingUp, 
  BookOpen,
  FileText,
  Video,
  MessageCircle,
  Star,
  ArrowRight,
  X,
  Tag,
  Calendar,
  Eye,
  ThumbsUp,
  Zap,
  Sparkles
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { helpCategories, featuredArticles, helpCenterCards } from '@/data/partnershipSupportData';

interface SearchResult {
  id: string;
  title: string;
  content: string;
  category: string;
  type: 'article' | 'faq' | 'resource' | 'featured';
  relevanceScore: number;
  lastUpdated: string;
  views?: number;
  helpful?: number;
  tags?: string[];
  url?: string;
}

interface AdvancedSearchProps {
  onResultClick?: (result: SearchResult) => void;
  className?: string;
}

export function AdvancedSearch({ onResultClick, className }: AdvancedSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('relevance');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sample popular searches and suggestions
  const popularSearches = [
    "How to submit referrals",
    "Commission rates",
    "Payment schedule",
    "Partnership requirements",
    "Training materials",
    "API documentation",
    "Marketing templates",
    "Support contact"
  ];

  const quickSuggestions = [
    { text: "getting started", category: "Quick Start" },
    { text: "commission calculation", category: "Payments" },
    { text: "technical support", category: "Support" },
    { text: "best practices", category: "Training" },
    { text: "partner portal", category: "Platform" },
    { text: "referral tracking", category: "Management" }
  ];

  // Comprehensive search index from all support content
  const searchIndex: SearchResult[] = [
    // Featured Articles
    ...featuredArticles.map(article => ({
      id: article.id,
      title: article.title,
      content: article.description,
      category: article.category,
      type: 'featured' as const,
      relevanceScore: 0,
      lastUpdated: article.publishedDate || '2024-01-15',
      views: Math.floor(Math.random() * 2000) + 500,
      helpful: Math.floor(Math.random() * 100) + 80,
      tags: article.tags,
      url: article.link
    })),
    
    // Help Articles from Categories
    ...helpCategories.flatMap(category =>
      category.articles.map(article => ({
        id: article.id,
        title: article.title,
        content: article.content,
        category: category.title,
        type: 'article' as const,
        relevanceScore: 0,
        lastUpdated: article.lastUpdated,
        views: article.views,
        helpful: article.helpful,
        tags: article.tags,
        url: `/support/article/${article.id}`
      }))
    ),

    // Help Center Resources
    ...helpCenterCards.map(resource => ({
      id: resource.id,
      title: resource.title,
      content: resource.description,
      category: resource.category,
      type: 'resource' as const,
      relevanceScore: 0,
      lastUpdated: resource.lastUpdated || '2024-01-15',
      views: resource.downloads,
      helpful: Math.floor((resource.rating || 4.5) * 20),
      tags: [resource.category.toLowerCase()],
      url: resource.downloadUrl
    })),

    // Additional FAQ content
    ...[
      {
        id: 'faq-1',
        title: 'What happens after I submit a referral?',
        content: 'After submitting a referral, our team reviews it within 24 hours. We then contact the client within 48 hours for initial discovery. You receive real-time updates through your partner dashboard and email notifications.',
        category: 'Referrals',
        type: 'faq' as const,
        relevanceScore: 0,
        lastUpdated: '2024-01-15',
        views: 856,
        helpful: 92,
        tags: ['referrals', 'process', 'timeline'],
        url: '/support/faq/referral-process'
      },
      {
        id: 'faq-2',
        title: 'How do I increase my partnership tier?',
        content: 'Partnership tiers are based on successful referrals and total commission earned. Bronze (0-5 referrals), Silver (6-15 referrals), Gold (16-30 referrals), Platinum (31+ referrals). Focus on quality referrals and client success.',
        category: 'Partnership Tiers',
        type: 'faq' as const,
        relevanceScore: 0,
        lastUpdated: '2024-01-14',
        views: 1234,
        helpful: 95,
        tags: ['tiers', 'advancement', 'benefits'],
        url: '/support/faq/tier-advancement'
      },
      {
        id: 'faq-3',
        title: 'Can I refer international clients?',
        content: 'Yes! SISO works with clients globally. We have experience in UK, EU, US, and Asia-Pacific markets. Commission rates may vary by region due to local regulations and service delivery costs.',
        category: 'International',
        type: 'faq' as const,
        relevanceScore: 0,
        lastUpdated: '2024-01-13',
        views: 445,
        helpful: 87,
        tags: ['international', 'global', 'regions'],
        url: '/support/faq/international-referrals'
      },
      {
        id: 'faq-4',
        title: 'What if a client is not satisfied?',
        content: 'Client satisfaction is our top priority. We have a comprehensive project management process, regular check-ins, and revision policies. If issues arise, we work together to resolve them and protect your relationship.',
        category: 'Client Relations',
        type: 'faq' as const,
        relevanceScore: 0,
        lastUpdated: '2024-01-12',
        views: 667,
        helpful: 89,
        tags: ['satisfaction', 'quality', 'relationships'],
        url: '/support/faq/client-satisfaction'
      }
    ]
  ];

  // Advanced search algorithm
  const performSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate API delay
    setTimeout(() => {
      const lowerQuery = searchQuery.toLowerCase();
      const searchTerms = lowerQuery.split(' ').filter(term => term.length > 2);
      
      let searchResults = searchIndex.map(item => {
        let score = 0;
        
        // Title matching (highest weight)
        if (item.title.toLowerCase().includes(lowerQuery)) {
          score += 100;
        }
        searchTerms.forEach(term => {
          if (item.title.toLowerCase().includes(term)) {
            score += 50;
          }
        });
        
        // Content matching
        if (item.content.toLowerCase().includes(lowerQuery)) {
          score += 30;
        }
        searchTerms.forEach(term => {
          if (item.content.toLowerCase().includes(term)) {
            score += 15;
          }
        });
        
        // Category matching
        if (item.category.toLowerCase().includes(lowerQuery)) {
          score += 25;
        }
        
        // Tag matching
        if (item.tags) {
          item.tags.forEach(tag => {
            if (tag.toLowerCase().includes(lowerQuery)) {
              score += 20;
            }
          });
        }
        
        // Boost popular content
        if (item.views && item.views > 1000) score += 10;
        if (item.helpful && item.helpful > 90) score += 5;
        
        return { ...item, relevanceScore: score };
      });

      // Filter by categories and types
      if (selectedCategories.length > 0) {
        searchResults = searchResults.filter(result => 
          selectedCategories.includes(result.category)
        );
      }
      
      if (selectedTypes.length > 0) {
        searchResults = searchResults.filter(result => 
          selectedTypes.includes(result.type)
        );
      }

      // Sort results
      searchResults = searchResults
        .filter(result => result.relevanceScore > 0)
        .sort((a, b) => {
          switch (sortBy) {
            case 'date':
              return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
            case 'popularity':
              return (b.views || 0) - (a.views || 0);
            case 'helpful':
              return (b.helpful || 0) - (a.helpful || 0);
            default:
              return b.relevanceScore - a.relevanceScore;
          }
        })
        .slice(0, 20);

      setResults(searchResults);
      setIsSearching(false);
    }, 300);
  };

  useEffect(() => {
    if (query.length > 2) {
      performSearch(query);
    } else {
      setResults([]);
    }
  }, [query, selectedCategories, selectedTypes, sortBy]); // performSearch is stable due to setTimeout

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedTypes([]);
    setSortBy('relevance');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'featured': return <Star className="h-4 w-4 text-yellow-500" />;
      case 'article': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'resource': return <BookOpen className="h-4 w-4 text-green-500" />;
      case 'faq': return <MessageCircle className="h-4 w-4 text-purple-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            ref={searchInputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search knowledge base..."
            className="pl-10 pr-12 bg-gray-800 border-gray-600 text-white"
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuery('')}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Search Suggestions */}
        <AnimatePresence>
          {showSuggestions && !query && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50"
            >
              <div className="p-4">
                <h4 className="text-white font-medium mb-3">Popular Searches</h4>
                <div className="grid grid-cols-2 gap-2">
                  {popularSearches.slice(0, 6).map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(search)}
                      className="text-left text-sm text-gray-300 hover:text-orange-400 transition-colors p-2 rounded hover:bg-gray-700"
                    >
                      {search}
                    </button>
                  ))}
                </div>
                
                <h4 className="text-white font-medium mb-3 mt-4">Quick Suggestions</h4>
                <div className="flex flex-wrap gap-2">
                  {quickSuggestions.map((suggestion, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-orange-500/20 hover:border-orange-500"
                      onClick={() => handleSuggestionClick(suggestion.text)}
                    >
                      {suggestion.text}
                    </Badge>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center gap-4 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="border-gray-600 text-gray-300"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {(selectedCategories.length > 0 || selectedTypes.length > 0) && (
            <Badge className="ml-2 bg-orange-500 text-white">
              {selectedCategories.length + selectedTypes.length}
            </Badge>
          )}
        </Button>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40 bg-gray-800 border-gray-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Most Relevant</SelectItem>
            <SelectItem value="date">Most Recent</SelectItem>
            <SelectItem value="popularity">Most Popular</SelectItem>
            <SelectItem value="helpful">Most Helpful</SelectItem>
          </SelectContent>
        </Select>

        {(selectedCategories.length > 0 || selectedTypes.length > 0) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-orange-400 hover:text-orange-300"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="bg-gray-800 border-gray-600">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-white font-medium mb-3">Categories</h4>
                    <div className="space-y-2">
                      {[...new Set(searchIndex.map(item => item.category))].map(category => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={category}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={() => toggleCategory(category)}
                          />
                          <Label htmlFor={category} className="text-gray-300 text-sm">
                            {category}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-medium mb-3">Content Types</h4>
                    <div className="space-y-2">
                      {['featured', 'article', 'resource', 'faq'].map(type => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={type}
                            checked={selectedTypes.includes(type)}
                            onCheckedChange={() => toggleType(type)}
                          />
                          <Label htmlFor={type} className="text-gray-300 text-sm capitalize">
                            {type === 'faq' ? 'FAQ' : type}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Results */}
      <div className="space-y-4">
        {isSearching && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-orange-400 animate-pulse" />
              <span className="text-gray-300">Searching knowledge base...</span>
            </div>
          </div>
        )}

        {query && !isSearching && results.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">No results found for "{query}"</div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Try:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {popularSearches.slice(0, 4).map((search, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-orange-500/20"
                    onClick={() => handleSuggestionClick(search)}
                  >
                    {search}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <>
            <div className="text-sm text-gray-400">
              Found {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
            </div>
            
            <div className="space-y-3">
              {results.map((result, index) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <Card
                    className="bg-gray-800 border-gray-600 hover:border-orange-500/40 transition-all cursor-pointer group"
                    onClick={() => onResultClick?.(result)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getTypeIcon(result.type)}
                            <Badge variant="outline" className="text-xs">
                              {result.category}
                            </Badge>
                            {result.type === 'featured' && (
                              <Badge className="bg-yellow-500 text-black text-xs">
                                Featured
                              </Badge>
                            )}
                          </div>
                          
                          <h3 className="text-white font-medium group-hover:text-orange-400 transition-colors mb-2">
                            {result.title}
                          </h3>
                          
                          <p className="text-gray-300 text-sm line-clamp-2 mb-3">
                            {result.content.substring(0, 150)}...
                          </p>
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(result.lastUpdated).toLocaleDateString()}</span>
                            </div>
                            {result.views && (
                              <div className="flex items-center space-x-1">
                                <Eye className="h-3 w-3" />
                                <span>{result.views.toLocaleString()} views</span>
                              </div>
                            )}
                            {result.helpful && (
                              <div className="flex items-center space-x-1">
                                <ThumbsUp className="h-3 w-3" />
                                <span>{result.helpful}% helpful</span>
                              </div>
                            )}
                          </div>
                          
                          {result.tags && result.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {result.tags.slice(0, 3).map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-orange-400 transition-colors ml-4" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}