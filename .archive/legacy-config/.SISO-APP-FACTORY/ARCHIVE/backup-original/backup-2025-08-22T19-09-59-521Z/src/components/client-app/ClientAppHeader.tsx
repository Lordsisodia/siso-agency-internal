import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface ClientAppHeaderProps {
  appName: string;
  clientName: string;
  status: string;
  description?: string;
}

export function ClientAppHeader({ appName, clientName, status, description }: ClientAppHeaderProps) {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'in_progress':
      case 'active':
        return 'bg-blue-500/20 text-blue-400';
      case 'draft':
        return 'bg-amber-500/20 text-amber-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <Card className="border-t-4 border-t-primary bg-black/30 border-siso-text/10">
      <CardContent className="pt-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-siso-red to-siso-orange bg-clip-text text-transparent">
                {appName}
              </h1>
              <p className="text-siso-text mt-1">
                Built for <span className="font-semibold text-white">{clientName}</span>
              </p>
            </div>
            
            <Badge className={getStatusColor(status)}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>
          
          {description && (
            <p className="text-siso-text/90 text-lg">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
