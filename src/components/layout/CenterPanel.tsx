import TaskForm from '@/components/forms/TaskForm';
import KanbanBoard from '@/components/kanban/KanbanBoard';

export default function MainContent() {
  return (
    <div className="p-4 overflow-y-auto">
      <div className="mb-6">
        <TaskForm />
      </div>
      <KanbanBoard />
    </div>
  );
}