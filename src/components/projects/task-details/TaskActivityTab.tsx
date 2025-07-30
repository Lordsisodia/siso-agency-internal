
import { TabsContent } from '@/components/ui/tabs';

export function TaskActivityTab() {
  return (
    <TabsContent value="activity" className="pb-6 focus-visible:outline-none focus-visible:ring-0">
      <div className="space-y-4">
        <div className="text-gray-400 italic">
          No activity recorded yet.
        </div>
      </div>
    </TabsContent>
  );
}
