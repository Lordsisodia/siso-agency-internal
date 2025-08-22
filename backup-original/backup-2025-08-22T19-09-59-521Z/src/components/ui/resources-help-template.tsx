/**
 * Resources & Help Template
 * 
 * A comprehensive help center template extracted from the resources page.
 * Perfect for support sections, documentation hubs, and knowledge bases.
 * 
 * Key Features:
 * - Hero section with search functionality
 * - Featured articles grid with tags
 * - Quick help cards with call-to-actions
 * - Tabbed content for different help categories
 * - Help center with multiple support channels
 * - Animated particles background
 * - Responsive design with smooth transitions
 * 
 * Usage:
 * <ResourcesHelpTemplate 
 *   title="Partnership Support"
 *   subtitle="Get help with your partnership journey"
 *   featuredArticles={partnershipArticles}
 *   helpCategories={partnershipTabs}
 * />
 */

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  FileText, 
  HelpCircle, 
  User, 
  Search, 
  ArrowRight, 
  Sparkles, 
  MessageCircle, 
  Users,
  LucideIcon
} from "lucide-react";

export interface FeaturedArticle {
  title: string;
  description: string;
  icon: LucideIcon;
  tag: string;
  category: string;
  color?: 'orange' | 'blue' | 'purple' | 'green';
}

export interface QuickHelpCard {
  title: string;
  description: string;
  buttonText: string;
  icon: LucideIcon;
  onAction: () => void;
  variant?: 'primary' | 'secondary';
}

export interface HelpCenterCard {
  title: string;
  description: string;
  buttonText: string;
  icon: LucideIcon;
  onAction: () => void;
  color?: 'orange' | 'purple' | 'blue' | 'green';
}

export interface HelpCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  content: React.ReactNode;
}

interface ResourcesHelpTemplateProps {
  /** Main title for the help section */
  title?: string;
  /** Subtitle description */
  subtitle?: string;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Featured articles to highlight */
  featuredArticles?: FeaturedArticle[];
  /** Quick help cards */
  quickHelpCards?: QuickHelpCard[];
  /** Help center cards */
  helpCenterCards?: HelpCenterCard[];
  /** Help categories with tabbed content */
  helpCategories?: HelpCategory[];
  /** Background image URL */
  backgroundImage?: string;
  /** Custom CSS classes */
  className?: string;
  /** Search callback */
  onSearch?: (query: string) => void;
  /** Default active tab */
  defaultTab?: string;
}

