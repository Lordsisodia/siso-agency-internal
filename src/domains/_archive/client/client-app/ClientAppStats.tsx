
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock, DollarSign, CheckCircle } from 'lucide-react';

interface ClientAppStatsProps {
  estimatedCost?: number | null;
  estimatedDays?: number | null;
  completionPercentage?: number;
}

export function ClientAppStats({ 
  estimatedCost = 0, 
  estimatedDays = 0, 
  completionPercentage = 0 
}: ClientAppStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-black/30 border-siso-text/10">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center">
            <DollarSign className="h-8 w-8 text-siso-orange mb-2" />
            <h3 className="text-lg font-medium text-white">Project Budget</h3>
            <p className="text-3xl font-bold text-white mt-2">
              ${estimatedCost?.toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black/30 border-siso-text/10">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center">
            <Clock className="h-8 w-8 text-siso-orange mb-2" />
            <h3 className="text-lg font-medium text-white">Timeline</h3>
            <p className="text-3xl font-bold text-white mt-2">
              {estimatedDays} Days
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black/30 border-siso-text/10">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center">
            <CheckCircle className="h-8 w-8 text-siso-orange mb-2" />
            <h3 className="text-lg font-medium text-white">Completion</h3>
            <p className="text-3xl font-bold text-white mt-2">
              {completionPercentage}%
            </p>
            <Progress value={completionPercentage} className="w-full mt-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
