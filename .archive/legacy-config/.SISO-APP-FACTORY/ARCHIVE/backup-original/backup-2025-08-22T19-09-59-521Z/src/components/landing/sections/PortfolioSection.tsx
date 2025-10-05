import { memo, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, Filter, ChevronRight, Briefcase, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PortfolioCard } from './PortfolioCard';
import { portfolioItems, categoryLabels, PortfolioCategory } from './PortfolioData';

const filterOptions: { value: PortfolioCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Projects' },
  { value: 'events', label: 'Events' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'beauty', label: 'Beauty' },
  { value: 'fintech', label: 'Fintech' },
  { value: 'real-estate', label: 'Real Estate' }
];

export const PortfolioSection = memo(() => {
  const [activeFilter, setActiveFilter] = useState<PortfolioCategory | 'all'>('all');

  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') {
      return portfolioItems;
    }
    return portfolioItems.filter(item => item.category === activeFilter);
  }, [activeFilter]);

  const totalProjects = portfolioItems.length;
  const liveProjects = portfolioItems.filter(item => item.status === 'live').length;
  const avgPrice = Math.round(
    portfolioItems.reduce((sum, item) => sum + (item.priceRange.min + item.priceRange.max) / 2, 0) / totalProjects
  );

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent" />
      <div className="absolute top-1/4 -right-1/4 w-[400px] md:w-[800px] h-[400px] md:h-[800px] 
        bg-siso-orange/10 rounded-full filter blur-[120px] md:blur-[160px] transform-gpu" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
            bg-gray-800/50 border border-gray-700 mb-6">
            <FolderOpen className="w-5 h-5 text-siso-orange" />
            <span className="text-gray-300 text-sm font-medium">Our Portfolio</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Proven Solutions for
            <span className="bg-gradient-to-r from-siso-red to-siso-orange bg-clip-text text-transparent">
              {' '}Every Business
            </span>
          </h2>
          
          <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto mb-8">
            From event management to fintech platforms, we've built templates and custom solutions 
            that drive real results for businesses across industries.
          </p>

          {/* Stats Row */}
          <div className="flex justify-center gap-8 md:gap-12 mb-8">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-siso-orange">{totalProjects}+</div>
              <div className="text-gray-400 text-sm">Templates Built</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-siso-orange">{liveProjects}</div>
              <div className="text-gray-400 text-sm">Live Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-siso-orange">€{avgPrice.toLocaleString()}</div>
              <div className="text-gray-400 text-sm">Avg. Investment</div>
            </div>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12"
        >
          {filterOptions.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-full transition-all duration-200",
                "border border-gray-700 hover:border-siso-orange/50",
                activeFilter === filter.value
                  ? "bg-siso-orange text-white border-siso-orange shadow-lg shadow-siso-orange/20"
                  : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white"
              )}
            >
              <div className="flex items-center gap-2">
                <Filter className="w-3 h-3" />
                {filter.label}
                {activeFilter === filter.value && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-white/20 rounded-full">
                    {filteredItems.length}
                  </span>
                )}
              </div>
            </button>
          ))}
        </motion.div>

        {/* Portfolio Grid */}
        <motion.div
          key={activeFilter} // Re-animate when filter changes
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 mb-12"
        >
          {filteredItems.map((item, index) => (
            <PortfolioCard
              key={item.id}
              item={item}
              index={index}
            />
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No projects found in this category</p>
            <button
              onClick={() => setActiveFilter('all')}
              className="mt-4 text-siso-orange hover:text-siso-orange/80 transition-colors font-medium"
            >
              View All Projects
            </button>
          </motion.div>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-4 p-6 rounded-xl bg-gradient-to-r 
            from-gray-800/50 to-gray-900/50 border border-gray-700 backdrop-blur-sm">
            <div className="text-left">
              <h3 className="text-xl font-bold text-white mb-2">
                Ready to Build Your Custom Solution?
              </h3>
              <p className="text-gray-300 text-sm">
                Let's discuss your project and create something amazing together
              </p>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-siso-orange 
              hover:bg-siso-orange/80 text-white font-semibold rounded-lg 
              transition-all duration-200 transform hover:scale-105 whitespace-nowrap">
              Get Started
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-6 px-6 py-3 rounded-full 
            bg-gray-800/30 border border-gray-700/50">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-gray-300 text-sm">99% Client Satisfaction</span>
            </div>
            <div className="w-px h-4 bg-gray-600" />
            <div className="flex items-center gap-2">
              <span className="text-green-500">●</span>
              <span className="text-gray-300 text-sm">24/7 Support Included</span>
            </div>
            <div className="w-px h-4 bg-gray-600" />
            <div className="flex items-center gap-2">
              <span className="text-blue-500">🔒</span>
              <span className="text-gray-300 text-sm">Enterprise Security</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

PortfolioSection.displayName = 'PortfolioSection'; 