
import { Code, Server, GitBranch } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';

export function DevelopmentProgress() {
  return (
    <Card className="p-8 bg-black/30 border-siso-text/10">
      <h2 className="text-2xl font-semibold mb-6">Development Progress</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-siso-text">
            <Code size={20} />
            <span className="text-lg">Smart Contract</span>
          </div>
          <Progress value={80} className="h-3" indicatorClassName="bg-[#9b87f5]" />
          <p className="text-sm text-siso-text">Contract development and testing</p>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-siso-text">
            <Server size={20} />
            <span className="text-lg">Backend Integration</span>
          </div>
          <Progress value={65} className="h-3" indicatorClassName="bg-[#9b87f5]" />
          <p className="text-sm text-siso-text">API and service integration</p>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-siso-text">
            <GitBranch size={20} />
            <span className="text-lg">Testing & Validation</span>
          </div>
          <Progress value={45} className="h-3" indicatorClassName="bg-[#9b87f5]" />
          <p className="text-sm text-siso-text">Security and performance testing</p>
        </div>
      </div>
    </Card>
  );
}
