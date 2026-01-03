/**
 * Purchase Dialog Component
 * Psychology-optimized reward purchase flow with earned messaging
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  CreditCard,
  Heart,
  Star,
  TrendingUp,
  Zap,
  Shield,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { XPPsychologyUtils } from '@/lib/utils/xpPsychologyUtils';

interface PurchaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reward: any;
  userBalance: any;
  onPurchase: (options: PurchaseOptions) => Promise<any>;
}

interface PurchaseOptions {
  rewardId: string;
  useLoan?: boolean;
  notes?: string;
  satisfactionPredict?: number;
}

export const PurchaseDialog = ({ 
  isOpen, 
  onClose, 
  reward, 
  userBalance, 
  onPurchase 
}: PurchaseDialogProps) => {
  const [step, setStep] = useState<'confirm' | 'loan' | 'processing' | 'success'>('confirm');
  const [useLoan, setUseLoan] = useState(false);
  const [loanAmount, setLoanAmount] = useState(0);
  const [notes, setNotes] = useState('');
  const [satisfactionPredict, setSatisfactionPredict] = useState([8]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [psychologyData, setPsychologyData] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  // Calculate psychology data when dialog opens
  useEffect(() => {
    if (isOpen && reward && userBalance) {
      const hoursToReEarn = Math.ceil(reward.currentPrice / 50); // Assume 50 XP/hour
      const psychology = XPPsychologyUtils.calculateSpendingPsychology(
        reward.currentPrice,
        userBalance.canSpend,
        hoursToReEarn,
        reward.name
      );
      setPsychologyData(psychology);

      // Determine if loan is needed
      const needsLoan = reward.currentPrice > userBalance.canSpend;
      setUseLoan(needsLoan);
      if (needsLoan) {
        setLoanAmount(reward.currentPrice - userBalance.canSpend);
      }
    }
  }, [isOpen, reward, userBalance]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setStep('confirm');
      setUseLoan(false);
      setLoanAmount(0);
      setNotes('');
      setSatisfactionPredict([8]);
      setAgreedToTerms(false);
      setProcessing(false);
    }
  }, [isOpen]);

  const handlePurchase = async () => {
    if (!reward) return;

    setProcessing(true);
    setStep('processing');

    try {
      const result = await onPurchase({
        rewardId: reward.id,
        useLoan,
        notes,
        satisfactionPredict: satisfactionPredict[0]
      });

      if (result.success) {
        setStep('success');
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        setStep('confirm');
        setProcessing(false);
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      setStep('confirm');
      setProcessing(false);
    }
  };

  const canPurchase = reward && (
    (userBalance?.canSpend >= reward.currentPrice) || 
    (useLoan && agreedToTerms)
  );

  if (!reward || !userBalance || !psychologyData) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-siso-bg border-siso-border">
        <AnimatePresence mode="wait">
          {step === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <span className="text-2xl">{reward.iconEmoji}</span>
                  <div>
                    <div className="text-siso-text-bold">{reward.name}</div>
                    <div className="text-sm text-siso-text-muted font-normal">
                      {reward.description}
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>

              {/* Psychology Messaging */}
              <Card className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border-green-500/20">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="font-semibold text-green-400">You EARNED this!</span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-siso-text">
                    <div>{psychologyData.earnedMessage}</div>
                    <div className="text-siso-text-muted">{psychologyData.motivationMessage}</div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-green-500/20">
                    <span className="text-xs text-green-400/70">Time invested</span>
                    <span className="text-xs text-green-400 font-medium">
                      ~{psychologyData.hoursToReEarn} hours of productive work
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Price Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-lg">
                  <span className="text-siso-text">Cost</span>
                  <span className="font-bold text-siso-orange">
                    {reward.currentPrice.toLocaleString()} XP
                  </span>
                </div>

                {useLoan && (
                  <div className="bg-orange-500/10 rounded-lg p-3 border border-orange-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="h-4 w-4 text-orange-400" />
                      <span className="text-sm font-medium text-orange-400">XP Loan Required</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-siso-text-muted">Your XP:</span>
                        <span className="text-siso-text">{userBalance.canSpend.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-siso-text-muted">Loan needed:</span>
                        <span className="text-orange-400">{loanAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span className="text-siso-text-muted">Repay amount:</span>
                        <span className="text-orange-400">
                          {Math.ceil(loanAmount * 1.2).toLocaleString()} XP
                        </span>
                      </div>
                      <div className="text-xs text-orange-400/70">
                        20% interest • 7 days to repay
                      </div>
                    </div>
                  </div>
                )}

                {/* After Purchase */}
                <div className="bg-siso-bg-alt rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-siso-text-muted">After purchase:</span>
                    <div className="text-right">
                      <div className="text-siso-text font-medium">
                        {(userBalance.canSpend - (useLoan ? 0 : reward.currentPrice)).toLocaleString()} XP
                      </div>
                      <div className="text-xs text-siso-text-muted">
                        {psychologyData.remainingMessage}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Satisfaction Prediction */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-siso-text">
                  How satisfied do you think you'll feel? (1-10)
                </label>
                <div className="space-y-2">
                  <Slider
                    value={satisfactionPredict}
                    onValueChange={setSatisfactionPredict}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-siso-text-muted">
                    <span>Not satisfied</span>
                    <span className="font-medium text-siso-text">
                      {satisfactionPredict[0]}/10
                    </span>
                    <span>Very satisfied</span>
                  </div>
                </div>
              </div>

              {/* Optional Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-siso-text">
                  Why this reward? (Optional)
                </label>
                <Textarea
                  placeholder="I earned this because..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-siso-bg-alt border-siso-border resize-none"
                  rows={2}
                />
              </div>

              {/* Loan Agreement */}
              {useLoan && (
                <div className="space-y-3">
                  <Separator />
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="loan-terms"
                      checked={agreedToTerms}
                      onCheckedChange={(checked) => setAgreedToTerms(!!checked)}
                    />
                    <label htmlFor="loan-terms" className="text-sm text-siso-text leading-relaxed">
                      I understand I'm borrowing <strong>{loanAmount.toLocaleString()} XP</strong> and 
                      will repay <strong>{Math.ceil(loanAmount * 1.2).toLocaleString()} XP</strong> within 
                      7 days through productive work.
                    </label>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 border-siso-border"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePurchase}
                  disabled={!canPurchase || processing}
                  className="flex-1 bg-siso-orange hover:bg-siso-red"
                >
                  {processing ? 'Processing...' : useLoan ? 'Borrow & Enjoy' : 'Purchase & Enjoy'}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 py-8"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-16 w-16 border-4 border-siso-orange border-t-transparent rounded-full mx-auto"
              />
              <div>
                <h3 className="text-lg font-semibold text-siso-text-bold">
                  Purchasing {reward.name}...
                </h3>
                <p className="text-siso-text-muted">
                  Your earned reward is being processed
                </p>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="h-16 w-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto"
              >
                <CheckCircle className="h-8 w-8 text-green-400" />
              </motion.div>
              
              <div>
                <h3 className="text-xl font-bold text-green-400 mb-2">
                  Enjoy Your Earned Reward! 🎉
                </h3>
                <p className="text-siso-text">
                  {reward.name} purchased successfully
                </p>
                <p className="text-sm text-siso-text-muted mt-2">
                  You've earned this through productive work!
                </p>
              </div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-xs text-siso-text-muted"
              >
                Dialog will close automatically...
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};