import React from 'react';
import { SelectComponent, type SelectOption } from '@/shared/ui/select-component';
import { Label } from '@/shared/ui/label';
import type { ClaudeInstallation } from '@/shared/lib/claudia-api';

interface ClaudeVersionSelectorProps {
  installations: ClaudeInstallation[];
  selectedPath?: string;
  onSelect: (path: string) => void;
}

export const ClaudeVersionSelector: React.FC<ClaudeVersionSelectorProps> = ({
  installations,
  selectedPath,
  onSelect
}) => {
  const options: SelectOption[] = installations.map(install => ({
    value: install.path,
    label: `${install.source} - ${install.version || 'Unknown version'}`
  }));

  return (
    <div className="space-y-2">
      <Label>Claude Installation</Label>
      <SelectComponent
        options={options}
        value={selectedPath}
        onValueChange={onSelect}
        placeholder="Select Claude installation"
      />
    </div>
  );
};