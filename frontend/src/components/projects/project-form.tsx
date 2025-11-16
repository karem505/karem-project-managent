/**
 * Project Form Component
 */
'use client';

import { useState, useEffect } from 'react';
import type { Project } from '@/types';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useClientStore } from '@/lib/store/client-store';

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Project>) => Promise<void>;
  project?: Project | null;
  isLoading?: boolean;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  project,
  isLoading = false,
}) => {
  const { clients, fetchClients } = useClientStore();

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    client: string;
    budget: string;
    start_date: string;
    end_date: string;
    status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  }>({
    name: '',
    description: '',
    client: '',
    budget: '',
    start_date: '',
    end_date: '',
    status: 'planning',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || '',
        client: project.client?.id || '',
        budget: project.budget.toString(),
        start_date: project.start_date,
        end_date: project.end_date,
        status: project.status,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        client: '',
        budget: '',
        start_date: '',
        end_date: '',
        status: 'planning',
      });
    }
    setErrors({});
  }, [project, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Project name is required';
    if (!formData.start_date) newErrors.start_date = 'Start date is required';
    if (!formData.end_date) newErrors.end_date = 'End date is required';
    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      newErrors.end_date = 'End date must be after start date';
    }
    if (formData.budget && parseFloat(formData.budget) < 0) {
      newErrors.budget = 'Budget must be positive';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const submitData: any = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      start_date: formData.start_date,
      end_date: formData.end_date,
      status: formData.status,
      budget: formData.budget ? parseFloat(formData.budget) : 0,
    };

    if (formData.client) {
      submitData.client = formData.client;
    }

    try {
      await onSubmit(submitData);
      onClose();
    } catch (error) {
      // Error handled by parent
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={project ? 'Edit Project' : 'Create Project'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Project Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
          disabled={isLoading}
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
          />
        </div>

        <Select
          label="Client"
          name="client"
          value={formData.client}
          onChange={handleChange}
          options={Array.isArray(clients) ? clients.map((c) => ({ value: c.id, label: c.name })) : []}
          disabled={isLoading}
        />

        <div className="grid grid-cols-2 gap-4">
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Budget"
            name="budget"
            type="number"
            step="0.01"
            value={formData.budget}
            onChange={handleChange}
            error={errors.budget}
            disabled={isLoading}
          />

          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={[
              { value: 'planning', label: 'Planning' },
              { value: 'active', label: 'Active' },
              { value: 'on_hold', label: 'On Hold' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
            required
            disabled={isLoading}
          />
        </div>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {project ? 'Update Project' : 'Create Project'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
