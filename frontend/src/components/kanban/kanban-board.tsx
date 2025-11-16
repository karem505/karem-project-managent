/**
 * Kanban Board Component with Drag & Drop
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
import { Plus } from 'lucide-react';
import type { Task } from '@/types';

interface KanbanBoardProps {
  projectId: string;
}

const COLUMNS = [
  { id: 'backlog', title: 'Backlog', color: 'bg-gray-100' },
  { id: 'todo', title: 'To Do', color: 'bg-blue-100' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-purple-100' },
  { id: 'review', title: 'Review', color: 'bg-orange-100' },
  { id: 'done', title: 'Done', color: 'bg-green-100' },
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
    } catch (error) {
      // Error handled by store
    }
  };

  const handleUpdateTask = async (data: Partial<Task>) => {
    if (!editingTask) return;
    try {
      await updateTask(editingTask.id, data);
      setEditingTask(null);
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
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!kanbanData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No tasks found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Kanban Board</h3>
        <Button onClick={() => openCreateForm('todo')} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Kanban Board */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-5 gap-4">
          {COLUMNS.map((column) => {
            const columnTasks = (kanbanData && kanbanData[column.id as keyof typeof kanbanData]) || [];

            return (
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
                color={column.color}
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
            <div className="opacity-50">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Task</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDeleteTask(showDeleteConfirm)}
                isLoading={isLoading}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
