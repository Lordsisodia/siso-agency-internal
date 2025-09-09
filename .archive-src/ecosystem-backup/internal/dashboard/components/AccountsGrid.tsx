import React from 'react';
import { OutreachAccount } from '@/types/outreach';
import { OutreachAccountCard } from './OutreachAccountCard';

interface AccountsGridProps {
  accounts: OutreachAccount[];
  onEditAccount: (account: OutreachAccount) => void;
  platform?: 'instagram' | 'linkedin';
  industryFilter?: string;
}

export const AccountsGrid = ({ 
  accounts, 
  onEditAccount, 
  platform, 
  industryFilter 
}: AccountsGridProps) => {
  const filteredAccounts = accounts.filter(account => {
    // Filter by platform if specified
    if (platform && account.platform !== platform) {
      return false;
    }
    
    // Filter by industry if specified
    if (industryFilter && industryFilter !== 'all' && account.industry_focus !== industryFilter) {
      return false;
    }
    
    return true;
  });

  if (filteredAccounts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No accounts found matching your criteria.</p>
        <p className="text-sm">Try changing your filters or add a new account.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredAccounts.map((account) => (
        <OutreachAccountCard
          key={account.id}
          account={account}
          onEditClick={onEditAccount}
        />
      ))}
    </div>
  );
};
