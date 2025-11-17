/**
 * Task Form Component
 */
'use client';

import { useState, useEffect } from 'react';
import type { Task } from '@/types';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectField as Select } from '@/components/ui/select-field';
import { DependencyManager } from '@/components/dependencies/dependency-manager';
import { useTaskStore } from '@/lib/store/task-store';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Task>) => Promise<void>;
  task?: Task | null;
  projectId: string;
  defaultStatus?: string;
  isLoading?: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  task,
  projectId,
  defaultStatus = 'todo',
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    status: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    start_date: string;
    end_date: string;
    duration: string;
    estimated_hours: string;
    estimated_cost: string;
  }>({
    title: '',
    description: '',
    status: defaultStatus,
    priority: 'medium',
    start_date: '',
    end_date: '',
    duration: '',
    estimated_hours: '',
    estimated_cost: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const { tasks, fetchTasks } = useTaskStore();

  useEffect(() => {
    if (isOpen && projectId) {
      fetchTasks(projectId);
    }
  }, [isOpen, projectId, fetchTasks]);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        start_date: task.start_date,
        end_date: task.end_date,
        duration: task.duration.toString(),
        estimated_hours: task.estimated_hours.toString(),
        estimated_cost: task.estimated_cost.toString(),
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: defaultStatus,
        priority: 'medium',
        start_date: '',
        end_date: '',
        duration: '',
        estimated_hours: '',
        estimated_cost: '',
      });
    }
    setErrors({});
  }, [task, isOpen, defaultStatus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const calculateDuration = () => {
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setFormData((prev) => ({ ...prev, duration: diffDays.toString() }));
    }
  };

  useEffect(() => {
    calculateDuration();
  }, [formData.start_date, formData.end_date]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Task title is required';
    if (!formData.start_date) newErrors.start_date = 'Start date is required';
    if (!formData.end_date) newErrors.end_date = 'End date is required';
    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      newErrors.end_date = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const submitData: any = {
      project: projectId,
      title: formData.title.trim(),
      description: formData.description.trim(),
      status: formData.status,
      priority: formData.priority,
      start_date: formData.start_date,
      end_date: formData.end_date,
      duration: parseInt(formData.duration) || 1,
      estimated_hours: parseFloat(formData.estimated_hours) || 0,
      estimated_cost: parseFloat(formData.estimated_cost) || 0,
      progress: 0,
    };

    try {
      await onSubmit(submitData);
      onClose();
    } catch (error) {
      // Error handled by parent
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task ? 'Edit Task' : 'Create Task'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Task Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          required
          disabled={isLoading}
          placeholder="Enter task title..."
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={isLoading}
            placeholder="Task description (optional)..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={[
              { value: 'backlog', label: 'Backlog' },
              { value: 'todo', label: 'To Do' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'review', label: 'Review' },
              { value: 'done', label: 'Done' },
            ]}
            required
            disabled={isLoading}
          />

          <Select
            label="Priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
              { value: 'critical', label: 'Critical' },
            ]}
            required
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Start Date"
            name="start_date"
            type="date"
            value={formData.start_date}
            onChange={handleChange}
            error={errors.start_date}
            required
            disabled={isLoading}
          />

          <Input
            label="End Date"
            name="end_date"
            type="date"
            value={formData.end_date}
            onChange={handleChange}
            error={errors.end_date}
            required
            disabled={isLoading}
          />

          <Input
            label="Duration (days)"
            name="duration"
            type="number"
            value={formData.duration}
            onChange={handleChange}
            disabled={isLoading}
            helperText="Auto-calculated"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Estimated Hours"
            name="estimated_hours"
            type="number"
            step="0.5"
            value={formData.estimated_hours}
            onChange={handleChange}
            disabled={isLoading}
          />

          <Input
            label="Estimated Cost"
            name="estimated_cost"
            type="number"
            step="0.01"
            value={formData.estimated_cost}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        {/* Task Dependencies */}
        <div className="border-t border-gray-200 pt-4">
          <DependencyManager
            taskId={task?.id}
            projectId={projectId}
            availableTasks={tasks}
            existingDependencies={task?.dependencies as any}
            onDependenciesChange={() => {
              if (task?.id) {
                fetchTasks(projectId);
              }
            }}
          />
        </div>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {task ? 'Update Task' : 'Create Task'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
