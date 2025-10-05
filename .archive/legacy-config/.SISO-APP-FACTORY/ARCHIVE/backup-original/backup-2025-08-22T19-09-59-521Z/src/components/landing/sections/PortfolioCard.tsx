import { memo } from 'react';
import { ExternalLink, Eye, Code, Star, TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PortfolioItem, categoryColors, categoryLabels } from './PortfolioData';

interface PortfolioCardProps {
  item: PortfolioItem;
  index: number;
}

export const PortfolioCard = memo(({ item, index }: PortfolioCardProps) => {
  const getStatusBadge = (status: PortfolioItem['status']) => {
    const statusConfig = {
      'live': { label: 'Live', class: 'bg-green-500/30 text-green-200' },
      'demo': { label: 'Demo', class: 'bg-blue-500/30 text-blue-200' },
      'custom': { label: 'Custom', class: 'bg-purple-500/30 text-purple-200' },
      'coming-soon': { label: 'Coming Soon', class: 'bg-orange-500/30 text-orange-200' }
    };
    
    const config = statusConfig[status];
    return (
      <span className={cn("px-2 py-0.5 text-xs rounded-full font-medium", config.class)}>
        {config.label}
      </span>
    );
  };

  const formatPrice = (priceRange: PortfolioItem['priceRange']) => {
    const { min, max, currency } = priceRange;
    if (min === max) {
      return `${currency}${min.toLocaleString()}`;
    }
    return `${currency}${min.toLocaleString()} - ${currency}${max.toLocaleString()}`;
  };

  const handleViewLive = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.liveUrl) {
      window.open(item.liveUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleViewDemo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.demoUrl) {
      window.open(item.demoUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-lg border border-gray-700 bg-gray-900/80 
        backdrop-blur-sm hover:bg-gray-800/90 transition-all duration-200 cursor-pointer
        hover:border-siso-orange/50 hover:shadow-lg hover:shadow-siso-orange/10
        transform hover:-translate-y-1"
    >
      {/* Image/Screenshot Area */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
        {item.imageUrl ? (
          <img 
            src={item.imageUrl} 
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-siso-red/20 to-siso-orange/20">
            <Code className="w-16 h-16 text-gray-400" />
          </div>
        )}
        
        {/* Status and Category Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {getStatusBadge(item.status)}
          <span className={cn("px-2 py-0.5 text-xs rounded-full font-medium", categoryColors[item.category])}>
            {categoryLabels[item.category]}
          </span>
        </div>

        {/* Price Badge */}
        <div className="absolute top-3 right-3">
          <span className="px-3 py-1 text-sm font-bold bg-gray-900/90 text-white rounded-full border border-gray-600">
            {formatPrice(item.priceRange)}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 space-y-4">
        {/* Title and Description */}
        <div>
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-siso-orange transition-colors">
            {item.title}
          </h3>
          <p className="text-gray-300 text-sm line-clamp-2">
            {item.description}
          </p>
        </div>

        {/* Features List */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-200">Key Features:</h4>
          <div className="flex flex-wrap gap-1">
            {item.features.slice(0, 3).map((feature, i) => (
              <span 
                key={i}
                className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded border border-gray-700"
              >
                {feature}
              </span>
            ))}
            {item.features.length > 3 && (
              <span className="px-2 py-1 text-xs bg-gray-700 text-gray-400 rounded">
                +{item.features.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Metrics (if available) */}
        {item.metrics && item.metrics.length > 0 && (
          <div className="grid grid-cols-3 gap-2 py-2 border-t border-gray-700">
            {item.metrics.slice(0, 3).map((metric, i) => (
              <div key={i} className="text-center">
                <div className="text-siso-orange font-bold text-sm">{metric.value}</div>
                <div className="text-gray-400 text-xs">{metric.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Technologies */}
        <div className="flex flex-wrap gap-1">
          {item.technologies.slice(0, 4).map((tech, i) => (
            <span 
              key={i}
              className="px-2 py-1 text-xs bg-siso-red/20 text-siso-red rounded border border-siso-red/30"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {item.liveUrl && (
            <button
              onClick={handleViewLive}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 
                bg-siso-orange hover:bg-siso-orange/80 text-white text-sm font-medium 
                rounded transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View Live
            </button>
          )}
          {item.demoUrl && (
            <button
              onClick={handleViewDemo}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 
                bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium 
                rounded transition-colors border border-gray-600"
            >
              <Eye className="w-4 h-4" />
              Demo
            </button>
          )}
        </div>

        {/* Client Testimonial (if available) */}
        {item.clientTestimonial && (
          <div className="bg-gray-800/50 p-3 rounded border border-gray-700 mt-4">
            <div className="flex items-start gap-2">
              <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-gray-300 text-xs italic mb-1">
                  "{item.clientTestimonial.quote}"
                </p>
                <p className="text-gray-400 text-xs">
                  <strong>{item.clientTestimonial.author}</strong>, {item.clientTestimonial.company}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hover Overlay Effect (similar to leaderboard) */}
      <div className="absolute inset-0 bg-gradient-to-t from-siso-orange/5 to-transparent 
        opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
    </motion.div>
  );
});

PortfolioCard.displayName = 'PortfolioCard'; 