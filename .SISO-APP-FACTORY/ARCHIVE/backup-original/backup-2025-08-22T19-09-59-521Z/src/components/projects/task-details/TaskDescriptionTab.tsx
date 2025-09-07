
import { TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

interface TaskDescriptionTabProps {
  description: string;
  isEditing: boolean;
  onDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function TaskDescriptionTab({
  description,
  isEditing,
  onDescriptionChange
}: TaskDescriptionTabProps) {
  return (
    <TabsContent value="description" className="pb-6 focus-visible:outline-none focus-visible:ring-0">
      <div className="space-y-4">
        {isEditing ? (
          <Textarea 
            name="description"
            placeholder="Add a more detailed description..."
            className="min-h-[200px] bg-black/20"
            value={description}
            onChange={onDescriptionChange}
          />
        ) : (
          <div className="min-h-[200px] bg-black/10 rounded-md p-4">
            {description || (
              <p className="text-gray-500 italic">No description provided.</p>
            )}
          </div>
        )}
      </div>
    </TabsContent>
  );
}
