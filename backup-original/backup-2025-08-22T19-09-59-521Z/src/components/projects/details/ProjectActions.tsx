
import { Button } from '@/components/ui/button';

export function ProjectActions() {
  return (
    <div className="flex gap-4">
      <Button 
        variant="outline"
        className="border-[#9b87f5]/30 text-[#9b87f5] hover:bg-[#9b87f5]/10"
      >
        View Documentation
      </Button>
      <Button 
        className="bg-gradient-to-r from-[#9b87f5] to-[#6E59A5] hover:opacity-90"
      >
        Project Dashboard
      </Button>
    </div>
  );
}
