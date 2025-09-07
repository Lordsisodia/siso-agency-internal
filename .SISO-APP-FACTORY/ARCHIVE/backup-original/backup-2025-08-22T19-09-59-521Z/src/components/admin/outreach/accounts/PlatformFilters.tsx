
import React from 'react';
import { Button } from '@/components/ui/button';
import { Instagram, Linkedin } from 'lucide-react';

interface PlatformFiltersProps {
  activePlatform?: 'instagram' | 'linkedin';
  onPlatformChange: (platform?: 'instagram' | 'linkedin') => void;
}

export const PlatformFilters = ({ activePlatform, onPlatformChange }: PlatformFiltersProps) => {
  return (
    <div className="flex gap-2">
      <Button
        variant={!activePlatform ? "default" : "outline"}
        onClick={() => onPlatformChange(undefined)}
      >
        All Platforms
      </Button>
      <Button
        variant={activePlatform === 'instagram' ? "default" : "outline"}
        onClick={() => onPlatformChange('instagram')}
      >
        <Instagram className="h-4 w-4 mr-2" />
        Instagram
      </Button>
      <Button
        variant={activePlatform === 'linkedin' ? "default" : "outline"}
        onClick={() => onPlatformChange('linkedin')}
      >
        <Linkedin className="h-4 w-4 mr-2" />
        LinkedIn
      </Button>
    </div>
  );
};
