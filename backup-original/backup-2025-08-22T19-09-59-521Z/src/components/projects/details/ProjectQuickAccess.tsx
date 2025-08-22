
import { ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { GlowEffect } from '@/components/ui/glow-effect';
import { Button } from '@/components/ui/button';

interface ProjectQuickAccessProps {
  name: string;
  description?: string;
  projectUrl?: string;
}

export function ProjectQuickAccess({ name, description, projectUrl }: ProjectQuickAccessProps) {
  return (
    <Card className="relative p-6 overflow-hidden bg-black/30 border-siso-text/10">
      <GlowEffect
        colors={['#9b87f5', '#6E59A5']}
        mode="colorShift"
        className="opacity-10"
      />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">{name}</h2>
          {projectUrl && (
            <Button
              variant="outline"
              className="gap-2 bg-black/20"
              onClick={() => window.open(projectUrl, '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
              Visit Project
            </Button>
          )}
        </div>
        {description && (
          <p className="text-siso-text">{description}</p>
        )}
      </div>
    </Card>
  );
}
