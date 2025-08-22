
import { ReactNode } from 'react';
import { AppLayout } from './AppLayout';

interface FinancialLayoutProps {
  children: ReactNode;
  title?: string;
}

export function FinancialLayout({ children, title = "Financial & Account" }: FinancialLayoutProps) {
  return (
    <AppLayout>
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-siso-red to-siso-orange bg-clip-text text-transparent mb-2">
              {title}
            </h1>
            <div className="flex items-center gap-4 mb-6">
              <a href="/financial/payments" className="text-sm text-siso-text hover:text-siso-text-bold transition-colors">
                Payments & Billing
              </a>
              <span className="text-siso-text/30">•</span>
              <a href="/financial/leaderboards" className="text-sm text-siso-text hover:text-siso-text-bold transition-colors">
                Leaderboards
              </a>
              <span className="text-siso-text/30">•</span>
              <a href="/financial/profile" className="text-sm text-siso-text hover:text-siso-text-bold transition-colors">
                Profile & Settings
              </a>
            </div>
          </div>
          {children}
        </div>
      </div>
    </AppLayout>
  );
}
