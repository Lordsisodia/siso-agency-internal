
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { OutreachAccount } from '@/types/outreach';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AccountManagementDialogProps {
  account?: OutreachAccount;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<OutreachAccount>) => void;
}

export const AccountManagementDialog = ({
  account,
  isOpen,
  onClose,
  onSave,
}: AccountManagementDialogProps) => {
  const [formData, setFormData] = React.useState<Partial<OutreachAccount>>(
    account || {
      platform: 'instagram',
      account_type: 'business',
      status: 'active',
      daily_dm_limit: 30,
      daily_follow_limit: 50,
      daily_comment_limit: 40,
      credentials: {},
      proxy_settings: {},
      platform_specific_settings: {},
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {account ? 'Edit Account' : 'Add New Account'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select
                value={formData.platform}
                onValueChange={(value) =>
                  setFormData({ ...formData, platform: value as 'instagram' | 'linkedin' })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry_focus">Industry Focus</Label>
              <Select
                value={formData.industry_focus}
                onValueChange={(value) =>
                  setFormData({ ...formData, industry_focus: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="onlyfans">OnlyFans Management</SelectItem>
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                  <SelectItem value="saas">SaaS</SelectItem>
                  <SelectItem value="agency">Agency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username || ''}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Account Credentials</Label>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={formData.credentials?.password || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    credentials: {
                      ...formData.credentials,
                      password: e.target.value,
                    },
                  })
                }
              />
              <Input
                type="email"
                placeholder="Recovery Email"
                value={formData.credentials?.recovery_email || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    credentials: {
                      ...formData.credentials,
                      recovery_email: e.target.value,
                    },
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Daily DM Limit</Label>
              <Input
                type="number"
                value={formData.daily_dm_limit || 30}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    daily_dm_limit: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Daily Follow Limit</Label>
              <Input
                type="number"
                value={formData.daily_follow_limit || 50}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    daily_follow_limit: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Daily Comment Limit</Label>
              <Input
                type="number"
                value={formData.daily_comment_limit || 40}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    daily_comment_limit: parseInt(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Account</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
