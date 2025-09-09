
import React from 'react';
import { CheckCircle } from 'lucide-react';

export const FeatureInstructions: React.FC = () => {
  return (
    <div className="mt-6 p-4 bg-siso-orange/10 border border-siso-orange/30 rounded-lg">
      <h3 className="text-white font-semibold mb-2">How It Works</h3>
      <ul className="space-y-2">
        <li className="flex items-start gap-2">
          <CheckCircle className="h-5 w-5 text-siso-orange shrink-0 mt-0.5" />
          <span className="text-sm text-siso-text">
            <strong className="text-white">Select Features:</strong> Choose the features you want in your OnlyFans Management Platform.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle className="h-5 w-5 text-siso-orange shrink-0 mt-0.5" />
          <span className="text-sm text-siso-text">
            <strong className="text-white">Review Plan:</strong> After selecting features, you'll see a summary of your custom plan.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle className="h-5 w-5 text-siso-orange shrink-0 mt-0.5" />
          <span className="text-sm text-siso-text">
            <strong className="text-white">Get Started:</strong> Approve your plan to begin the onboarding process and receive your MVP.
          </span>
        </li>
      </ul>
    </div>
  );
};
