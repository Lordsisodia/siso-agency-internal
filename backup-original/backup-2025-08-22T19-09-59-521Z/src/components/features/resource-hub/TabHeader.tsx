
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";

interface TabHeaderProps {
  badge: string;
  heading: string;
  description: string;
}

export const TabHeader = ({ badge, heading, description }: TabHeaderProps) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Badge className="bg-gradient-to-r from-siso-red/20 to-siso-orange/20 text-siso-text px-4 py-2 rounded-full border border-siso-orange/20">
          {badge}
        </Badge>
      </motion.div>
      
      <motion.h2 
        className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-gradient-to-r from-siso-orange to-siso-red text-transparent bg-clip-text"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {heading}
      </motion.h2>

      <motion.div 
        className="flex items-center gap-2 text-siso-text/80 text-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Globe className="w-5 h-5 text-siso-orange" />
        <p>Powered by thousands of innovators worldwide</p>
      </motion.div>

      <motion.p 
        className="mx-auto max-w-[700px] text-siso-text/80 md:text-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {description}
      </motion.p>
    </div>
  );
};
