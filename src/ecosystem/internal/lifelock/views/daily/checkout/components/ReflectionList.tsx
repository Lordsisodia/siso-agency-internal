import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

interface ReflectionListProps {
  title: string;
  items: string[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, value: string) => void;
  placeholder: string;
  animationDelay?: number;
}

const ReflectionListComponent: React.FC<ReflectionListProps> = ({
  title,
  items,
  onAdd,
  onRemove,
  onChange,
  placeholder,
  animationDelay = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-purple-300 text-base">{title}</h4>
        <Button
          onClick={onAdd}
          size="sm"
          variant="ghost"
          className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 h-8"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      <div className="space-y-2 pl-4 border-l-2 border-purple-700/30">
        {items.map((item, index) => (
          <div key={index} className="flex items-start space-x-2">
            <span className="text-purple-400 mt-2.5">•</span>
            <Input
              value={item}
              onChange={(e) => onChange(index, e.target.value)}
              className="bg-transparent border-0 border-b border-purple-700/30 text-white placeholder:text-purple-300/40 focus:border-purple-400 focus:ring-0 rounded-none px-2 py-1.5 flex-1"
              placeholder={placeholder}
            />
            {items.length > 1 && (
              <Button
                onClick={() => onRemove(index)}
                size="sm"
                variant="ghost"
                className="text-purple-400/60 hover:text-purple-300 hover:bg-purple-900/20 p-1.5 h-auto"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export const ReflectionList = memo(ReflectionListComponent);
export type { ReflectionListProps };
