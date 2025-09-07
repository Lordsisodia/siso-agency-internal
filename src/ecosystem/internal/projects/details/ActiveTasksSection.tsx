
import { Card } from "@/shared/ui/card";
import { ActiveTasksView } from '@/ecosystem/internal/projects/ActiveTasksView';

export function ActiveTasksSection() {
  return (
    <Card className="p-6 bg-black/30 border-siso-text/10">
      <ActiveTasksView />
    </Card>
  );
}
