/**
 * Store Management Panel
 * Admin-only panel for managing XP store rewards
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/lib/hooks/ui/useToast';
import { cn } from '@/lib/utils';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  Package,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { xpStoreAdminService, type StoreReward, type CreateRewardData } from '@/xp-store/services/xpStoreService';

const REWARD_CATEGORIES = [
  { value: 'SOCIAL', label: 'Social', emoji: '🎲' },
  { value: 'FOOD', label: 'Food', emoji: '🍣' },
  { value: 'ENTERTAINMENT', label: 'Entertainment', emoji: '🎬' },
  { value: 'WELLNESS', label: 'Wellness', emoji: '🚶‍♂️' },
  { value: 'RECOVERY', label: 'Recovery', emoji: '💆‍♂️' },
  { value: 'REST', label: 'Rest', emoji: '🌤️' },
  { value: 'GROWTH', label: 'Growth', emoji: '🧠' },
  { value: 'INDULGENCE', label: 'Indulgence', emoji: '☕️' },
  { value: 'CUSTOM', label: 'Custom', emoji: '🎁' },
];

interface StoreManagementPanelProps {
  className?: string;
  onRewardChange?: () => void;
}

export const StoreManagementPanel = ({ className, onRewardChange }: StoreManagementPanelProps) => {
  const [rewards, setRewards] = useState<StoreReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingReward, setEditingReward] = useState<StoreReward | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateRewardData>({
    category: 'CUSTOM',
    name: '',
    description: '',
    icon_emoji: '🎁',
    base_price: 100,
    current_price: 100,
    is_active: true,
  });

  // Fetch rewards
  const fetchRewards = async () => {
    setLoading(true);
    setError(null);

    const result = await xpStoreAdminService.getRewards();

    if (result.error) {
      setError(result.error);
      toast({
        variant: 'destructive',
        title: 'Failed to load rewards',
        description: result.error,
      });
    } else if (result.data) {
      setRewards(result.data);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  // Handle add reward
  const handleAddReward = async () => {
    setSaving(true);

    const result = await xpStoreAdminService.addReward(formData);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Failed to add reward',
        description: result.error,
      });
    } else {
      toast({
        title: 'Reward added',
        description: `"${formData.name}" has been added to the store.`,
      });
      setIsAddDialogOpen(false);
      resetForm();
      fetchRewards();
      onRewardChange?.();
    }

    setSaving(false);
  };

  // Handle update reward
  const handleUpdateReward = async () => {
    if (!editingReward) return;

    setSaving(true);

    const result = await xpStoreAdminService.updateReward({
      id: editingReward.id,
      ...formData,
    });

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Failed to update reward',
        description: result.error,
      });
    } else {
      toast({
        title: 'Reward updated',
        description: `"${formData.name}" has been updated.`,
      });
      setIsEditDialogOpen(false);
      setEditingReward(null);
      resetForm();
      fetchRewards();
      onRewardChange?.();
    }

    setSaving(false);
  };

  // Handle delete reward
  const handleDeleteReward = async (id: string) => {
    const result = await xpStoreAdminService.deleteReward(id);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Failed to delete reward',
        description: result.error,
      });
    } else {
      toast({
        title: 'Reward deleted',
        description: 'The reward has been removed from the store.',
      });
      fetchRewards();
      onRewardChange?.();
    }
  };

  // Handle toggle active
  const handleToggleActive = async (reward: StoreReward) => {
    const result = await xpStoreAdminService.toggleRewardActive(reward.id, !reward.is_active);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Failed to update reward',
        description: result.error,
      });
    } else {
      toast({
        title: 'Reward updated',
        description: `"${reward.name}" is now ${reward.is_active ? 'inactive' : 'active'}.`,
      });
      fetchRewards();
      onRewardChange?.();
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      category: 'CUSTOM',
      name: '',
      description: '',
      icon_emoji: '🎁',
      base_price: 100,
      current_price: 100,
      is_active: true,
    });
  };

  // Open edit dialog
  const openEditDialog = (reward: StoreReward) => {
    setEditingReward(reward);
    setFormData({
      category: reward.category,
      name: reward.name,
      description: reward.description || '',
      icon_emoji: reward.icon_emoji,
      base_price: reward.base_price,
      current_price: reward.current_price,
      unlock_at: reward.unlock_at || undefined,
      max_daily_use: reward.max_daily_use || undefined,
      availability_window: reward.availability_window || undefined,
      is_active: reward.is_active,
      sort_order: reward.sort_order,
    });
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return (
      <Card className={cn('bg-gray-900 border-gray-800', className)}>
        <CardContent className="p-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn('bg-gray-900 border-red-500/20', className)}>
        <CardContent className="p-6">
          <p className="text-red-400 text-center">{error}</p>
          <Button onClick={fetchRewards} className="mt-4 w-full">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="h-6 w-6" />
            Store Management
          </h2>
          <p className="text-gray-400 mt-1">
            Manage XP store rewards and pricing
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Reward
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Reward</DialogTitle>
              <DialogDescription className="text-gray-400">
                Create a new reward for the XP store
              </DialogDescription>
            </DialogHeader>

            <RewardForm
              formData={formData}
              onChange={setFormData}
              onSubmit={handleAddReward}
              saving={saving}
              submitLabel="Add Reward"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Rewards List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {rewards.map((reward, index) => (
            <motion.div
              key={reward.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <Card className={cn(
                'bg-gray-900 border-gray-800 transition-all',
                !reward.is_active && 'opacity-60'
              )}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Drag Handle */}
                    <GripVertical className="h-5 w-5 text-gray-600 mt-2 cursor-grab" />

                    {/* Icon */}
                    <div className="text-3xl">{reward.icon_emoji}</div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white">{reward.name}</h3>
                        <Badge variant="outline" className={cn(
                          'border-gray-700 text-gray-300',
                          !reward.is_active && 'bg-gray-800'
                        )}>
                          {reward.category}
                        </Badge>
                        {!reward.is_active && (
                          <Badge className="bg-gray-700 text-gray-300">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                        {reward.description}
                      </p>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-white font-semibold">
                          {reward.current_price.toLocaleString()} XP
                        </span>
                        {reward.current_price !== reward.base_price && (
                          <span className="text-gray-500">
                            (Base: {reward.base_price.toLocaleString()})
                          </span>
                        )}
                        {reward.unlock_at && (
                          <span className="text-gray-500">
                            Unlocks at {reward.unlock_at.toLocaleString()} XP
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleActive(reward)}
                        className="text-gray-400 hover:text-white"
                      >
                        {reward.is_active ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditDialog(reward)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-gray-900 border-gray-800">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Reward?</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400">
                              Are you sure you want to delete "{reward.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-gray-800 text-white border-gray-700">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteReward(reward.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Reward</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update reward details
            </DialogDescription>
          </DialogHeader>

          <RewardForm
            formData={formData}
            onChange={setFormData}
            onSubmit={handleUpdateReward}
            saving={saving}
            submitLabel="Update Reward"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Reward Form Component
interface RewardFormProps {
  formData: CreateRewardData;
  onChange: (data: CreateRewardData) => void;
  onSubmit: () => void;
  saving: boolean;
  submitLabel: string;
}

const RewardForm = ({ formData, onChange, onSubmit, saving, submitLabel }: RewardFormProps) => {
  return (
    <div className="space-y-4">
      {/* Category */}
      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => onChange({ ...formData, category: value as any })}
        >
          <SelectTrigger className="bg-gray-800 border-gray-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            {REWARD_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.emoji} {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label>Reward Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => onChange({ ...formData, name: e.target.value })}
          placeholder="e.g., Premium Coffee Ritual"
          className="bg-gray-800 border-gray-700"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => onChange({ ...formData, description: e.target.value })}
          placeholder="Describe what this reward offers..."
          rows={3}
          className="bg-gray-800 border-gray-700"
        />
      </div>

      {/* Icon */}
      <div className="space-y-2">
        <Label>Icon Emoji</Label>
        <Input
          value={formData.icon_emoji}
          onChange={(e) => onChange({ ...formData, icon_emoji: e.target.value })}
          placeholder="🎁"
          className="bg-gray-800 border-gray-700 text-2xl text-center"
          maxLength={2}
        />
      </div>

      {/* Prices */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Base Price (XP)</Label>
          <Input
            type="number"
            value={formData.base_price}
            onChange={(e) => onChange({ ...formData, base_price: parseInt(e.target.value) || 0 })}
            className="bg-gray-800 border-gray-700"
          />
        </div>
        <div className="space-y-2">
          <Label>Current Price (XP)</Label>
          <Input
            type="number"
            value={formData.current_price}
            onChange={(e) => onChange({ ...formData, current_price: parseInt(e.target.value) || 0 })}
            className="bg-gray-800 border-gray-700"
          />
        </div>
      </div>

      {/* Optional Fields */}
      <div className="space-y-4 pt-4 border-t border-gray-800">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Unlock At (optional)</Label>
            <Input
              type="number"
              value={formData.unlock_at || ''}
              onChange={(e) => onChange({
                ...formData,
                unlock_at: e.target.value ? parseInt(e.target.value) : undefined
              })}
              placeholder="Total XP required"
              className="bg-gray-800 border-gray-700"
            />
          </div>
          <div className="space-y-2">
            <Label>Max Daily Use (optional)</Label>
            <Input
              type="number"
              value={formData.max_daily_use || ''}
              onChange={(e) => onChange({
                ...formData,
                max_daily_use: e.target.value ? parseInt(e.target.value) : undefined
              })}
              placeholder="Default: 1"
              className="bg-gray-800 border-gray-700"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Availability Window (optional)</Label>
          <Input
            value={formData.availability_window || ''}
            onChange={(e) => onChange({ ...formData, availability_window: e.target.value || undefined })}
            placeholder="e.g., Weekdays 9AM-5PM"
            className="bg-gray-800 border-gray-700"
          />
        </div>
      </div>

      {/* Active Toggle */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
        <div>
          <Label>Active</Label>
          <p className="text-sm text-gray-400">Show in store for users</p>
        </div>
        <Switch
          checked={formData.is_active}
          onCheckedChange={(checked) => onChange({ ...formData, is_active: checked })}
        />
      </div>

      {/* Submit */}
      <DialogFooter>
        <Button
          onClick={onSubmit}
          disabled={saving || !formData.name || !formData.description}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              {submitLabel}
            </>
          )}
        </Button>
      </DialogFooter>
    </div>
  );
};
