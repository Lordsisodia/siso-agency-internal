
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TabImage } from "./TabImage";
import { TabStats } from "./TabStats";
import { Tab } from "./types";
import { getCardStats } from "./utils";

interface TabContentProps {
  tab: Tab;
}

export const TabContent = ({ tab }: TabContentProps) => {
  const stats = getCardStats(tab.value);

  return (
    <motion.div
      className="mt-8 px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className="rounded-xl border border-siso-orange/20 bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-sm p-8 shadow-2xl transition-all duration-500 hover:border-siso-orange/40"
        whileHover={{ scale: 1.02 }}
        layout
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div 
            className="flex flex-col gap-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="space-y-4">
              <Badge 
                variant="outline" 
                className="w-fit bg-gradient-to-r from-siso-red/10 to-siso-orange/10 border-siso-orange/20"
              >
                {tab.content.badge}
              </Badge>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-siso-orange to-siso-red text-transparent bg-clip-text">
                {tab.content.title}
              </h3>
            </div>

            {stats && <TabStats stats={stats} />}

            <p className="text-siso-text/80 leading-relaxed">
              {tab.content.description}
            </p>

            <div className="flex items-center gap-4">
              <Button 
                className="bg-gradient-to-r from-siso-red to-siso-orange hover:from-siso-red/90 hover:to-siso-orange/90 
                  text-white shadow-lg shadow-siso-red/20 transition-all duration-300 hover:shadow-xl hover:shadow-siso-orange/30"
              >
                {tab.content.buttonText}
              </Button>
              <Button 
                variant="outline"
                className="border-siso-orange/20 hover:bg-siso-orange/10"
              >
                Learn More
              </Button>
            </div>
          </motion.div>

          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <TabImage 
              src={tab.content.imageSrc}
              alt={tab.content.imageAlt}
            />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};
