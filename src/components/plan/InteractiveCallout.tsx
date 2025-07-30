
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, Box, Clock, ExternalLink } from 'lucide-react';

interface InteractiveCalloutProps {
  title: string;
  value: string;
  type: 'niche' | 'company' | 'product' | 'timeline';
  description: string;
}

export const InteractiveCallout: React.FC<InteractiveCalloutProps> = ({
  title,
  value,
  type,
  description
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const getIcon = () => {
    switch(type) {
      case 'niche':
        return <Users className="h-5 w-5 text-siso-orange" />;
      case 'company':
        return <Briefcase className="h-5 w-5 text-siso-orange" />;
      case 'product':
        return <Box className="h-5 w-5 text-siso-orange" />;
      case 'timeline':
        return <Clock className="h-5 w-5 text-siso-orange" />;
      default:
        return <Users className="h-5 w-5 text-siso-orange" />;
    }
  };
  
  return (
    <motion.div
      className="bg-black/30 rounded-lg p-4 border border-siso-text/10 transition-all"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center gap-2 mb-2">
        {getIcon()}
        <h4 className="text-white font-medium">{title}</h4>
      </div>
      
      <p className="text-xl font-bold text-siso-orange mb-2">{value}</p>
      
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ 
          opacity: isHovered ? 1 : 0,
          height: isHovered ? 'auto' : 0
        }}
        transition={{ duration: 0.2 }}
        className="text-sm text-siso-text overflow-hidden"
      >
        {description}
      </motion.div>
      
      {!isHovered && (
        <div className="text-xs text-siso-text/70 flex items-center gap-1">
          <ExternalLink className="h-3 w-3" />
          <span>Hover for details</span>
        </div>
      )}
    </motion.div>
  );
};
