import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface WentWellSectionProps {
  items: string[];
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
        <span className="text-green-400">{icon}</span>
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

export const WentWellSection: React.FC<WentWellSectionProps> = ({
  items,
  onChange
}) => {
  const [wentWellItems, setWentWellItems] = useState<string[]>(
    items.length > 0 ? items : ['', '', '']
  );
  const [isExpanded, setIsExpanded] = useState(false);

  // Sync props to local state
  useEffect(() => {
    if (items.length > 0) {
      setWentWellItems(items);
    }
  }, [items]);

  const addWentWellItem = () => {
    const newItems = [...wentWellItems, ''];
    setWentWellItems(newItems);
    onChange(newItems);
  };

  const removeWentWellItem = (index: number) => {
    if (wentWellItems.length > 1) {
      const newItems = wentWellItems.filter((_, i) => i !== index);
      setWentWellItems(newItems);
      onChange(newItems);
    }
  };

  const updateWentWellItem = (index: number, value: string) => {
    const newItems = [...wentWellItems];
    newItems[index] = value;
    setWentWellItems(newItems);
    onChange(newItems);
  };

  const completedWentWell = wentWellItems.filter(item => item.trim() !== '').length;

  return (
    <div>
      <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-700/30">
        <CardContent className="p-0">
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between p-4 hover:bg-purple-900/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">✨</span>
              <div className="text-left">
                <h3 className="text-white font-semibold">What went well today?</h3>
                <p className="text-purple-300/60 text-sm">
                  {completedWentWell} {completedWentWell === 1 ? 'win' : 'wins'} captured
                </p>
              </div>
            </div>
            {isExpanded ? (
              <ChevronUp className="text-purple-400" />
            ) : (
              <ChevronDown className="text-purple-400" />
            )}
          </motion.button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <CardContent className="space-y-3 pt-4">
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
                          placeholder="Something positive..."
                          icon={<span className="text-purple-400">✓</span>}
                        />
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Add Button at Bottom */}
                  <Button
                    onClick={addWentWellItem}
                    variant="ghost"
                    className="w-full text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 border border-dashed border-purple-700/30"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add another win
                  </Button>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};

WentWellSection.displayName = 'WentWellSection';
