
import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface CaseStudyProps {
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  notionUrl?: string;
  industry?: string; // Added industry field
}

export const CaseStudy = ({ title, description, imageUrl, notionUrl, industry }: CaseStudyProps) => {
  return (
    <motion.div 
      className="overflow-hidden rounded-lg bg-black/20 border border-siso-text/10 hover:border-siso-orange/30 transition-all duration-300 flex flex-col h-full"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div 
        className="h-36 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      >
        <div className="h-full w-full bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        {industry && (
          <div className="mb-2">
            <span className="text-xs bg-siso-orange/20 text-siso-orange px-2 py-1 rounded-sm">
              {industry}
            </span>
          </div>
        )}
        <p className="text-sm text-siso-text mb-4 flex-grow">{description}</p>
        
        {notionUrl && (
          <Button 
            variant="outline" 
            className="mt-auto w-full border-siso-text/20 hover:bg-black/20 hover:border-siso-orange/30"
            onClick={() => window.open(notionUrl, '_blank')}
          >
            Read Case Study
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );
};
