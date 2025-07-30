
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { CardStats } from "./types";

interface TabStatsProps {
  stats: CardStats;
}

export const TabStats = ({ stats }: TabStatsProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-gradient-to-br from-siso-red/5 to-siso-orange/5 border border-siso-orange/10">
        <div className="space-y-1">
          <p className="text-2xl font-bold text-siso-orange">
            {stats.mainStat}
          </p>
          <p className="text-sm text-siso-text/70">
            {stats.mainLabel}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-siso-orange">
            {stats.secondaryStat}
          </p>
          <p className="text-sm text-siso-text/70">
            {stats.secondaryLabel}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {stats.benefits.map((benefit, index) => (
          <motion.div 
            key={benefit}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-2"
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-siso-red/20 to-siso-orange/20 flex items-center justify-center">
              <Check className="w-3 h-3 text-siso-orange" />
            </div>
            <span className="text-siso-text/80">{benefit}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
