
import { FileText, Calendar, GitBranch, Users } from 'lucide-react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

export function ProjectNavigation() {
  return (
    <TabsList className="mb-8">
      <TabsTrigger value="overview" className="flex items-center gap-2">
        <FileText className="h-4 w-4" />
        Overview
      </TabsTrigger>
      <TabsTrigger value="timeline" className="flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        Timeline
      </TabsTrigger>
      <TabsTrigger value="tasks" className="flex items-center gap-2">
        <GitBranch className="h-4 w-4" />
        Tasks
      </TabsTrigger>
      <TabsTrigger value="team" className="flex items-center gap-2">
        <Users className="h-4 w-4" />
        Team
      </TabsTrigger>
    </TabsList>
  );
}
