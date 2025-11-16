/**
 * Kanban Column Component
 */
'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableTaskCard } from './sortable-task-card';
import { Plus } from 'lucide-react';
import type { Task } from '@/types';

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id,
  title,
  color,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <div className="flex flex-col h-full">
      {/* Column Header */}
      <div className={`${color} rounded-t-lg px-4 py-3 border-b border-gray-200`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <span className="text-sm text-gray-600 bg-white px-2 py-0.5 rounded-full">
              {tasks.length}
            </span>
          </div>
          <button
            onClick={onAddTask}
            className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
            title="Add task"
          >
            <Plus className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Column Content */}
      <div
        ref={setNodeRef}
        className={`flex-1 bg-gray-50 rounded-b-lg p-3 space-y-3 min-h-[500px] transition-colors ${
          isOver ? 'bg-primary-50 ring-2 ring-primary-300' : ''
        }`}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onEdit={() => onEditTask(task)}
              onDelete={() => onDeleteTask(task.id)}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
};
