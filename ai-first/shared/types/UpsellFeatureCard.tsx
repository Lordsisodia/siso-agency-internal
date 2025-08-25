
import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Check, TrendingUp } from 'lucide-react';

interface UpsellFeatureCardProps {
  id: string;
  name: string;
  description: string;
  category: string;
  onAdd: (id: string) => void;
  isAdded?: boolean;
}

export function UpsellFeatureCard({
  id,
  name,
  description,
  category,
  onAdd,
  isAdded = false
}: UpsellFeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/30 border border-siso-text/10 rounded-lg p-4 hover:border-siso-orange/30 transition-all"
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-white">{name}</h4>
            <Badge variant="outline" className="text-xs">
              {category}
            </Badge>
          </div>
          <p className="text-sm text-siso-text mb-3">
            {description}
          </p>
          
          <div className="flex items-center text-xs text-siso-orange gap-1 mb-3">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Premium Add-on</span>
          </div>
        </div>
        
        <Button
          size="sm"
          onClick={() => onAdd(id)}
          variant={isAdded ? "secondary" : "outline"}
          className={isAdded 
            ? "bg-siso-orange/20 text-siso-orange border-siso-orange/30" 
            : "border-siso-text/20"}
          disabled={isAdded}
        >
          {isAdded ? (
            <>
              <Check className="h-4 w-4 mr-1" /> Added
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-1" /> Add
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
