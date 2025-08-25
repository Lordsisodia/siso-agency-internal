
import * as React from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { inviteClientUser } from "@/utils/inviteClientUser";

interface ClientInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientEmail?: string | null;
  onSuccess?: () => void;
}

export function ClientInviteDialog({
  open,
  onOpenChange,
  clientId,
  clientEmail,
  onSuccess
}: ClientInviteDialogProps) {
  const { toast } = useToast();
  const [email, setEmail] = React.useState(clientEmail || "");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await inviteClientUser({ email, password, clientId });
    setLoading(false);

    toast({
      title: result.success ? "Client Login Created" : "Error",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });

    if (result.success) {
      onOpenChange(false);
      if (onSuccess) onSuccess();
    }
  };

  React.useEffect(() => {
    if (open) {
      setEmail(clientEmail || "");
      setPassword("");
    }
  }, [open, clientEmail]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Client Login</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-siso-text">Email</label>
            <Input 
              required 
              type="email" 
              placeholder="client@email.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-siso-text">Password</label>
            <Input 
              required 
              type="password" 
              minLength={6} 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="Temporary password"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !email || !password}>
              {loading ? (<><Loader2 className="h-4 w-4 animate-spin mr-2" />Creating...</>) : "Create Login"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
