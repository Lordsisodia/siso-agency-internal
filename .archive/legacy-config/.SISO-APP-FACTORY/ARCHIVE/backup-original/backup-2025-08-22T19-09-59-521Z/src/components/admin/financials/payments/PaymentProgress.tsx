import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PaymentProgressProps {
  totalAmount: number;
  paidAmount: number;
  currency?: string;
}

export function PaymentProgress({ 
  totalAmount, 
  paidAmount, 
  currency = '£' 
}: PaymentProgressProps) {
  // Calculate percentage paid
  const percentPaid = Math.min(100, Math.round((paidAmount / totalAmount) * 100)) || 0;
  
  // Calculate remaining amount
  const remainingAmount = totalAmount - paidAmount;

  return (
    <Card className="bg-black/20 border border-siso-text/10 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-white">Payment Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-white">
              {currency}{paidAmount.toFixed(2)} paid of {currency}{totalAmount.toFixed(2)}
            </span>
            <span className="text-sm font-medium text-siso-orange">{percentPaid}%</span>
          </div>
          
          <Progress 
            value={percentPaid} 
            className="h-2 bg-gray-700" 
          />
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-siso-bg-alt rounded-lg p-3 border border-siso-text/10">
              <p className="text-sm text-gray-300">Paid</p>
              <p className="text-xl font-bold text-siso-orange">{currency}{paidAmount.toFixed(2)}</p>
            </div>
            <div className="bg-siso-bg-alt rounded-lg p-3 border border-siso-text/10">
              <p className="text-sm text-gray-300">Remaining</p>
              <p className="text-xl font-bold text-white">{currency}{remainingAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 