export function ResourcesHelpTemplate({
  title = "Resources & Support",
  subtitle = "Find help, documentation, and manage your profile all in one place",
  searchPlaceholder = "Search for help articles...",
  featuredArticles = [],
  quickHelpCards = [],
  helpCenterCards = [],
  helpCategories = [],
  backgroundImage = "/images/resources-bg.jpg",
  className = "",
  onSearch,
  defaultTab = "getting-started"
}: ResourcesHelpTemplateProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [searchQuery, setSearchQuery] = useState("");

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const getArticleIconColor = (color: string = 'orange') => {
    const colors = {
      orange: 'text-orange-400',
      blue: 'text-blue-400', 
      purple: 'text-purple-400',
      green: 'text-green-400'
    };
    return colors[color as keyof typeof colors] || colors.orange;
  };

  const getHelpCardColors = (color: string = 'orange') => {
    const colors = {
      orange: {
        bg: 'bg-orange-500/20 border-orange-500/30',
        icon: 'text-orange-400',
        button: 'bg-orange-600 hover:bg-orange-700'
      },
      purple: {
        bg: 'bg-purple-500/20 border-purple-500/30', 
        icon: 'text-purple-400',
        button: 'border-purple-500/30 text-purple-300 hover:bg-purple-500/10 hover:text-purple-200'
      },
      blue: {
        bg: 'bg-blue-500/20 border-blue-500/30',
        icon: 'text-blue-400', 
        button: 'border-blue-500/30 text-blue-300 hover:bg-blue-500/10 hover:text-blue-200'
      },
      green: {
        bg: 'bg-green-500/20 border-green-500/30',
        icon: 'text-green-400',
        button: 'border-green-500/30 text-green-300 hover:bg-green-500/10 hover:text-green-200'
      }
    };
    return colors[color as keyof typeof colors] || colors.orange;
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  return (
    <div className={`space-y-12 ${className}`}>
      {/* Hero Section */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="relative mb-10 rounded-xl overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40 z-10"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 opacity-40"
          style={{ backgroundImage: `url('${backgroundImage}')` }}
        ></div>
        
        <div className="relative z-20 px-8 py-12 md:py-16 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            {title}
          </h1>
          <p className="text-xl text-gray-200 mb-6">
            {subtitle}
          </p>
          
          <div className="relative max-w-md">
            <Input
              type="text"
              placeholder={searchPlaceholder}
              className="pr-10 bg-black/50 border-gray-700 backdrop-blur-sm focus:ring-orange-500/50 text-white"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-300" />
          </div>
        </div>
      </motion.div>

      {/* Featured Articles */}
      {featuredArticles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-orange-400" />
              <h2 className="text-2xl font-bold text-white">Featured Resources</h2>
            </div>
            <Button variant="link" className="text-orange-400 hover:text-white">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredArticles.map((article, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                className="cursor-pointer"
                onClick={() => setActiveTab(article.category)}
              >
                <Card className="bg-black/60 border-gray-800 h-full hover:border-orange-400/40 hover:bg-black/70 transition-all shadow-lg shadow-black/20">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="h-10 w-10 rounded-full bg-black/80 border border-gray-700 flex items-center justify-center">
                        <article.icon className={`h-5 w-5 ${getArticleIconColor(article.color)}`} />
                      </div>
                      <Badge variant="secondary" className="bg-black/70 text-gray-300 border-gray-700">
                        {article.tag}
                      </Badge>
                    </div>
                    <CardTitle className="mt-4 text-xl text-white">{article.title}</CardTitle>
                    <CardDescription className="text-gray-300">{article.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Help Section */}
      {quickHelpCards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 mb-6">
            <MessageCircle className="h-5 w-5 text-orange-400" />
            <h2 className="text-2xl font-bold text-white">Need Help?</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickHelpCards.map((card, index) => (
              <Card key={index} className="bg-gradient-to-br from-black/70 to-black/50 border-gray-800 hover:border-orange-400/40 transition-all shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex gap-4 items-start">
                    <div className={`h-12 w-12 rounded-full ${card.variant === 'primary' ? 'bg-orange-500/20 border-orange-500/30' : 'bg-purple-500/20 border-purple-500/30'} border flex items-center justify-center flex-shrink-0`}>
                      <card.icon className={`h-6 w-6 ${card.variant === 'primary' ? 'text-orange-400' : 'text-purple-400'}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-white">{card.title}</h3>
                      <p className="text-gray-300 mb-4">{card.description}</p>
                      <Button 
                        onClick={card.onAction}
                        className={card.variant === 'primary' ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-md' : 'border-purple-500/30 text-purple-300 hover:bg-purple-500/10 hover:text-purple-200 shadow-md'}
                        variant={card.variant === 'primary' ? 'default' : 'outline'}
                      >
                        {card.buttonText}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Main Content Tabs */}
      {helpCategories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-black/60 border-gray-800 backdrop-blur-sm p-6 shadow-xl">
            <Tabs defaultValue={defaultTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full bg-black/70 p-1" style={{ gridTemplateColumns: `repeat(${helpCategories.length}, 1fr)` }}>
                {helpCategories.map((category) => (
                  <TabsTrigger 
                    key={category.id}
                    value={category.id} 
                    className="flex items-center gap-2 data-[state=active]:bg-orange-500/30 data-[state=active]:text-white text-gray-300"
                  >
                    <category.icon className="h-4 w-4" />
                    <span>{category.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {helpCategories.map((category) => (
                <TabsContent key={category.id} value={category.id} className="mt-6 focus-visible:outline-none">
                  {category.content}
                </TabsContent>
              ))}
            </Tabs>
          </Card>
        </motion.div>
      )}

      {/* Help Center */}
      {helpCenterCards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 mb-8"
        >
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="h-5 w-5 text-orange-400" />
            <h2 className="text-2xl font-bold text-white">Help Center</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {helpCenterCards.map((card, index) => {
              const colors = getHelpCardColors(card.color);
              return (
                <Card key={index} className="bg-black/70 border-gray-800 hover:border-orange-400/40 transition-all shadow-lg">
                  <CardContent className="pt-6 flex flex-col items-center text-center">
                    <div className={`h-16 w-16 rounded-full ${colors.bg} border flex items-center justify-center mb-4`}>
                      <card.icon className={`h-8 w-8 ${colors.icon}`} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-white">{card.title}</h3>
                    <p className="text-gray-300 mb-4">{card.description}</p>
                    <Button 
                      onClick={card.onAction}
                      className={card.color === 'orange' ? colors.button : `${colors.button} shadow-md`}
                      variant={card.color === 'orange' ? 'default' : 'outline'}
                    >
                      {card.buttonText}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}