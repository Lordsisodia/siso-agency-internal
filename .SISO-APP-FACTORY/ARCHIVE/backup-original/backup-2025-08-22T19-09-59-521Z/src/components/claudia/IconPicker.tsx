import React from 'react';
import { Bot, Code, Cpu, Zap, Brain, Rocket, Shield, Database, Cloud, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const ICON_MAP = {
  bot: Bot,
  code: Code,
  cpu: Cpu,
  zap: Zap,
  brain: Brain,
  rocket: Rocket,
  shield: Shield,
  database: Database,
  cloud: Cloud,
  terminal: Terminal
} as const;

export type IconName = keyof typeof ICON_MAP;

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  className?: string;
}

export const IconPicker: React.FC<IconPickerProps> = ({ value, onChange, className }) => {
  return (
    <div className={cn("grid grid-cols-5 gap-2", className)}>
      {Object.entries(ICON_MAP).map(([name, Icon]) => (
        <Button
          key={name}
          type="button"
          variant={value === name ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(name)}
          className="p-2"
        >
          <Icon className="w-4 h-4" />
        </Button>
      ))}
    </div>
  );
};