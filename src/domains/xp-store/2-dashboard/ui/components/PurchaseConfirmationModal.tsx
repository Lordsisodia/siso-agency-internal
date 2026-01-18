import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PurchaseConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  rewardName: string;
  rewardCost: number;
  rewardEmoji: string;
  isHighValue?: boolean;
}

export const PurchaseConfirmationModal: React.FC<PurchaseConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  rewardName,
  rewardCost,
  rewardEmoji,
  isHighValue = false,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="pointer-events-auto w-full max-w-lg bg-siso-bg border-t border-x border-siso-border rounded-t-3xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-siso-border">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
                    isHighValue
                      ? "bg-gradient-to-br from-yellow-500/20 to-amber-500/10"
                      : "bg-siso-orange/10"
                  )}>
                    {rewardEmoji}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-siso-text-bold">Confirm Purchase</h3>
                    <p className="text-sm text-siso-text-muted">{rewardName}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl hover:bg-siso-bg-alt flex items-center justify-center text-siso-text-muted hover:text-siso-text transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Cost Display */}
                <div className={cn(
                  "p-4 rounded-xl border-2 text-center",
                  isHighValue
                    ? "bg-yellow-500/10 border-yellow-500/30"
                    : "bg-siso-orange/10 border-siso-orange/30"
                )}>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Sparkles className={cn(
                      "h-5 w-5",
                      isHighValue ? "text-yellow-500" : "text-siso-orange"
                    )} />
                    <span className="text-sm font-medium text-siso-text-muted uppercase tracking-wide">
                      Total Cost
                    </span>
                  </div>
                  <div className={cn(
                    "text-4xl font-black",
                    isHighValue
                      ? "text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-400"
                      : "text-siso-orange"
                  )}>
                    {rewardCost.toLocaleString()}
                  </div>
                  <div className="text-xs text-siso-text-muted uppercase tracking-wide mt-1">
                    XP
                  </div>
                </div>

                {/* Warning for high-value items */}
                {isHighValue && (
                  <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-400 mb-1">
                        Premium Reward
                      </p>
                      <p className="text-xs text-siso-text-muted">
                        This is a high-value reward. Make sure you really want to spend your XP on this.
                      </p>
                    </div>
                  </div>
                )}

                {/* Confirmation Message */}
                <p className="text-sm text-siso-text-muted text-center">
                  This action cannot be undone. Your XP will be deducted immediately.
                </p>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-siso-border space-y-2">
                <button
                  onClick={onConfirm}
                  className={cn(
                    "w-full py-4 rounded-xl font-bold text-white transition-all active:scale-98",
                    isHighValue
                      ? "bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black"
                      : "bg-siso-orange hover:bg-siso-orange/90"
                  )}
                >
                  Confirm Purchase
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-xl font-medium text-siso-text-muted hover:text-siso-text hover:bg-siso-bg-alt transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

PurchaseConfirmationModal.displayName = 'PurchaseConfirmationModal';
