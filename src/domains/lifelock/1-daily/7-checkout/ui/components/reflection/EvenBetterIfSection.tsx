import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, TrendingUp, ChevronDown, ChevronUp, CheckCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { XPPill } from '@/domains/lifelock/1-daily/1-morning-routine/ui/components/xp/XPPill';

interface EvenBetterIfSectionProps {
  items: string[];
  xp: number;
  onChange: (items: string[]) => void;
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

(BulletItem as React.ForwardRefExoticComponent<BulletItemProps & React.RefAttributes<HTMLDivElement>>).displayName = 'BulletItem';

export const EvenBetterIfSection: React.FC<EvenBetterIfSectionProps> = ({
  items,
  xp,
  onChange
}) => {
  const [evenBetterIfItems, setEvenBetterIfItems] = useState<string[]>(
    items.length > 0 ? items : ['', '', '']
  );
  const [isExpanded, setIsExpanded] = useState(false);

  // Sync props to local state
  useEffect(() => {
    if (items.length > 0) {
      setEvenBetterIfItems(items);
    }
  }, [items]);

  const addEvenBetterIfItem = () => {
    const newItems = [...evenBetterIfItems, ''];
    setEvenBetterIfItems(newItems);
    onChange(newItems);
  };

  const removeEvenBetterIfItem = (index: number) => {
    if (evenBetterIfItems.length > 1) {
      const newItems = evenBetterIfItems.filter((_, i) => i !== index);
      setEvenBetterIfItems(newItems);
      onChange(newItems);
    }
  };

  const updateEvenBetterIfItem = (index: number, value: string) => {
    const newItems = [...evenBetterIfItems];
    newItems[index] = value;
    setEvenBetterIfItems(newItems);
    onChange(newItems);
  };

  const completedEvenBetterIf = evenBetterIfItems.filter(item => item.trim() !== '').length;
  const hasContent = completedEvenBetterIf > 0;

  return (
    <div className="w-full">
      <Card className="bg-purple-900/20 border-purple-700/40 overflow-hidden">
        {/* Clickable Header */}
        <div
          className="p-4 sm:p-6 cursor-pointer hover:bg-purple-900/10 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="p-1.5 rounded-lg border border-purple-400/30 flex-shrink-0">
                <TrendingUp className="h-4 w-4 text-purple-300" />
              </div>
              <h4 className="text-purple-100 font-semibold text-base truncate">Even Better If...</h4>
              {/* Green CheckCircle when at least 3 items filled */}
              {completedEvenBetterIf >= 3 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                >
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                </motion.div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <XPPill
                xp={xp}
                earned={hasContent}
                showGlow={hasContent}
              />
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-purple-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="h-5 w-5 text-purple-400 flex-shrink-0" />
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-2 mb-1">
            <div className="w-full bg-purple-900/30 border border-purple-600/20 rounded-full h-1.5">
              <motion.div
                className="bg-gradient-to-r from-purple-400 to-purple-600 h-1.5 rounded-full transition-all duration-500"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((completedEvenBetterIf / Math.max(evenBetterIfItems.length, 1)) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-purple-400/70 font-medium">{completedEvenBetterIf}/{evenBetterIfItems.length} captured</span>
              {hasContent && !isExpanded && (
                <span className="text-xs text-green-400 font-semibold flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Complete</span>
              )}
            </div>
          </div>
        </div>

        {/* Collapsible Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 sm:px-6 pb-4 sm:pb-6">
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
                        placeholder="Something to improve..."
                        icon={<ArrowRight className="h-3 w-3 text-purple-400" />}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {/* Add Button at Bottom */}
                <Button
                  onClick={addEvenBetterIfItem}
                  variant="ghost"
                  className="w-full mt-3 text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 border border-dashed border-purple-700/30"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add improvement
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
};

EvenBetterIfSection.displayName = 'EvenBetterIfSection';
