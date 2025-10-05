
import React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useInstagramLeads } from '@/hooks/useInstagramLeads';
import { toast } from 'sonner';

export const InstagramLeadForm = () => {
  const [username, setUsername] = useState('');
  const { addLead } = useInstagramLeads();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;

    try {
      await addLead.mutateAsync({ username });
      setUsername('');
      toast.success('Lead added successfully');
    } catch (error) {
      toast.error('Failed to add lead');
      console.error('Error adding lead:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end mb-4">
      <div className="flex-1">
        <Input
          placeholder="Instagram username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <Button type="submit" variant="default" disabled={addLead.isPending}>
        {addLead.isPending ? 'Adding...' : 'Add Lead'}
      </Button>
    </form>
  );
};
