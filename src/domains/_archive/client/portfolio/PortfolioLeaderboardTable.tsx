import React from 'react';
import { Trophy, ExternalLink, Zap, Users, TrendingUp, Code, Database, Palette, Globe, Package, PoundSterling, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { LeaderboardEntry } from '@/internal/leaderboard/types';

interface PortfolioLeaderboardTableProps {
  projectData: (LeaderboardEntry & {
    project_name: string;
    live_url: string;
    technologies: string[];
    development_status: string;
    completion_percentage: number;
    estimated_value?: number;
  })[];
  onProjectClick: (entry: any) => void;
}

export const PortfolioLeaderboardTable = ({ projectData, onProjectClick }: PortfolioLeaderboardTableProps) => {
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-xs font-medium">LIVE</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-blue-400 text-xs font-medium">BUILDING</span>
          </div>
        );
    }
  };

  const getRankBadge = (position: number) => {
    switch (position) {
      case 0:
        return (
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/25">
              <Trophy className="h-8 w-8 text-yellow-900" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-siso-orange to-siso-red rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">1</span>
            </div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 animate-pulse"></div>
          </div>
        );
      case 1:
        return (
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 rounded-full flex items-center justify-center shadow-lg shadow-gray-400/25">
              <Trophy className="h-7 w-7 text-gray-700" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-siso-orange to-siso-red rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">2</span>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 rounded-full flex items-center justify-center shadow-lg shadow-amber-600/25">
              <Trophy className="h-6 w-6 text-amber-200" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-siso-orange to-siso-red rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">3</span>
            </div>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center border border-gray-600 shadow-lg">
            <span className="text-gray-300 text-sm font-bold">{position + 1}</span>
          </div>
        );
    }
  };

  const getTechIcon = (tech: string) => {
    const techLower = tech.toLowerCase();
    if (techLower.includes('react') || techLower.includes('next')) return { icon: Code, color: 'text-blue-400 bg-blue-400/10' };
    if (techLower.includes('node') || techLower.includes('express')) return { icon: Database, color: 'text-green-400 bg-green-400/10' };
    if (techLower.includes('typescript') || techLower.includes('javascript')) return { icon: Code, color: 'text-yellow-400 bg-yellow-400/10' };
    if (techLower.includes('tailwind') || techLower.includes('css')) return { icon: Palette, color: 'text-cyan-400 bg-cyan-400/10' };
    if (techLower.includes('vercel') || techLower.includes('netlify')) return { icon: Globe, color: 'text-purple-400 bg-purple-400/10' };
    return { icon: Code, color: 'text-gray-400 bg-gray-400/10' };
  };

  const getAgencyValueMetrics = (projectName: string, ourPrice: number) => {
    const metrics = {
      'Gritness Gym': { 
        features: 12, 
        rrp: ourPrice * 8, // £995 vs £7,960 RRP
        benefit: '+£6K/month upsells via app' 
      },
      'OPTIMAL CONSTRUCTION': { 
        features: 18, 
        rrp: ourPrice * 6, // £15,000 vs £90,000 RRP
        benefit: '£50K+/year savings through processes' 
      },
      'UbahCryp': { 
        features: 24, 
        rrp: 120000, // £6,000 vs £120,000 quoted by others
        benefit: 'Advanced crypto platform in 3 weeks' 
      },
      'Elementree': { 
        features: 8, 
        rrp: ourPrice * 7, // £498 vs £3,486 RRP
        benefit: 'Record month turnover via loyalty scheme' 
      },
      'Trojan MMA': { 
        features: 10, 
        rrp: ourPrice * 6, // £498 vs £2,988 RRP
        benefit: 'Complete MMA management solution' 
      },
      'Lets Go': { 
        features: 15, 
        rrp: 5000, // £750 vs £5,000 quoted by others
        benefit: 'Social platform in record time' 
      },
      'Mu Shin': { 
        features: 14, 
        rrp: 7500, // £2,490 vs £7,500 (2 years) by other dev
        benefit: 'Training platform in 3 weeks vs 2 years' 
      },
      '5 Star Hire': { 
        features: 11, 
        rrp: ourPrice * 8, // £498 vs £3,984 RRP
        benefit: 'Premium rental booking system' 
      },
      'NM Construction': { 
        features: 9, 
        rrp: ourPrice * 7, // £1,250 vs £8,750 RRP
        benefit: 'Professional showcase & lead generation' 
      }
    };
    return metrics[projectName as keyof typeof metrics] || { 
      features: 8, 
      rrp: ourPrice * 6, 
      benefit: 'Custom solution at fraction of agency cost' 
    };
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

  const handleProjectClick = (entry: any) => {
    onProjectClick(entry);
  };

  const handleViewLiveClick = (entry: any, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(entry.live_url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-4">
      {projectData.map((entry, index) => {
        const estimatedValue = entry.estimated_value ?? 0;
        const metrics = getAgencyValueMetrics(entry.project_name, estimatedValue);
        const isTopThree = index < 3;
        const savings = metrics.rrp - estimatedValue;
        const savingsMultiplier = estimatedValue > 0 ? Math.round(metrics.rrp / estimatedValue) : 0;
        
        return (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className={`group relative overflow-hidden rounded-2xl border cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
              isTopThree 
                ? 'bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-gray-900/90 border-siso-orange/30 shadow-lg shadow-siso-orange/10' 
                : 'bg-gradient-to-br from-gray-900/70 via-gray-800/60 to-gray-900/70 border-gray-700/50 hover:border-siso-orange/20'
            }`}
            style={{
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)'
            }}
            onClick={() => handleProjectClick(entry)}
          >
            {/* Premium Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-siso-orange/5 via-transparent to-siso-red/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                {/* Left Section: Rank + Project Info */}
                <div className="flex items-start gap-6">
                  {/* Rank Badge */}
                  <div className="flex-shrink-0">
                    {getRankBadge(index)}
                  </div>
                  
                  {/* Project Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white group-hover:text-siso-orange transition-colors duration-200">
                        {entry.project_name}
                      </h3>
                      {getStatusBadge(entry.development_status)}
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-3 leading-relaxed">
                      {getProjectDescription(entry.project_name)}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-300">
                        <span className="text-gray-500">Client:</span> {entry.profile?.full_name}
                      </span>
                      <span className="text-siso-orange font-bold text-lg">
                        £{estimatedValue.toLocaleString()}
                      </span>
                      <span className="text-green-400 text-xs font-medium px-2 py-1 bg-green-400/10 rounded-lg border border-green-400/20">
                        {savingsMultiplier}x SAVINGS
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Right Section: Action Button */}
                <button
                  onClick={(e) => handleViewLiveClick(entry, e)}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-siso-orange to-siso-red hover:from-siso-red hover:to-siso-orange text-black font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-siso-orange/25 hover:scale-105"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Live
                </button>
              </div>
              
              {/* Middle Section: Technology Stack */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Technology Stack</h4>
                <div className="flex flex-wrap gap-2">
                  {entry.technologies.slice(0, 6).map((tech, techIndex) => {
                    const { icon: TechIcon, color } = getTechIcon(tech);
                    return (
                      <div
                        key={techIndex}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-600/50 backdrop-blur-sm ${color} transition-all duration-200 hover:scale-105`}
                      >
                        <TechIcon className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium text-gray-200">{tech}</span>
                      </div>
                    );
                  })}
                  {entry.technologies.length > 6 && (
                    <div className="flex items-center px-3 py-1.5 rounded-lg border border-gray-600/50 bg-gray-400/10">
                      <span className="text-xs font-medium text-gray-400">
                        +{entry.technologies.length - 6} more
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Agency Value Proposition Section */}
              <div className="mb-4 p-4 bg-gradient-to-r from-siso-orange/10 via-siso-red/5 to-siso-orange/10 rounded-lg border border-siso-orange/20">
                <h4 className="text-sm font-medium text-siso-orange mb-2">Agency Value Delivered</h4>
                <p className="text-gray-300 text-sm mb-3">{metrics.benefit}</p>
                <div className="flex items-center gap-6 text-xs">
                  <div className="flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-gray-400">Features:</span>
                    <span className="text-blue-400 font-medium">{metrics.features}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <PoundSterling className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-gray-400">Others quote:</span>
                    <span className="text-red-400 font-medium">£{metrics.rrp.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-gray-400">Client saved:</span>
                    <span className="text-green-400 font-medium">£{savings.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              {/* Bottom Section: Progress */}
              <div className="flex items-center justify-between">
                {/* Progress Bar */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 font-medium">Progress</span>
                  <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-siso-orange to-siso-red transition-all duration-500 ease-out"
                      style={{ width: `${entry.completion_percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-300 font-medium">{entry.completion_percentage}%</span>
                </div>
                
                {/* Value Highlight */}
                <div className="text-right">
                  <div className="text-xs text-gray-400">Total Client Investment</div>
                  <div className="text-lg font-bold text-siso-orange">£{estimatedValue.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}; 