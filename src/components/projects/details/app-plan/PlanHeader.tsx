
import React from 'react';
import { Button } from '@/components/ui/button';

interface PlanHeaderProps {
  title: string;
  description: string;
}

export function PlanHeader({ title, description }: PlanHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-neutral-400">{description}</p>
      </div>
      <div className="flex gap-3">
        <Button className="bg-[#FF5722] hover:bg-[#E64A19] text-white">
          Export Plan
        </Button>
        <Button variant="outline" className="border-white/10 text-white">
          Edit Plan
        </Button>
      </div>
    </div>
  );
}
