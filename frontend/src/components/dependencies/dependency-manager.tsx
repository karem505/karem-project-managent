/**
 * Task Dependency Manager Component
 */
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SelectField as Select } from '@/components/ui/select-field';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Link as LinkIcon } from 'lucide-react';
import { dependenciesAPI } from '@/lib/api/endpoints';
import type { Task, TaskDependency } from '@/types';

interface DependencyManagerProps {
  taskId?: string;
  projectId: string;
  availableTasks: Task[];
  existingDependencies?: TaskDependency[];
  onDependenciesChange?: () => void;
}

interface NewDependency {
  predecessor: string;
  dependency_type: 'FS' | 'SS' | 'FF' | 'SF';
  lag: number;
}

export const DependencyManager: React.FC<DependencyManagerProps> = ({
  taskId,
  projectId,
  availableTasks,
  existingDependencies = [],
  onDependenciesChange,
}) => {
  const [dependencies, setDependencies] = useState<TaskDependency[]>(existingDependencies);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newDep, setNewDep] = useState<NewDependency>({
    predecessor: '',
    dependency_type: 'FS',
    lag: 0,
  });

  useEffect(() => {
    if (taskId) {
      fetchDependencies();
    }
  }, [taskId]);

  const fetchDependencies = async () => {
    if (!taskId) return;

    try {
      const response = await dependenciesAPI.list({ successor: taskId });
      setDependencies(response.data);
    } catch (error) {
      console.error('Failed to fetch dependencies:', error);
    }
  };

  const handleAddDependency = async () => {
    if (!taskId || !newDep.predecessor) return;

    setIsLoading(true);
    try {
      const response = await dependenciesAPI.create({
        predecessor: newDep.predecessor,
        successor: taskId,
        dependency_type: newDep.dependency_type,
        lag: newDep.lag,
      });

      setDependencies([...dependencies, response.data]);
      setNewDep({ predecessor: '', dependency_type: 'FS', lag: 0 });
      setShowAddForm(false);

      if (onDependenciesChange) {
        onDependenciesChange();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to add dependency');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDependency = async (depId: string) => {
    if (!confirm('Remove this dependency?')) return;

    setIsLoading(true);
    try {
      await dependenciesAPI.delete(depId);
      setDependencies(dependencies.filter(d => d.id !== depId));

      if (onDependenciesChange) {
        onDependenciesChange();
      }
    } catch (error) {
      alert('Failed to delete dependency');
    } finally {
      setIsLoading(false);
    }
  };

  const getDependencyTypeLabel = (type: string) => {
    switch (type) {
      case 'FS':
        return 'Finish-to-Start';
      case 'SS':
        return 'Start-to-Start';
      case 'FF':
        return 'Finish-to-Finish';
      case 'SF':
        return 'Start-to-Finish';
      default:
        return type;
    }
  };

  // Filter out current task from available tasks
  const selectableTasks = Array.isArray(availableTasks) ? availableTasks.filter(t => t.id !== taskId) : [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LinkIcon className="h-4 w-4 text-gray-600" />
          <h4 className="font-medium text-gray-900">Task Dependencies</h4>
        </div>
        {taskId && !showAddForm && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Dependency
          </Button>
        )}
      </div>

      {/* Add Dependency Form */}
      {showAddForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Predecessor Task */}
            <Select
              label="Predecessor Task"
              value={newDep.predecessor}
              onChange={(e) => setNewDep({ ...newDep, predecessor: e.target.value })}
              options={selectableTasks.map(task => ({
                value: task.id,
                label: task.title
              }))}
              required
            />

            {/* Dependency Type */}
            <Select
              label="Type"
              value={newDep.dependency_type}
              onChange={(e) => setNewDep({ ...newDep, dependency_type: e.target.value as any })}
              options={[
                { value: 'FS', label: 'Finish-to-Start (FS)' },
                { value: 'SS', label: 'Start-to-Start (SS)' },
                { value: 'FF', label: 'Finish-to-Finish (FF)' },
                { value: 'SF', label: 'Start-to-Finish (SF)' },
              ]}
            />

            {/* Lag */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lag (days)
              </label>
              <Input
                type="number"
                value={newDep.lag}
                onChange={(e) => setNewDep({ ...newDep, lag: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setShowAddForm(false);
                setNewDep({ predecessor: '', dependency_type: 'FS', lag: 0 });
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleAddDependency}
              disabled={!newDep.predecessor || isLoading}
              isLoading={isLoading}
            >
              Add
            </Button>
          </div>
        </div>
      )}

      {/* Existing Dependencies List */}
      {Array.isArray(dependencies) && dependencies.length > 0 ? (
        <div className="space-y-2">
          {dependencies.map((dep) => (
            <div
              key={dep.id}
              className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">
                    {dep.predecessor_title || 'Unknown Task'}
                  </span>
                  <span className="text-sm text-gray-500">→</span>
                  <span className="text-sm text-gray-600">This Task</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {getDependencyTypeLabel(dep.dependency_type)}
                  </span>
                  {dep.lag !== 0 && (
                    <span className="text-xs text-gray-500">
                      Lag: {dep.lag} days
                    </span>
                  )}
                </div>
              </div>
              {taskId && (
                <button
                  onClick={() => handleDeleteDependency(dep.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  disabled={isLoading}
                  title="Remove dependency"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
          <LinkIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">
            {taskId
              ? 'No dependencies yet. Add one to link tasks together.'
              : 'Save the task first to add dependencies.'
            }
          </p>
        </div>
      )}

      {/* Info */}
      {!taskId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            💡 Save this task first, then you can add dependencies to other tasks.
          </p>
        </div>
      )}
    </div>
  );
};
