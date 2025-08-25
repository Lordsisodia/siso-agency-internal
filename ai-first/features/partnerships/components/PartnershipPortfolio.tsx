import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, ArrowRight, ExternalLink, Code, Database, Palette, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProjectDetailsModal } from '@/components/portfolio/ProjectDetailsModal';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import { adaptPortfolioToLeaderboard } from '@/components/portfolio/PortfolioLeaderboardAdapter';
import { Badge } from '@/components/ui/badge';

interface PartnershipPortfolioProps {
  onApplyNow: () => void;
}

export const PartnershipPortfolio = memo(({ onApplyNow }: PartnershipPortfolioProps) => {
  const { items, loading } = usePortfolioData();
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const portfolioEntries = adaptPortfolioToLeaderboard(items);
  const totalProjects = items.length;

  const handleProjectClick = (project: any) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  const getRankBadge = (position: number) => {
    switch (position) {
      case 0:
        return (
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/25">
              <Trophy className="h-6 w-6 text-yellow-900" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">1</span>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 rounded-full flex items-center justify-center shadow-lg shadow-gray-400/25">
              <Trophy className="h-5 w-5 text-gray-700" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">2</span>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 rounded-full flex items-center justify-center shadow-lg shadow-amber-600/25">
              <Trophy className="h-5 w-5 text-amber-200" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">3</span>
            </div>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center border border-gray-600 shadow-lg">
            <span className="text-gray-300 text-sm font-bold">{position + 1}</span>
          </div>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 rounded-md">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-xs font-medium">LIVE</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-md">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-blue-400 text-xs font-medium">BUILDING</span>
          </div>
        );
    }
  };

  const getTechIcon = (tech: string) => {
    const techLower = tech.toLowerCase();
    if (techLower.includes('react') || techLower.includes('next')) return { icon: Code, color: 'text-blue-400 bg-blue-400/10' };
    if (techLower.includes('node') || techLower.includes('express')) return { icon: Database, color: 'text-green-400 bg-green-400/10' };
    if (techLower.includes('tailwind') || techLower.includes('css')) return { icon: Palette, color: 'text-cyan-400 bg-cyan-400/10' };
    if (techLower.includes('vercel') || techLower.includes('netlify')) return { icon: Globe, color: 'text-purple-400 bg-purple-400/10' };
    return { icon: Code, color: 'text-gray-400 bg-gray-400/10' };
  };

  const getProjectDescription = (projectName: string) => {
    const descriptions = {
      'Gritness Gym': 'Fitness platform with class scheduling & membership management',
      'NM Construction': 'Professional construction website with project showcases',
      'OPTIMAL CONSTRUCTION': 'Building maintenance & construction services platform',
      'UbahCryp': 'Advanced cryptocurrency trading platform with real-time data',
      'Elementree': 'Modern restaurant website with online ordering system',
      'Trojan MMA': 'MMA gym with class schedules & training programs',
      'Lets Go': 'Social networking & event planning application',
      'Mu Shin': 'Self-defense training platform with video courses',
      '5 Star Hire': 'Premium car rental service with booking system'
    };
    return descriptions[projectName as keyof typeof descriptions] || 'Custom digital solution';
  };

  const handleViewLiveClick = (entry: any, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(entry.live_url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div className="relative w-full px-4 overflow-hidden">
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Badge className="bg-orange-500/10 border-orange-500/20 text-orange-400 hover:bg-orange-500/20 mb-6">
              Success Stories
            </Badge>
            <h2 className="text-xl md:text-3xl md:text-5xl tracking-tighter lg:max-w-xl font-regular text-center text-white mx-auto mb-6">
              Partnership 
              <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                {" "}Success Stories
              </span>
            </h2>
            <p className="text-base lg:text-lg leading-relaxed tracking-tight text-gray-300 max-w-2xl mx-auto">
              See how our agency partners have transformed their businesses and achieved remarkable growth with SISO's platform.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              </div>
            ) : (
              <div className="relative">
                {/* Horizontal Scrolling Container */}
                <div className="overflow-x-auto scrollbar-hide pb-4">
                  <div className="flex gap-6 w-max">
                    {portfolioEntries.slice(0, 10).map((entry, index) => {
                      const isTopThree = index < 3;
                      const savingsMultiplier = Math.round((entry.points * 6) / entry.points);
                      
                      return (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, x: 50 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          className="group relative w-[45vw] max-w-[500px] min-w-[400px]"
                          onClick={() => handleProjectClick(entry)}
                        >
                          {/* Background blur layer - exactly like main landing page */}
                          <div className="absolute inset-0 bg-gradient-to-r from-siso-red/5 to-siso-orange/5 rounded-2xl transform group-hover:scale-105 transition-transform duration-300 blur-md" />
                          
                          {/* Main card container - exactly matching WhyChooseSection */}
                          <div className="relative bg-black/20 backdrop-blur-md border border-siso-text/10 rounded-2xl p-6 hover:border-siso-orange/20 transition-all duration-300 h-full cursor-pointer">
                            
                            {/* Top section with rank and status */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                {getRankBadge(index)}
                                {getStatusBadge('Live')}
                              </div>
                              {isTopThree && (
                                <div className="px-2 py-1 bg-siso-orange/10 border border-siso-orange/20 rounded-md">
                                  <span className="text-xs text-siso-orange font-medium">Featured</span>
                                </div>
                              )}
                            </div>

                            {/* Project title and description */}
                            <div className="mb-4">
                              <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-siso-orange transition-colors duration-200">
                                {entry.profile?.full_name || 'Anonymous Project'}
                              </h3>
                              <p className="text-sm text-siso-text/80 leading-relaxed line-clamp-2">
                                {getProjectDescription(entry.profile?.full_name || 'Project')}
                              </p>
                            </div>

                            {/* Stats section */}
                            <div className="space-y-3 mb-4">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-siso-text/70">Partner:</span>
                                <span className="text-sm text-siso-text font-medium">{entry.profile?.full_name}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-siso-text/70">Value:</span>
                                <span className="text-lg font-bold text-siso-orange">£{(entry.points * 10).toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-siso-text/70">Savings:</span>
                                <span className="text-xs font-medium px-2 py-1 bg-green-400/10 text-green-400 rounded-full border border-green-400/20">
                                  6x SAVINGS
                                </span>
                              </div>
                            </div>

                            {/* Technology stack */}
                            <div className="mb-6">
                              <div className="flex flex-wrap gap-2">
                                {['React', 'TypeScript', 'Node.js'].map((tech, techIndex) => {
                                  const { icon: TechIcon, color } = getTechIcon(tech);
                                  return (
                                    <div key={techIndex} className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs ${color} bg-current/10 border border-current/20`}>
                                      <TechIcon className="w-3 h-3" />
                                      <span className="font-medium">{tech}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-2">
                              <Button
                                onClick={(e) => handleViewLiveClick(entry, e)}
                                className="flex-1 bg-siso-orange/10 hover:bg-siso-orange/20 text-siso-orange border border-siso-orange/20 hover:border-siso-orange/40 transition-all duration-200 text-sm"
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View Live
                              </Button>
                              <Button
                                onClick={() => handleProjectClick(entry)}
                                className="px-4 bg-siso-text/10 hover:bg-siso-text/20 text-siso-text border border-siso-text/20 hover:border-siso-text/40 transition-all duration-200 text-sm"
                              >
                                Details
                              </Button>
                            </div>

                            {/* Corner decorative elements - like main landing page */}
                            <div className="absolute top-0 right-0 w-12 h-12 pointer-events-none">
                              <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-siso-orange/20 rounded-full animate-pulse" />
                              <div className="absolute top-5 right-5 w-1 h-1 bg-siso-red/20 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Scroll Indicator */}
                <div className="flex justify-center mt-4">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <ArrowRight className="w-4 h-4" />
                    <span>Scroll to see more projects</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-8 border border-siso-text/10 hover:border-siso-orange/20 transition-all duration-300 shadow-xl">
              <Star className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">
                Ready to Join Our Success Stories?
              </h3>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                These projects represent real client success stories delivered by our partners. 
                Join our program and start building your own portfolio of successful projects.
              </p>
              <Button
                onClick={onApplyNow}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl group"
              >
                Start Your Partnership Journey
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Project Details Modal */}
      <ProjectDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        project={selectedProject}
      />
    </>
  );
});

PartnershipPortfolio.displayName = 'PartnershipPortfolio'; 