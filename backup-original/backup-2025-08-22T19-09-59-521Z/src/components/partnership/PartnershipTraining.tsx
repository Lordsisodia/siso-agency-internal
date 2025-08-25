import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Target, Zap, Headphones, BarChart3, Award, BookOpen, Link, ArrowRight } from 'lucide-react';
import RadialOrbitalTimeline from '@/components/ui/radial-orbital-timeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface TimelineItem {
  id: number;
  title: string;
  date: string;
  content: string;
  category: string;
  icon: React.ElementType;
  relatedIds: number[];
  status: "completed" | "in-progress" | "pending";
  energy: number;
}

const partnerHubFeatures: TimelineItem[] = [
  {
    id: 1,
    title: "Training Course",
    date: "Complete",
    content: "Comprehensive partner training program covering sales techniques, SISO methodology, and client management best practices.",
    category: "Education",
    icon: BookOpen,
    relatedIds: [2, 6],
    status: "completed" as const,
    energy: 95,
  },
  {
    id: 2,
    title: "Custom Database",
    date: "Active",
    content: "Dedicated partner database system to track all client information, project history, and communication logs.",
    category: "Tools",
    icon: BarChart3,
    relatedIds: [1, 3, 7],
    status: "completed" as const,
    energy: 100,
  },
  {
    id: 3,
    title: "Sales Team Support",
    date: "24/7",
    content: "Direct access to our experienced sales team for backup support, complex negotiations, and deal closure assistance.",
    category: "Support",
    icon: Users,
    relatedIds: [2, 5],
    status: "completed" as const,
    energy: 90,
  },
  {
    id: 5,
    title: "Performance Bonuses",
    date: "Monthly",
    content: "Additional performance-based bonuses for exceeding targets, maintaining high client satisfaction, and consistent deal closure.",
    category: "Rewards",
    icon: Target,
    relatedIds: [3, 6],
    status: "completed" as const,
    energy: 85,
  },
  {
    id: 6,
    title: "Marketing Materials",
    date: "Updated",
    content: "Professional marketing materials, case studies, proposals templates, and branded resources to support your sales efforts.",
    category: "Resources",
    icon: Award,
    relatedIds: [1, 5, 7],
    status: "completed" as const,
    energy: 88,
  },
  {
    id: 7,
    title: "Project Management",
    date: "End-to-End",
    content: "Complete project management system handling client onboarding, development tracking, and delivery coordination.",
    category: "Operations",
    icon: Zap,
    relatedIds: [2, 6],
    status: "completed" as const,
    energy: 92,
  }
];

export const PartnershipTraining = () => {
  // State to track the currently selected item for the left side card
  const [selectedItem, setSelectedItem] = useState<TimelineItem>(
    partnerHubFeatures.find(item => item.id === 6) || partnerHubFeatures[0]
  );

  // Handler for when an orb is clicked
  const handleItemSelect = (item: TimelineItem) => {
    console.log(`🎯 PartnershipTraining received item:`, item.title);
    setSelectedItem(item);
  };
  return (
    <div id="training" className="relative w-full overflow-hidden">
      {/* Section Header */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-50 text-center pointer-events-none">
        <motion.h2 
          className="text-2xl md:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          Why Partner with{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-red-500">
            SISO
          </span>?
        </motion.h2>
        <motion.p 
          className="text-lg text-gray-300 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Explore our partnership features in this interactive timeline
        </motion.p>
      </div>

      {/* Radial Orbital Timeline with Side Cards */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.4 }}
        viewport={{ once: true }}
        className="relative"
      >
        <div className="w-full h-screen flex">
          {/* Side Card Section - Left 33% */}
          <div className="w-1/3 h-full p-8 flex flex-col justify-center bg-black/20 backdrop-blur-sm border-r border-gray-700/30">
            <motion.div
              key={selectedItem.id}
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {/* Show the selected card */}
              {(() => {
                if (!selectedItem) return null;
                
                const getStatusStyles = (status: "completed" | "in-progress" | "pending"): string => {
                  switch (status) {
                    case "completed":
                      return "text-white bg-gray-900 border-white";
                    case "in-progress":
                      return "text-black bg-white border-black";
                    case "pending":
                      return "text-white bg-gray-900/40 border-white/50";
                    default:
                      return "text-white bg-gray-900/40 border-white/50";
                  }
                };

                return (
                  <Card 
                    key={selectedItem.id}
                    className="w-full bg-gray-900/95 backdrop-blur-lg border-gray-600/40 shadow-xl shadow-gray-900/20"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <Badge
                          className={`px-2 text-xs ${getStatusStyles(selectedItem.status)}`}
                        >
                          {selectedItem.status === "completed"
                            ? "COMPLETE"
                            : selectedItem.status === "in-progress"
                            ? "IN PROGRESS"
                            : "PENDING"}
                        </Badge>
                        <span className="text-xs font-mono text-gray-400">
                          {selectedItem.date}
                        </span>
                      </div>
                      <CardTitle className="text-lg mt-2 text-white">
                        {selectedItem.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-gray-300">
                      <p className="leading-relaxed">{selectedItem.content}</p>

                      <div className="mt-6 pt-4 border-t border-gray-600/30">
                        <div className="flex justify-between items-center text-sm mb-2">
                          <span className="flex items-center text-gray-400">
                            <Zap size={12} className="mr-2" />
                            Energy Level
                          </span>
                          <span className="font-mono text-white">{selectedItem.energy}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-700/50 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                            style={{ width: `${selectedItem.energy}%` }}
                          ></div>
                        </div>
                      </div>

                      {selectedItem.relatedIds.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-gray-600/30">
                          <div className="flex items-center mb-3">
                            <Link size={12} className="text-gray-400 mr-2" />
                            <h4 className="text-sm uppercase tracking-wider font-medium text-gray-400">
                              Connected Features
                            </h4>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {selectedItem.relatedIds.map((relatedId) => {
                              const relatedItem = partnerHubFeatures.find(
                                (i) => i.id === relatedId
                              );
                              return (
                                <Button
                                  key={relatedId}
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center h-8 px-3 py-0 text-xs border-gray-600/40 bg-transparent hover:bg-gray-700/50 text-gray-300 hover:text-white transition-all"
                                >
                                  {relatedItem?.title}
                                  <ArrowRight
                                    size={10}
                                    className="ml-2 text-gray-400"
                                  />
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })()}
            </motion.div>
          </div>

          {/* Orbital Timeline Section - Right 67% */}
          <div className="w-2/3 h-full">
            <RadialOrbitalTimeline 
              timelineData={partnerHubFeatures} 
              showPopupCards={false}
              onItemSelect={handleItemSelect}
            />
          </div>
        </div>
      </motion.div>

      {/* Bottom instruction */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50 text-center pointer-events-none">
        <motion.p 
          className="text-sm text-gray-400 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-600/30"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          Click on any feature to explore details • Auto-rotating timeline
        </motion.p>
      </div>
    </div>
  );
}; 