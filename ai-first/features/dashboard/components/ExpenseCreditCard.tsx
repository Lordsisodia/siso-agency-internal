import { GlowEffect } from '@/components/ui/glow-effect';
import { CreditCard } from 'lucide-react';

interface ExpenseCreditCardProps {
  currentCosts: number;
  predictedCosts?: number;
}

export function ExpenseCreditCard({ currentCosts, predictedCosts }: ExpenseCreditCardProps) {
  return (
    <div className="relative h-[200px] w-full">
      <GlowEffect
        colors={['#FFA726', '#FF5722', '#FF8A65', '#FFCC80']}
        mode="static"
        blur="medium"
      />
      <div className="relative h-full w-full rounded-lg bg-siso-bg-alt/90 backdrop-blur-xl p-6 text-white border border-siso-orange/20">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-lg font-medium mb-1 text-siso-text">Total App Cost</h3>
            <p className="text-3xl font-bold text-siso-text-bold">£{currentCosts.toFixed(2)}</p>
          </div>
          <CreditCard className="h-8 w-8 text-siso-orange" />
        </div>
        
        {predictedCosts && predictedCosts > 0 && (
          <div className="border-t border-siso-orange/20 pt-4">
            <p className="text-sm text-siso-text-muted mb-1">Predicted Additional Costs</p>
            <p className="text-xl font-semibold text-siso-orange">£{predictedCosts.toFixed(2)}</p>
          </div>
        )}

        <div className="absolute bottom-6 right-6">
          <svg
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 70 70"
            aria-label="Logo"
            width="70"
            height="70"
            className="h-8 w-8 text-siso-orange"
            fill="none"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="3"
              d="M51.883 26.495c-7.277-4.124-18.08-7.004-26.519-7.425-2.357-.118-4.407-.244-6.364 1.06M59.642 51c-10.47-7.25-26.594-13.426-39.514-15.664-3.61-.625-6.744-1.202-9.991.263"
            ></path>
          </svg>
        </div>
      </div>
    </div>
  );
}
