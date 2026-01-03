/**
 * Deep Work Task Creator Dialog with Client Selector
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClientsList } from '@/domains/client/hooks/useClientsList';
import { Building2, Zap } from 'lucide-react';

interface DeepWorkTaskCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (data: { title: string; priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'; clientId?: string | null }) => Promise<void>;
}

export function DeepWorkTaskCreator({ isOpen, onClose, onCreateTask }: DeepWorkTaskCreatorProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('HIGH');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { clients, isLoading: clientsLoading } = useClientsList();

  const handleSubmit = async () => {
    if (!title.trim()) return;

    setIsCreating(true);
    try {
      await onCreateTask({
        title: title.trim(),
        priority,
        clientId: selectedClientId,
      });

      // Reset form
      setTitle('');
      setPriority('HIGH');
      setSelectedClientId(null);
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setPriority('HIGH');
    setSelectedClientId(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="bg-gradient-to-br from-blue-950 via-blue-900/95 to-blue-950 border-blue-700/50 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-blue-100 flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-400" />
            Create Deep Work Task
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="task-title" className="text-sm text-blue-200">
              Task Title
            </Label>
            <Input
              id="task-title"
              placeholder="What outcome are you working toward?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-blue-950/50 border-blue-700/50 text-white placeholder:text-blue-300/30 focus:border-blue-500/70"
              autoFocus
            />
          </div>

          {/* Priority Selector */}
          <div className="space-y-2">
            <Label htmlFor="task-priority" className="text-sm text-blue-200">
              Priority Level
            </Label>
            <Select value={priority} onValueChange={(value) => setPriority(value as typeof priority)}>
              <SelectTrigger
                id="task-priority"
                className="bg-blue-950/50 border-blue-700/50 text-white focus:border-blue-500/70"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-blue-950 border-blue-700/50 text-white">
                <SelectItem value="LOW" className="hover:bg-blue-900/50">
                  ⚪ Low Priority
                </SelectItem>
                <SelectItem value="MEDIUM" className="hover:bg-blue-900/50">
                  🟢 Medium Priority
                </SelectItem>
                <SelectItem value="HIGH" className="hover:bg-blue-900/50">
                  🔴 High Priority
                </SelectItem>
                <SelectItem value="URGENT" className="hover:bg-blue-900/50">
                  🚨 Urgent
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Client Selector (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="task-client" className="text-sm text-blue-200 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Link to Client (Optional)
            </Label>
            <Select value={selectedClientId || 'none'} onValueChange={(value) => setSelectedClientId(value === 'none' ? null : value)}>
              <SelectTrigger
                id="task-client"
                className="bg-blue-950/50 border-blue-700/50 text-white focus:border-blue-500/70"
                disabled={clientsLoading}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-blue-950 border-blue-700/50 text-white max-h-64">
                <SelectItem value="none" className="hover:bg-blue-900/50">
                  📋 Personal Task (No Client)
                </SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id} className="hover:bg-blue-900/50">
                    📁 {client.business_name || client.full_name || 'Unnamed Client'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-blue-300/60">
              Link this task to a client to show it on their workspace
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isCreating}
            className="border-blue-700/50 text-blue-200 hover:bg-blue-900/30"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || isCreating}
            className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white hover:from-blue-500/90"
          >
            {isCreating ? 'Creating...' : 'Create Task'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
