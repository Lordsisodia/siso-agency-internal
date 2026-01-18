
import { AnimatedCard } from "@/components/ui/animated-card";
import { Button } from "@/components/ui/button";
import { TodoList } from "@/components/admin/clients/TodoList";
import { TodoItem } from "@/domains/client/domain/types";
import { useNavigate } from "react-router-dom";

interface ClientTodoListCardProps {
  todos: TodoItem[];
  onUpdate: (todos: TodoItem[]) => void;
  clientId: string;
}

export function ClientTodoListCard({ todos, onUpdate, clientId }: ClientTodoListCardProps) {
  const navigate = useNavigate();

  return (
    <AnimatedCard>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Your Tasks</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/client-dashboard/tasks')}
        >
          View All
        </Button>
      </div>
      <TodoList
        todos={todos}
        onUpdate={onUpdate}
        clientId={clientId}
      />
    </AnimatedCard>
  );
}
