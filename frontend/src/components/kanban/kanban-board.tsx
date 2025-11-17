/**
 * Enhanced Kanban Board Component with Drag & Drop
 */
'use client';

import { useEffect, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useTaskStore } from '@/lib/store/task-store';
import { TaskCard } from '@/components/tasks/task-card';
import { TaskForm } from '@/components/tasks/task-form';
import { KanbanColumn } from './kanban-column';
import { Loading } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, RefreshCw, LayoutGrid } from 'lucide-react';
import type { Task } from '@/types';

interface KanbanBoardProps {
  projectId: string;
}

const COLUMNS = [
  {
    id: 'backlog',
    title: 'Backlog',
    color: 'hsl(var(--secondary))',
    badgeColor: 'bg-secondary/10 text-secondary-foreground border-secondary/20'
  },
  {
    id: 'todo',
    title: 'To Do',
    color: 'hsl(var(--accent))',
    badgeColor: 'bg-accent/10 text-accent-foreground border-accent/20'
  },
  {
    id: 'in_progress',
    title: 'In Progress',
    color: 'hsl(var(--primary))',
    badgeColor: 'bg-primary/10 text-primary-foreground border-primary/20'
  },
  {
    id: 'review',
    title: 'Review',
    color: 'hsl(var(--warning))',
    badgeColor: 'bg-warning/10 text-warning-foreground border-warning/20'
  },
  {
    id: 'done',
    title: 'Done',
    color: 'hsl(var(--success))',
    badgeColor: 'bg-success/10 text-success-foreground border-success/20'
  },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ projectId }) => {
  const {
    kanbanData,
    isLoading,
    error,
    fetchKanbanData,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
  } = useTaskStore();

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState('todo');
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (projectId) {
      fetchKanbanData(projectId);
    }
  }, [projectId, fetchKanbanData]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const taskId = active.id as string;

    // Find the task being dragged
    if (kanbanData) {
      for (const column of Object.keys(kanbanData)) {
        const task = kanbanData[column as keyof typeof kanbanData].find((t: Task) => t.id === taskId);
        if (task) {
          setActiveTask(task);
          break;
        }
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;

    try {
      await moveTask(taskId, newStatus, 0);
      // Refresh the kanban data
      await fetchKanbanData(projectId);
    } catch (error) {
      console.error('Failed to move task:', error);
    }
  };

  const handleCreateTask = async (data: Partial<Task>) => {
    try {
      await createTask(data);
      setShowTaskForm(false);
      setDefaultStatus('todo');
      await fetchKanbanData(projectId);
    } catch (error) {
      // Error handled by store
    }
  };

  const handleUpdateTask = async (data: Partial<Task>) => {
    if (!editingTask) return;
    try {
      await updateTask(editingTask.id, data);
      setEditingTask(null);
      await fetchKanbanData(projectId);
    } catch (error) {
      // Error handled by store
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id);
      setShowDeleteConfirm(null);
      // Refresh kanban data
      await fetchKanbanData(projectId);
    } catch (error) {
      // Error handled by store
    }
  };

  const handleRefresh = () => {
    fetchKanbanData(projectId);
  };

  const openCreateForm = (status: string) => {
    setDefaultStatus(status);
    setShowTaskForm(true);
  };

  if (isLoading && !kanbanData) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loading size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
        <p className="font-medium">Error loading Kanban board</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!kanbanData) {
    return (
      <div className="text-center py-12">
        <LayoutGrid className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground">No tasks found</p>
      </div>
    );
  }

  const totalTasks = Object.values(kanbanData).reduce((sum, tasks) =>
    sum + (Array.isArray(tasks) ? tasks.length : 0), 0
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold">Kanban Board</h3>
              <p className="text-sm text-muted-foreground">
                {totalTasks} {totalTasks === 1 ? 'task' : 'tasks'} across all columns
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleRefresh} size="sm" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => openCreateForm('todo')} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>
      </Card>

      {/* Kanban Board */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {COLUMNS.map((column) => {
            const columnTasks = (kanbanData && kanbanData[column.id as keyof typeof kanbanData]) || [];

            return (
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
                color={column.color}
                badgeColor={column.badgeColor}
                tasks={Array.isArray(columnTasks) ? columnTasks : []}
                onAddTask={() => openCreateForm(column.id)}
                onEditTask={setEditingTask}
                onDeleteTask={setShowDeleteConfirm}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="opacity-60 rotate-3">
              <TaskCard
                task={activeTask}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Task Form Modal */}
      <TaskForm
        isOpen={showTaskForm || !!editingTask}
        onClose={() => {
          setShowTaskForm(false);
          setEditingTask(null);
        }}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask}
        projectId={projectId}
        defaultStatus={defaultStatus}
        isLoading={isLoading}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold mb-2">Delete Task</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteTask(showDeleteConfirm)}
              >
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
