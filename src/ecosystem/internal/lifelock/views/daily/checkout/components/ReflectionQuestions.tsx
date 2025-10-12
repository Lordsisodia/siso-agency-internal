/**
 * Reflection Questions Component
 * Dynamic arrays for "What went well" and "Even better if"
 */

import React from 'react';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Plus, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface ReflectionQuestionsProps {
  wentWell: string[];
  evenBetterIf: string[];
  onUpdateWentWell: (items: string[]) => void;
  onUpdateEvenBetterIf: (items: string[]) => void;
}

export const ReflectionQuestions: React.FC<ReflectionQuestionsProps> = ({
  wentWell,
  evenBetterIf,
  onUpdateWentWell,
  onUpdateEvenBetterIf
}) => {
  const addWentWellItem = () => {
    onUpdateWentWell([...wentWell, '']);
  };

  const removeWentWellItem = (index: number) => {
    if (wentWell.length > 1) {
      onUpdateWentWell(wentWell.filter((_, i) => i !== index));
    }
  };

  const updateWentWellItem = (index: number, value: string) => {
    const updated = [...wentWell];
    updated[index] = value;
    onUpdateWentWell(updated);
  };

  const addEvenBetterIfItem = () => {
    onUpdateEvenBetterIf([...evenBetterIf, '']);
  };

  const removeEvenBetterIfItem = (index: number) => {
    if (evenBetterIf.length > 1) {
      onUpdateEvenBetterIf(evenBetterIf.filter((_, i) => i !== index));
    }
  };

  const updateEvenBetterIfItem = (index: number, value: string) => {
    const updated = [...evenBetterIf];
    updated[index] = value;
    onUpdateEvenBetterIf(updated);
  };

  return (
    <div className="space-y-6">
      {/* What went well */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-purple-300 font-medium">What went well today? ✨</h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={addWentWellItem}
            className="text-purple-400 hover:bg-purple-900/30"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
        <div className="space-y-2">
          {wentWell.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <Input
                value={item}
                onChange={(e) => updateWentWellItem(index, e.target.value)}
                className="bg-purple-900/20 border-purple-700/50 text-purple-100 placeholder:text-purple-300/50"
                placeholder="Something that went well..."
              />
              {wentWell.length > 1 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeWentWellItem(index)}
                  className="text-purple-400 hover:bg-purple-900/30"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Even better if */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-purple-300 font-medium">Even better if... 🎯</h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={addEvenBetterIfItem}
            className="text-purple-400 hover:bg-purple-900/30"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
        <div className="space-y-2">
          {evenBetterIf.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <Input
                value={item}
                onChange={(e) => updateEvenBetterIfItem(index, e.target.value)}
                className="bg-purple-900/20 border-purple-700/50 text-purple-100 placeholder:text-purple-300/50"
                placeholder="Something to improve..."
              />
              {evenBetterIf.length > 1 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeEvenBetterIfItem(index)}
                  className="text-purple-400 hover:bg-purple-900/30"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
