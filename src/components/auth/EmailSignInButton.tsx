
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface EmailSignInButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export const EmailSignInButton = ({ onClick, disabled }: EmailSignInButtonProps) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className="relative z-50 bg-gradient-to-r from-siso-red to-siso-orange hover:opacity-90 active:opacity-80 cursor-pointer transition-all duration-200 hover:scale-105 shadow-lg flex items-center gap-2 min-w-[240px] justify-center"
    >
      {disabled ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Signing in...
        </>
      ) : (
        <>
          Sign in with Email
        </>
      )}
    </Button>
  );
};
