
import { useState } from 'react';

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export function useSubtasks(initialSubtasks: Subtask[]) {
  const [subtasks, setSubtasks] = useState(initialSubtasks);

  const handleSubtaskToggle = (id: string) => {
    setSubtasks(subtasks.map(st => 
      st.id === id ? { ...st, completed: !st.completed } : st
    ));
  };

  const handleAddSubtask = () => {
    const newId = String(subtasks.length + 1);
    setSubtasks([...subtasks, { id: newId, title: 'New subtask', completed: false }]);
  };

  const handleDeleteSubtask = (id: string) => {
    setSubtasks(subtasks.filter(st => st.id !== id));
  };

  const getProgress = () => {
    const completedSubtasks = subtasks.filter(st => st.completed).length;
    return subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0;
  };

  return {
    subtasks,
    handleSubtaskToggle,
    handleAddSubtask,
    handleDeleteSubtask,
    getProgress
  };
}
