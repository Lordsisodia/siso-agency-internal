import { ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Automation } from './types';

interface AutomationDetailsProps {
  automation: Automation;
}

export function AutomationDetails({ automation }: AutomationDetailsProps) {
  return (
    <>
      <SheetHeader>
        <SheetTitle className="text-2xl font-bold text-siso-text-bold">
          {automation.name}
        </SheetTitle>
        <SheetDescription className="text-siso-text">
          {automation.description}
        </SheetDescription>
      </SheetHeader>

      <div className="mt-6 space-y-6">
        {automation.integration_url && (
          <Button
            className="w-full justify-start gap-2"
            onClick={() => window.open(automation.integration_url!, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
            View Integration
          </Button>
        )}

        {automation.setup_guide && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-siso-text-bold">Setup Guide</h3>
            <p className="text-sm text-siso-text whitespace-pre-line">
              {automation.setup_guide}
            </p>
          </div>
        )}

        <div className="p-4 rounded-lg bg-siso-text/5">
          <h3 className="text-sm font-semibold text-siso-text-bold mb-2">Platform</h3>
          <div className="text-sm text-siso-text">
            {automation.platform || 'General'}
          </div>
        </div>
      </div>
    </>
  );
}