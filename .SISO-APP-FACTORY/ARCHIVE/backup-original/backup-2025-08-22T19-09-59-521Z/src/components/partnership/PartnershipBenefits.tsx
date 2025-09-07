import { memo } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Shield, Zap, Users, TrendingUp } from 'lucide-react';
import RadialOrbitalTimeline from '@/components/ui/radial-orbital-timeline';

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

const partnershipBenefits: TimelineItem[] = [
  {
    id: 1,
    title: "High Commissions",
    date: "20% Rate",
    content: "Earn 20% commission on every successful project. Our commission structure is designed to reward successful partnerships with up to £498 per deal based on project value.",
    category: "Earnings",
    icon: DollarSign,
    relatedIds: [2, 5],
    status: "completed" as const,
    energy: 95,
  },
  {
    id: 2,
    title: "Zero Client Risk",
    date: "Risk-Free",
    content: "We build MVP first, payment only after client approval. This unique approach eliminates risk for clients and makes it easier for you to close deals.",
    category: "Security",
    icon: Shield,
    relatedIds: [1, 3],
    status: "completed" as const,
    energy: 100,
  },
  {
    id: 3,
    title: "Fast Turnaround",
    date: "48-72hrs",
    content: "MVPs delivered in 48-72 hours. Our rapid development process helps you maintain momentum with prospects and close deals faster.",
    category: "Speed",
    icon: Zap,
    relatedIds: [2, 4],
    status: "in-progress" as const,
    energy: 90,
  },
  {
    id: 4,
    title: "Full Support",
    date: "Complete",
    content: "We handle all technical aspects and client communication. Focus on what you do best - building relationships and finding opportunities.",
    category: "Support",
    icon: Users,
    relatedIds: [3, 5],
    status: "completed" as const,
    energy: 85,
  },
  {
    id: 5,
    title: "Proven Results",
    date: "247+ Partners",
    content: "Join 247+ successful partners who have already earned over £250k in commissions. Our track record speaks for itself with consistent results and satisfied clients.",
    category: "Trust",
    icon: TrendingUp,
    relatedIds: [1, 4],
    status: "completed" as const,
    energy: 88,
  },
];

export const PartnershipBenefits = memo(() => {
  return (
    <div id="benefits" className="relative w-full overflow-hidden">
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
          Explore our partnership benefits in this interactive timeline
        </motion.p>
      </div>

      {/* Radial Orbital Timeline */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.4 }}
        viewport={{ once: true }}
        className="relative"
      >
        <RadialOrbitalTimeline timelineData={partnershipBenefits} />
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
          Click on any benefit to explore details • Auto-rotating timeline
        </motion.p>
      </div>
    </div>
  );
}); 