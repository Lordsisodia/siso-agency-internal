
import { Card } from "@/components/ui/card";
import { ActiveTasksView } from '@/components/projects/ActiveTasksView';

export function ActiveTasksSection() {
  return (
    <Card className="p-6 bg-black/30 border-siso-text/10">
      <ActiveTasksView />
    </Card>
  );
}
