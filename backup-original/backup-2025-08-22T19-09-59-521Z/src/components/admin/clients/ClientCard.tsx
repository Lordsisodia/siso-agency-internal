import React, { useState } from 'react';
import { ClientData } from '@/types/client.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRight, Calendar, CircleUser } from 'lucide-react';
import { ClientInviteDialog } from "./ClientInviteDialog";

interface ClientCardProps {
  client: ClientData;
  onClick?: () => void;
}

export function ClientCard({ client, onClick }: ClientCardProps) {
  // Show invite dialog state
  const [inviteOpen, setInviteOpen] = useState(false);

  // Show button only if client.email is missing/empty
  const showInvite = !client.email;

  return (
    <div className="bg-background border rounded-lg shadow-sm p-4 hover:shadow-lg transition group cursor-pointer" onClick={onClick}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-bold text-lg text-white">{client.business_name || client.full_name}</h3>
          <p className="text-sm text-muted-foreground">{client.project_name || "-"}</p>
        </div>
        {/* Show the invite button if no email */}
        {showInvite && (
          <Button
            size="sm"
            variant="secondary"
            className="text-xs"
            onClick={e => { e.stopPropagation(); setInviteOpen(true); }}
          >
            Create Login
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <Badge variant={client.status === 'completed' ? 'success' : client.status === 'in_progress' ? 'default' : 'secondary'}>
          {client.status === 'completed' ? 'Completed' : client.status === 'in_progress' ? 'In Progress' : 'Pending'}
        </Badge>
        <div className="flex items-center text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 mr-1" />
          {formatDistanceToNow(new Date(client.updated_at), { addSuffix: true })}
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span>Progress</span>
          <span>{client.current_step}/{client.total_steps}</span>
        </div>
        <Progress value={(client.current_step / client.total_steps) * 100} />
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center">
          {client.avatar_url ? (
            <img src={client.avatar_url} alt={client.full_name} className="h-6 w-6 rounded-full mr-2" />
          ) : (
            <CircleUser className="h-5 w-5 mr-2 text-muted-foreground" />
          )}
          <span className="text-muted-foreground">{client.full_name}</span>
        </div>
        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
          Details <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </div>
      <ClientInviteDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        clientId={client.id}
        clientEmail={client.email}
        onSuccess={() => {/* refetch client list? */}}
      />
    </div>
  );
}
