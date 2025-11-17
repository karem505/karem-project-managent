/**
 * Enhanced Kanban Column Component
 */
'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableTaskCard } from './sortable-task-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import type { Task } from '@/types';

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  badgeColor?: string;
  tasks: Task[];
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id,
  title,
  color,
  badgeColor,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <Card className="flex flex-col h-full">
      {/* Column Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">{title}</h3>
            <Badge variant="secondary" className={badgeColor}>
              {tasks.length}
            </Badge>
          </div>
          <Button
            onClick={onAddTask}
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="h-1 w-full rounded-full overflow-hidden bg-muted">
          <div className="h-full" style={{ backgroundColor: color, width: '100%' }} />
        </div>
      </div>

      {/* Column Content */}
      <div
        ref={setNodeRef}
        className={`flex-1 p-3 space-y-2 min-h-[500px] overflow-y-auto transition-all ${
          isOver ? 'bg-accent/30 ring-2 ring-primary ring-inset' : 'bg-muted/20'
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

        {tasks.length === 0 && !isOver && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            <div className="text-4xl mb-2 opacity-20">📋</div>
            <p>No tasks</p>
            <p className="text-xs mt-1">Drag tasks here</p>
          </div>
        )}

        {tasks.length === 0 && isOver && (
          <div className="text-center py-12 text-primary text-sm font-medium">
            <div className="text-4xl mb-2">↓</div>
            <p>Drop task here</p>
          </div>
        )}
      </div>
    </Card>
  );
};
