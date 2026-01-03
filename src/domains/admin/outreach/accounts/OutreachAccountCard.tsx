
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Instagram, Linkedin } from 'lucide-react';
import { OutreachAccount } from '@/types/outreach';
import { formatCompactNumber } from '@/lib/formatters';

interface OutreachAccountCardProps {
  account: OutreachAccount;
  onEditClick: (account: OutreachAccount) => void;
}

export const OutreachAccountCard = ({ account, onEditClick }: OutreachAccountCardProps) => {
  const platformIcon = account.platform === 'instagram' ? Instagram : Linkedin;
  const PlatformIcon = platformIcon;

  const getDailyProgressColor = (used: number, limit: number) => {
    const percentage = (used / limit) * 100;
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 75) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <Card className="overflow-hidden">
      <div className={`h-3 ${account.platform === 'instagram' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-blue-600 to-blue-800'}`} />
      <CardContent className="pt-4">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-full ${account.platform === 'instagram' ? 'bg-purple-100' : 'bg-blue-100'} flex items-center justify-center`}>
            <PlatformIcon className={`h-5 w-5 ${account.platform === 'instagram' ? 'text-purple-600' : 'text-blue-600'}`} />
          </div>
          <div>
            <h4 className="font-semibold">@{account.username}</h4>
            <p className="text-xs text-muted-foreground capitalize">{account.account_type} Account</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center mb-3">
          <div>
            <p className="text-sm font-medium">15/{account.daily_dm_limit}</p>
            <p className="text-xs text-muted-foreground">DMs Today</p>
          </div>
          <div>
            <p className="text-sm font-medium">20/{account.daily_follow_limit}</p>
            <p className="text-xs text-muted-foreground">Follows</p>
          </div>
          <div>
            <p className="text-sm font-medium">10/{account.daily_comment_limit}</p>
            <p className="text-xs text-muted-foreground">Comments</p>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Badge variant={account.status === 'active' ? 'default' : 'outline'} className="text-xs">
            {account.status === 'active' ? 'Active' : 'Paused'}
          </Badge>
          <Button variant="ghost" size="sm" onClick={() => onEditClick(account)}>
            <Edit className="h-3 w-3 mr-1" />
            Manage
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
