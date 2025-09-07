import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signOut } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';

export const SignOutButton = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      
      toast({
        title: "Signed out successfully",
        description: "Come back soon!",
      });
      
      navigate('/', { replace: true });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message || "An error occurred during sign out",
      });
    }
  };

  return (
    <Button
      onClick={handleSignOut}
      variant="ghost"
      className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Sign Out
    </Button>
  );
};