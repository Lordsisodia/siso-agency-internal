
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRight, Trophy, Clock, CreditCard, Users } from 'lucide-react';

interface ClientAppCaseStudyProps {
  challenge?: string;
  solution?: string;
  results?: string[];
  metrics?: {
    timeToMarket?: string;
    costSavings?: string;
    userBase?: string;
  };
}

export function ClientAppCaseStudy({ 
  challenge, 
  solution, 
  results = [], 
  metrics 
}: ClientAppCaseStudyProps) {
  return (
    <Card className="bg-black/30 border-siso-text/10">
      <CardContent className="p-8">
        <h2 className="text-xl font-semibold mb-6 text-white">Case Study</h2>
        
        <div className="space-y-8">
          {challenge && (
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Challenge</h3>
              <p className="text-siso-text">{challenge}</p>
            </div>
          )}

          {solution && (
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Our Solution</h3>
              <p className="text-siso-text">{solution}</p>
            </div>
          )}

          {results.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Key Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.map((result, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3 bg-black/20 p-4 rounded-lg"
                  >
                    <Trophy className="h-5 w-5 text-siso-orange flex-shrink-0 mt-0.5" />
                    <p className="text-siso-text">{result}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {metrics && (
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Project Metrics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {metrics.timeToMarket && (
                  <div className="flex items-center gap-3 bg-black/20 p-4 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-sm text-siso-text">Time to Market</p>
                      <p className="text-white font-medium">{metrics.timeToMarket}</p>
                    </div>
                  </div>
                )}
                {metrics.costSavings && (
                  <div className="flex items-center gap-3 bg-black/20 p-4 rounded-lg">
                    <CreditCard className="h-5 w-5 text-green-400" />
                    <div>
                      <p className="text-sm text-siso-text">Cost Savings</p>
                      <p className="text-white font-medium">{metrics.costSavings}</p>
                    </div>
                  </div>
                )}
                {metrics.userBase && (
                  <div className="flex items-center gap-3 bg-black/20 p-4 rounded-lg">
                    <Users className="h-5 w-5 text-purple-400" />
                    <div>
                      <p className="text-sm text-siso-text">Active Users</p>
                      <p className="text-white font-medium">{metrics.userBase}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
