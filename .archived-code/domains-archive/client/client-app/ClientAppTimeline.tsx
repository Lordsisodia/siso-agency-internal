
import { Card, CardContent } from '@/components/ui/card';
import { ClientData } from '@/types/client.types';
import { Check, Clock, CalendarDays } from 'lucide-react';

interface ClientAppTimelineProps {
  clientData?: ClientData | null;
}

export function ClientAppTimeline({ clientData }: ClientAppTimelineProps) {
  // Predefined milestones that would typically come from the database
  const milestones = [
    {
      id: 1,
      title: 'Project Kickoff',
      date: '2023-05-01',
      status: 'completed',
      description: 'Initial meeting to define project scope and requirements'
    },
    {
      id: 2,
      title: 'Design Approval',
      date: '2023-05-15',
      status: 'completed',
      description: 'Client approved wireframes and design mockups'
    },
    {
      id: 3,
      title: 'Development Phase 1',
      date: '2023-06-01',
      status: 'in-progress',
      description: 'Frontend development and core functionality'
    },
    {
      id: 4,
      title: 'Client Review',
      date: '2023-06-15',
      status: 'upcoming',
      description: 'Presentation of progress and feedback collection'
    },
    {
      id: 5,
      title: 'Development Phase 2',
      date: '2023-07-01',
      status: 'upcoming',
      description: 'Backend development and API integration'
    },
    {
      id: 6,
      title: 'Testing & QA',
      date: '2023-07-15',
      status: 'upcoming',
      description: 'Quality assurance and bug fixing'
    },
    {
      id: 7,
      title: 'Final Delivery',
      date: '2023-08-01',
      status: 'upcoming',
      description: 'Project handover and documentation'
    }
  ];

  return (
    <Card className="bg-black/30 border-siso-text/10">
      <CardContent className="p-8">
        <h2 className="text-xl font-semibold mb-6 text-white">Project Timeline</h2>
        
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-700"></div>
          
          <div className="space-y-8">
            {milestones.map((milestone) => (
              <div key={milestone.id} className="relative pl-10">
                <div className={`absolute left-0 top-1.5 w-8 h-8 rounded-full flex items-center justify-center ${
                  milestone.status === 'completed' ? 'bg-green-900/50' : 
                  milestone.status === 'in-progress' ? 'bg-blue-900/50' : 
                  'bg-gray-900/50'
                }`}>
                  {milestone.status === 'completed' ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : milestone.status === 'in-progress' ? (
                    <Clock className="h-4 w-4 text-blue-400" />
                  ) : (
                    <CalendarDays className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                
                <div className={`pb-4 ${
                  milestone.status === 'completed' ? 'text-gray-400' : ''
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-medium ${
                      milestone.status === 'completed' ? 'text-gray-300' : 
                      milestone.status === 'in-progress' ? 'text-blue-400' : 'text-white'
                    }`}>
                      {milestone.title}
                    </h4>
                    <span className="text-sm text-gray-500">
                      {new Date(milestone.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    {milestone.description}
                  </p>
                  
                  {milestone.status === 'in-progress' && (
                    <div className="mt-2 text-xs text-blue-400 bg-blue-900/30 py-1 px-2 rounded inline-block">
                      Currently in progress
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
