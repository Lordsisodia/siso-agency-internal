import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Code, Building, Calendar, Users, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
}

export const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  isOpen,
  onClose,
  project
}) => {
  if (!project) return null;

  const getProjectDetails = (projectName: string) => {
    const details = {
      'Gritness Gym': {
        industry: 'Fitness & Health',
        description: 'A comprehensive fitness platform that revolutionizes gym management and member experience.',
        keyFeatures: [
          'Real-time class scheduling system',
          'Membership management portal',
          'Trainer profile and booking system',
          'Workout tracking and progress analytics'
        ],
        businessValue: 'Increased member engagement by 40% and streamlined gym operations',
        headerImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=300&fit=crop&crop=center'
      },
      'UbahCryp': {
        industry: 'Financial Technology',
        description: 'Advanced cryptocurrency trading platform with real-time market data and secure wallet integration.',
        keyFeatures: [
          'Real-time cryptocurrency market data',
          'Secure wallet integration',
          'Advanced trading charts and analytics',
          'Multi-currency support'
        ],
        businessValue: 'Processing $2M+ in monthly trading volume with 99.9% uptime',
        headerImage: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&h=300&fit=crop&crop=center'
      },
      'Elementree': {
        industry: 'Food & Beverage',
        description: 'Modern restaurant management system with online ordering and reservation management.',
        keyFeatures: [
          'Online ordering and delivery system',
          'Table reservation management',
          'Digital menu with real-time updates',
          'Customer loyalty program'
        ],
        businessValue: 'Increased online orders by 60% and improved customer satisfaction scores',
        headerImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=300&fit=crop&crop=center'
      },
      'Trojan MMA': {
        industry: 'Sports & Training',
        description: 'Comprehensive Mixed Martial Arts gym platform featuring class management and training programs.',
        keyFeatures: [
          'Class scheduling and attendance tracking',
          'Fighter profile and statistics',
          'Training program management',
          'Event and competition tracking'
        ],
        businessValue: 'Improved student retention by 35% through better engagement tools',
        headerImage: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&h=300&fit=crop&crop=center'
      },
      'NM Construction': {
        industry: 'Construction',
        description: 'Professional construction company platform showcasing projects and services.',
        keyFeatures: [
          'Project portfolio showcase',
          'Service catalog and quotes',
          'Client communication portal',
          'Project timeline tracking'
        ],
        businessValue: 'Generated 50% more qualified leads through professional online presence',
        headerImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=300&fit=crop&crop=center'
      },
      'OPTIMAL CONSTRUCTION': {
        industry: 'Building Maintenance',
        description: 'Building maintenance and construction services platform with service booking.',
        keyFeatures: [
          'Service booking and scheduling',
          'Project tracking dashboard',
          'Customer relationship management',
          'Maintenance request system'
        ],
        businessValue: 'Streamlined operations and improved customer response time by 45%',
        headerImage: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&h=300&fit=crop&crop=center'
      },
      'Lets Go': {
        industry: 'Social Networking',
        description: 'Social networking and event planning application connecting people through shared interests.',
        keyFeatures: [
          'Event creation and management',
          'Social networking features',
          'Location-based discovery',
          'Real-time messaging system'
        ],
        businessValue: 'Facilitated 10,000+ social connections and events in first year',
        headerImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=300&fit=crop&crop=center'
      },
      'Mu Shin': {
        industry: 'Education & Training',
        description: 'Self-defense training platform offering structured video courses and certification programs.',
        keyFeatures: [
          'Video course library',
          'Progress tracking system',
          'Certification programs',
          'Interactive learning tools'
        ],
        businessValue: 'Enabled remote learning for 500+ students with 95% completion rates',
        headerImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=300&fit=crop&crop=center'
      },
      '5 Star Hire': {
        industry: 'Automotive Rental',
        description: 'Premium car rental service platform with advanced booking system and fleet management.',
        keyFeatures: [
          'Advanced booking system',
          'Fleet management tools',
          'Customer service portal',
          'Mobile app integration'
        ],
        businessValue: 'Increased booking efficiency by 50% and customer satisfaction to 4.8/5',
        headerImage: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&h=300&fit=crop&crop=center'
      }
    };
    return details[projectName as keyof typeof details] || {
      industry: 'Technology',
      description: 'Custom digital solution built to meet specific business requirements.',
      keyFeatures: ['Custom development', 'Modern technology stack', 'Scalable architecture'],
      businessValue: 'Delivered measurable business improvements',
      headerImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=300&fit=crop&crop=center'
    };
  };

  const projectDetails = getProjectDetails(project.project_name);

  const handleViewApp = () => {
    window.open(project.live_url, '_blank', 'noopener,noreferrer');
  };

  const handleImageClick = () => {
    window.open(project.live_url, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with higher z-index than navigation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* Modal - Fixed height to prevent scrolling */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-6xl w-full h-[85vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="bg-black/95 backdrop-blur-sm border border-gray-700 shadow-2xl h-full flex flex-col">
                {/* Header Image - Clickable */}
                <motion.div 
                  className="relative h-48 overflow-hidden cursor-pointer group/image"
                  onClick={handleImageClick}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <img 
                    src={projectDetails.headerImage} 
                    alt={project.project_name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-105"
                  />
                  {/* Image overlay with gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Click indicator */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300">
                    <div className="bg-black/50 backdrop-blur-sm rounded-full p-2">
                      <ExternalLink className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  
                  {/* Back Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose();
                    }}
                    className="absolute top-4 left-4 p-2 text-white hover:text-gray-300 hover:bg-black/50 rounded-lg transition-colors z-10 flex items-center gap-2 backdrop-blur-sm"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="text-sm">Back</span>
                  </button>
                  
                  {/* Close Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose();
                    }}
                    className="absolute top-4 right-16 p-2 text-white hover:text-gray-300 hover:bg-black/50 rounded-lg transition-colors z-10 backdrop-blur-sm"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* Project Title Overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-siso-orange to-siso-red flex items-center justify-center text-white font-bold text-xl">
                        {project.project_name.charAt(0)}
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold text-white mb-1">
                          {project.project_name}
                        </h1>
                        <div className="flex items-center gap-4 text-sm text-gray-300">
                          <span className="flex items-center gap-1">
                            <Building className="w-4 h-4" />
                            {project.profile?.full_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {projectDetails.industry}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            £{project.estimated_value?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Content - Scrollable if needed */}
                <CardContent className="flex-1 p-6 overflow-y-auto">
                  {/* Status Badges */}
                  <div className="flex gap-3 mb-6">
                    <span className="px-3 py-1 text-sm bg-green-500/20 text-green-300 rounded-lg border border-green-500/30 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Live & Active
                    </span>
                    <span className="px-3 py-1 text-sm bg-siso-orange/20 text-siso-orange rounded-lg border border-siso-orange/30">
                      Partner Project
                    </span>
                  </div>

                  {/* Horizontal Layout for Desktop */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      {/* Project Description */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                          <Code className="w-4 h-4 text-siso-orange" />
                          Project Overview
                        </h3>
                        <p className="text-gray-300 leading-relaxed text-sm">
                          {projectDetails.description}
                        </p>
                      </div>

                      {/* Technologies */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Technology Stack</h3>
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.map((tech: string, index: number) => (
                            <span
                              key={index}
                              className="px-3 py-1 text-xs bg-gray-800/60 text-gray-300 rounded-lg border border-gray-700 hover:border-siso-orange/50 transition-colors"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Business Impact */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Business Impact</h3>
                        <div className="bg-gradient-to-r from-siso-orange/10 to-red-500/10 border border-siso-orange/30 rounded-lg p-3">
                          <p className="text-siso-orange font-medium text-sm">
                            {projectDetails.businessValue}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      {/* Key Features */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Key Features</h3>
                        <div className="space-y-2">
                          {projectDetails.keyFeatures.map((feature, index) => (
                            <div key={index} className="flex items-start gap-2 p-2 bg-gray-800/30 rounded-lg border border-gray-700/50">
                              <div className="w-1.5 h-1.5 bg-siso-orange rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-gray-300 text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Project Stats */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">Project Statistics</h3>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                            <div className="text-xl font-bold text-siso-orange">£{project.estimated_value?.toLocaleString()}</div>
                            <div className="text-xs text-gray-400">Project Value</div>
                          </div>
                          <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                            <div className="text-xl font-bold text-green-400">6x</div>
                            <div className="text-xs text-gray-400">Cost Savings</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>

                {/* Action Buttons - Fixed at bottom */}
                <div className="flex gap-3 p-6 pt-0 border-t border-gray-800">
                  <Button
                    onClick={handleViewApp}
                    className="bg-gradient-to-r from-siso-orange to-red-600 hover:from-siso-orange/90 hover:to-red-600/90 text-white font-medium flex items-center gap-2 flex-1 py-2 text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Live Application
                  </Button>
                  <Button
                    onClick={onClose}
                    className="bg-gray-800/60 hover:bg-gray-700/80 text-gray-200 border border-gray-600/50 hover:border-gray-500 px-6 py-2 text-sm"
                  >
                    Close
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}; 