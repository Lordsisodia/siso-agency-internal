
import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProjectsEmptyStateProps {
  onCreateNew: () => void;
}

export function ProjectsEmptyState({ onCreateNew }: ProjectsEmptyStateProps) {
  return (
    <div className="bg-black/30 border border-dashed border-siso-text/20 rounded-lg p-10 flex flex-col items-center justify-center text-center">
      <div className="h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-r from-siso-red/20 to-siso-orange/20 mb-4">
        <FileText className="h-8 w-8 text-siso-orange" />
      </div>
      
      <h3 className="text-xl font-semibold text-white mb-2">No projects found</h3>
      <p className="text-siso-text mb-6 max-w-md">
        You haven't created any app projects yet. Get started by creating your first project plan.
      </p>
      
      <Button 
        onClick={onCreateNew}
        className="bg-gradient-to-r from-siso-red to-siso-orange hover:opacity-90 flex items-center gap-2"
      >
        <Plus size={16} />
        Create Your First Project
      </Button>
    </div>
  );
}
