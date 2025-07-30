import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Shield, FileText, Wifi } from 'lucide-react';

interface AgentSandboxSettingsProps {
  sandboxEnabled: boolean;
  enableFileRead: boolean;
  enableFileWrite: boolean;
  enableNetwork: boolean;
  onSandboxChange: (enabled: boolean) => void;
  onFileReadChange: (enabled: boolean) => void;
  onFileWriteChange: (enabled: boolean) => void;
  onNetworkChange: (enabled: boolean) => void;
}

export const AgentSandboxSettings: React.FC<AgentSandboxSettingsProps> = ({
  sandboxEnabled,
  enableFileRead,
  enableFileWrite,
  enableNetwork,
  onSandboxChange,
  onFileReadChange,
  onFileWriteChange,
  onNetworkChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Sandbox Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="sandbox" className="flex items-center gap-2">
            Enable Sandbox
          </Label>
          <Switch
            id="sandbox"
            checked={sandboxEnabled}
            onCheckedChange={onSandboxChange}
          />
        </div>
        
        {sandboxEnabled && (
          <>
            <div className="flex items-center justify-between">
              <Label htmlFor="file-read" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                File Read Access
              </Label>
              <Switch
                id="file-read"
                checked={enableFileRead}
                onCheckedChange={onFileReadChange}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="file-write" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                File Write Access
              </Label>
              <Switch
                id="file-write"
                checked={enableFileWrite}
                onCheckedChange={onFileWriteChange}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="network" className="flex items-center gap-2">
                <Wifi className="w-4 h-4" />
                Network Access
              </Label>
              <Switch
                id="network"
                checked={enableNetwork}
                onCheckedChange={onNetworkChange}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};