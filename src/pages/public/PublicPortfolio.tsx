import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { GridBackground } from "@/shared/ui/glowing-card";
import { usePortfolioData } from '@/shared/hooks/usePortfolioData';
import { adaptPortfolioToLeaderboard } from '@/features/portfolio/PortfolioLeaderboardAdapter';
import { PortfolioLeaderboardTable } from '@/features/portfolio/PortfolioLeaderboardTable';
import { ProjectDetailsModal } from '@/features/portfolio/ProjectDetailsModal';
import CountUp from 'react-countup';

export default function PublicPortfolio() {
  const { items, loading } = usePortfolioData();
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Set page title for portfolio
  useEffect(() => {
    document.title = 'Portfolio | SISO AGENCY';
    return () => {
      document.title = 'SISO AGENCY';
    };
  }, []);

  const portfolioEntries = adaptPortfolioToLeaderboard(items);

  // Calculate portfolio stats
  const totalProjects = items.length;
  const completedProjects = items.filter(item => item.development_status === 'completed').length;
  const totalValue = portfolioEntries.reduce((sum, entry) => sum + (entry as any).estimated_value, 0);
  const totalTechnologies = [...new Set(items.flatMap(item => item.technologies))].length;

  const handleProjectClick = (project: any) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded mb-4"></div>
            <div className="h-4 bg-gray-800 rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-800 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Custom CSS for animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-gradient {
            animation: gradient 6s ease infinite;
          }
          .bg-300\\% {
            background-size: 300% 300%;
          }
        `
      }} />
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-16">
          
          {/* Enhanced Header with SISO Explanation */}
          <div className="text-center mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <img 
                src="/lovable-uploads/c5921a2f-8856-42f4-bec5-2d08b81c5691.png" 
                alt="SISO Agency" 
                className="w-20 h-20 mx-auto mb-8"
              />
              
              <h1 className="text-6xl md:text-7xl font-bold text-white mb-4">
                SISO AGENCY
              </h1>
              
              <div className="w-24 h-0.5 bg-siso-orange mx-auto mb-8"></div>
              
              <div className="max-w-4xl mx-auto mb-8">
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-6">
                  Scalable Intelligence Systems Operator
                </h2>
                
                <p className="text-xl text-gray-300 leading-relaxed mb-6">
                  We specialize in <span className="text-siso-orange font-semibold">making scalable intelligence systems</span> and 
                  <span className="text-siso-orange font-semibold"> operating them for businesses</span> that want to leverage 
                  cutting-edge technology for growth and innovation.
                </p>
                
                <p className="text-lg text-gray-400">
                  From AI-powered platforms to comprehensive digital solutions, 
                  we build and manage intelligent systems that scale with your business.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Clean Minimal Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <Card className="bg-black border border-gray-800 hover:border-siso-orange/50 transition-all duration-300">
                <CardContent className="pt-8 pb-6">
                  <div className="text-center">
                    <div className="w-3 h-3 bg-siso-orange rounded-full mx-auto mb-4"></div>
                    <p className="text-4xl font-bold text-white mb-2">
                      <CountUp end={totalProjects} delay={0.5} duration={2} />
                    </p>
                    <p className="text-sm text-gray-400 uppercase tracking-wider">Total Projects</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card className="bg-black border border-gray-800 hover:border-siso-orange/50 transition-all duration-300">
                <CardContent className="pt-8 pb-6">
                  <div className="text-center">
                    <div className="w-3 h-3 bg-siso-orange rounded-full mx-auto mb-4"></div>
                    <p className="text-4xl font-bold text-white mb-2">
                      <CountUp end={completedProjects} delay={0.7} duration={2} />
                    </p>
                    <p className="text-sm text-gray-400 uppercase tracking-wider">Completed</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Card className="bg-black border border-gray-800 hover:border-siso-orange/50 transition-all duration-300">
                <CardContent className="pt-8 pb-6">
                  <div className="text-center">
                    <div className="w-3 h-3 bg-siso-orange rounded-full mx-auto mb-4"></div>
                    <p className="text-4xl font-bold text-white mb-2">
                      $<CountUp end={totalValue} delay={0.9} duration={2.5} separator="," />
                    </p>
                    <p className="text-sm text-gray-400 uppercase tracking-wider">Portfolio Value</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Card className="bg-black border border-gray-800 hover:border-siso-orange/50 transition-all duration-300">
                <CardContent className="pt-8 pb-6">
                  <div className="text-center">
                    <div className="w-3 h-3 bg-siso-orange rounded-full mx-auto mb-4"></div>
                    <p className="text-4xl font-bold text-white mb-2">
                      <CountUp end={totalTechnologies} delay={1.1} duration={2} />
                    </p>
                    <p className="text-sm text-gray-400 uppercase tracking-wider">Technologies</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Enhanced Professional Leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mb-20"
          >
            <Card className="border border-gray-800 bg-black">
              <CardHeader className="border-b border-gray-800 py-8">
                <CardTitle className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="w-1 h-8 bg-siso-orange"></div>
                    <h2 className="text-3xl font-bold text-white">Client Project Portfolio</h2>
                    <div className="w-1 h-8 bg-siso-orange"></div>
                  </div>
                  <p className="text-lg text-gray-300 mb-2">
                    Live applications and platforms we've built and operate
                  </p>
                  <p className="text-sm text-gray-400 font-normal">
                    Ranked by complexity, scale, and business impact • {totalProjects} active projects
                  </p>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <PortfolioLeaderboardTable 
                  projectData={portfolioEntries as any} 
                  onProjectClick={handleProjectClick}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Enhanced Glowing CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center"
          >
            <GridBackground
              title="Ready to Start Your Project?"
              description="Join our client portfolio. Let's build something exceptional together with cutting-edge scalable intelligence systems."
              showAvailability={true}
              className="max-w-4xl mx-auto"
            >
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  className="bg-siso-orange hover:bg-siso-orange/90 text-black font-medium px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => window.open('mailto:siso@sisoinnovatorshub.io', '_blank')}
                >
                  Start Your Project
                </Button>
                <Button 
                  variant="outline" 
                  className="border-siso-orange/50 text-siso-orange hover:bg-siso-orange/10 hover:border-siso-orange px-8 py-3 text-lg transition-all duration-300"
                  onClick={() => window.open('/auth', '_blank')}
                >
                  View Platform
                </Button>
              </div>
            </GridBackground>
          </motion.div>
        </div>

        {/* Project Details Modal */}
        <ProjectDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          project={selectedProject}
        />
      </div>
    </>
  );
} 