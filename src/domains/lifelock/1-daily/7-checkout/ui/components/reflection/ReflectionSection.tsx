import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, CheckCircle2, TrendingUp, Lightbulb, Check, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ReflectionSectionProps {
  wentWell: string[];
  evenBetterIf: string[];
  onChange: (updates: {
    wentWell?: string[];
    evenBetterIf?: string[];
  }) => void;
}

interface BulletItemProps {
  item: string;
  index: number;
  onChange: (value: string) => void;
  onRemove: () => void;
  canRemove: boolean;
  placeholder: string;
  icon: React.ReactNode;
}

const BulletItem = React.forwardRef<HTMLDivElement, BulletItemProps>(({
  item,
  index,
  onChange,
  onRemove,
  canRemove,
  placeholder,
  icon
}, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Trigger parent to add new item by calling a blur or custom event
      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      inputRef.current?.dispatchEvent(event);
    }
    if (e.key === 'Backspace' && item === '' && canRemove) {
      onRemove();
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="flex items-start space-x-2 group"
    >
      <div className="flex items-center gap-2 mt-2.5 flex-shrink-0">
        <span className="text-purple-400">{icon}</span>
      </div>
      <Input
        ref={inputRef}
        value={item}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          "bg-transparent border-0 border-b border-purple-700/30",
          "text-white placeholder:text-purple-300/40",
          "focus:border-purple-400 focus:ring-0 rounded-none px-2 py-1.5 flex-1",
          "transition-all duration-200",
          isFocused && "border-purple-400"
        )}
        placeholder={placeholder}
      />
      {canRemove && (
        <Button
          onClick={onRemove}
          size="sm"
          variant="ghost"
          className={cn(
            "text-purple-400/60 hover:text-purple-300 hover:bg-purple-900/20",
            "p-1.5 h-auto opacity-0 group-hover:opacity-100 transition-opacity"
          )}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </motion.div>
  );
});

BulletItem.displayName = 'BulletItem';

export const ReflectionSection: React.FC<ReflectionSectionProps> = ({
  wentWell,
  evenBetterIf,
  onChange
}) => {
  const [wentWellItems, setWentWellItems] = useState<string[]>(
    wentWell.length > 0 ? wentWell : ['', '', '']
  );
  const [evenBetterIfItems, setEvenBetterIfItems] = useState<string[]>(
    evenBetterIf.length > 0 ? evenBetterIf : ['', '', '']
  );

  // Sync props to local state
  useEffect(() => {
    if (wentWell.length > 0) {
      setWentWellItems(wentWell);
    }
  }, [wentWell]);

  useEffect(() => {
    if (evenBetterIf.length > 0) {
      setEvenBetterIfItems(evenBetterIf);
    }
  }, [evenBetterIf]);

  const addWentWellItem = () => {
    const newItems = [...wentWellItems, ''];
    setWentWellItems(newItems);
    onChange({ wentWell: newItems });
  };

  const removeWentWellItem = (index: number) => {
    if (wentWellItems.length > 1) {
      const newItems = wentWellItems.filter((_, i) => i !== index);
      setWentWellItems(newItems);
      onChange({ wentWell: newItems });
    }
  };

  const updateWentWellItem = (index: number, value: string) => {
    const newItems = [...wentWellItems];
    newItems[index] = value;
    setWentWellItems(newItems);
    onChange({ wentWell: newItems });
  };

  const addEvenBetterIfItem = () => {
    const newItems = [...evenBetterIfItems, ''];
    setEvenBetterIfItems(newItems);
    onChange({ evenBetterIf: newItems });
  };

  const removeEvenBetterIfItem = (index: number) => {
    if (evenBetterIfItems.length > 1) {
      const newItems = evenBetterIfItems.filter((_, i) => i !== index);
      setEvenBetterIfItems(newItems);
      onChange({ evenBetterIf: newItems });
    }
  };

  const updateEvenBetterIfItem = (index: number, value: string) => {
    const newItems = [...evenBetterIfItems];
    newItems[index] = value;
    setEvenBetterIfItems(newItems);
    onChange({ evenBetterIf: newItems });
  };

  // Count non-empty items
  const completedWentWell = wentWellItems.filter(item => item.trim() !== '').length;
  const completedEvenBetterIf = evenBetterIfItems.filter(item => item.trim() !== '').length;

  return (
    <div className="w-full space-y-6">
      <Card className="mx-6 sm:mx-8 md:mx-12 bg-purple-900/10 border-purple-700/30 overflow-hidden">
          <CardContent className="p-4 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-purple-300">Quick Reflection</h3>
          </div>

          {/* What Went Well Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={cn(
                  "h-4 w-4 transition-colors",
                  completedWentWell > 0 ? "text-purple-400" : "text-purple-400"
                )} />
                <h4 className="font-semibold text-purple-300">
                  What went well today?
                </h4>
              </div>
              <Button
                onClick={addWentWellItem}
                size="sm"
                variant="ghost"
                className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 h-8"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>

            <div className="space-y-2 pl-4 border-l-2 border-purple-700/30">
              <AnimatePresence mode="popLayout">
                {wentWellItems.map((item, index) => (
                  <BulletItem
                    key={`went-well-${index}`}
                    item={item}
                    index={index}
                    onChange={(value) => updateWentWellItem(index, value)}
                    onRemove={() => removeWentWellItem(index)}
                    canRemove={wentWellItems.length > 1}
                    placeholder="Something positive that happened..."
                    icon={<Check className="h-3 w-3 text-purple-400" />}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-purple-700/20" />

          {/* Even Better If Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className={cn(
                  "h-4 w-4 transition-colors",
                  completedEvenBetterIf > 0 ? "text-purple-400" : "text-purple-400"
                )} />
                <h4 className="font-semibold text-purple-300">
                  Even better if...
                </h4>
              </div>
              <Button
                onClick={addEvenBetterIfItem}
                size="sm"
                variant="ghost"
                className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 h-8"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>

            <div className="space-y-2 pl-4 border-l-2 border-purple-700/30">
              <AnimatePresence mode="popLayout">
                {evenBetterIfItems.map((item, index) => (
                  <BulletItem
                    key={`even-better-${index}`}
                    item={item}
                    index={index}
                    onChange={(value) => updateEvenBetterIfItem(index, value)}
                    onRemove={() => removeEvenBetterIfItem(index)}
                    canRemove={evenBetterIfItems.length > 1}
                    placeholder="Something that could improve..."
                    icon={<ArrowRight className="h-3 w-3 text-purple-400" />}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Completion Progress */}
          {(completedWentWell > 0 || completedEvenBetterIf > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-purple-900/20 border border-purple-700/30 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-purple-300">Reflection Progress</span>
                <span className="text-sm font-semibold text-purple-200">
                  {completedWentWell + completedEvenBetterIf} items
                </span>
              </div>
              <div className="mt-2 w-full bg-purple-900/30 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((completedWentWell + completedEvenBetterIf) / (wentWellItems.length + evenBetterIfItems.length)) * 100}%`
                  }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          )}
          </CardContent>
        </Card>
    </div>
  );
};

ReflectionSection.displayName = 'ReflectionSection';
