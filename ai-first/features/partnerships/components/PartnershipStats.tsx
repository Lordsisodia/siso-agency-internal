import { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, DollarSign, TrendingUp, Award, Loader2, Target, Clock, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const PartnershipStats = memo(() => {
  // Partnership Program Stats - Main stats to display
  const partnershipProgramStats = [
    {
      icon: DollarSign,
      value: "20%",
      label: "Commission Rate",
      subtext: "Of project value (£249-£2,490)",
      verified: true,
      color: "text-orange-500"
    },
    {
      icon: Target,
      value: "£249-£2,490",
      label: "Project Range",
      subtext: "Suitable for most businesses",
      verified: true,
      color: "text-green-500"
    },
    {
      icon: Clock,
      value: "48-72hrs",
      label: "MVP Delivery",
      subtext: "Fast turnaround time",
      verified: true,
      color: "text-blue-500"
    },
    {
      icon: Shield,
      value: "100%",
      label: "Risk-Free",
      subtext: "MVP first, payment later",
      verified: true,
      color: "text-purple-500"
    },
    {
      icon: Users,
      value: "300+",
      label: "Active Partners",
      subtext: "Growing community",
      verified: false,
      color: "text-pink-500"
    },
    {
      icon: Award,
      value: "£1,200",
      label: "Avg Monthly",
      subtext: "Top partner earnings",
      verified: false,
      color: "text-indigo-500"
    }
  ];

  return (
    <motion.section
      id="stats"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="py-12 lg:py-16 bg-gradient-to-br from-gray-900 via-gray-800 to-black"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 lg:mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3"
          >
            Partnership Program Stats
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto px-4"
          >
            Verified program metrics and earning opportunities
          </motion.p>
        </div>

        {/* PARTNERSHIP PROGRAM STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {partnershipProgramStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="group"
              >
                <Card className="relative bg-gradient-to-br from-gray-800/80 via-gray-800/60 to-gray-900/80 
                  border border-gray-700/50 hover:border-orange-500/50 backdrop-blur-md
                  transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10">
                  
                  {/* Verified Badge */}
                  {stat.verified && (
                    <div className="absolute top-3 right-3 z-10">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    </div>
                  )}
                  
                  <CardContent className="p-4 sm:p-6 text-center">
                    <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gradient-to-br from-gray-700/50 to-gray-800/50 
                        flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className={`w-6 h-6 sm:w-7 sm:h-7 ${stat.color}`} />
                      </div>
                      
                      <div>
                        <div className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${stat.color} mb-1`}>
                          {stat.value}
                        </div>
                        <div className="text-white font-semibold text-sm sm:text-base mb-1">
                          {stat.label}
                        </div>
                        <div className="text-gray-400 text-xs sm:text-sm">
                          {stat.subtext}
                        </div>
                        
                        {/* Verification Status */}
                        <div className="mt-2">
                          {stat.verified ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                              ✓ Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30">
                              ⚡ Estimated
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Contact Info Verification */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8 lg:mt-12 text-center"
        >
          <Card className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-orange-500/20 max-w-md mx-auto">
            <CardContent className="p-4 sm:p-6">
              <div className="text-orange-500 font-semibold text-sm mb-2">✓ Verified Contact</div>
              <div className="text-white font-medium">partners@siso.agency</div>
              <div className="text-gray-400 text-sm mt-1">Official partnership inquiries</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.section>
  );
});

PartnershipStats.displayName = 'PartnershipStats';

export default PartnershipStats; 