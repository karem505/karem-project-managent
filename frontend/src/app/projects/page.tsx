/**
 * Projects List Page
 */
'use client';

import { useEffect, useState } from 'react';
import { useProjectStore } from '@/lib/store/project-store';
import { ProjectCard } from '@/components/projects/project-card';
import { ProjectForm } from '@/components/projects/project-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectField as Select } from '@/components/ui/select-field';
import { Loading } from '@/components/ui/loading';
import { Plus, Search, Filter } from 'lucide-react';
import type { Project } from '@/types';

export default function ProjectsPage() {
  const {
    projects,
    isLoading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    clearError,
  } = useProjectStore();

  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const params: any = {};
    if (searchTerm) params.search = searchTerm;
    if (statusFilter) params.status = statusFilter;
    fetchProjects(params);
  };

  const handleSearch = () => {
    loadProjects();
  };

  const handleCreateProject = async (data: Partial<Project>) => {
    try {
      await createProject(data);
      setShowForm(false);
    } catch (error) {
      // Error handled by store
    }
  };

  const handleUpdateProject = async (data: Partial<Project>) => {
    if (!editingProject) return;
    try {
      await updateProject(editingProject.id, data);
      setEditingProject(null);
    } catch (error) {
      // Error handled by store
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteProject(id);
      setShowDeleteConfirm(null);
    } catch (error) {
      // Error handled by store
    }
  };

  const openEditForm = (project: Project) => {
    setEditingProject(project);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProject(null);
    clearError();
  };

  const filteredProjects = Array.isArray(projects) ? projects.filter((project) => {
    const matchesSearch =
      !searchTerm ||
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  }) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">Manage your projects and track progress</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-5 w-5 mr-2" />
          New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <Select
            name="status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'All Status' },
              { value: 'planning', label: 'Planning' },
              { value: 'active', label: 'Active' },
              { value: 'on_hold', label: 'On Hold' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
            className="w-48"
          />

          <Button variant="outline" onClick={handleSearch}>
            <Filter className="h-5 w-5 mr-2" />
            Apply Filters
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <Loading size="lg" />
        </div>
      )}

      {/* Projects Grid */}
      {!isLoading && (
        <>
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={String(project.id)}
                  project={project}
                  onEdit={() => openEditForm(project)}
                  onDelete={() => setShowDeleteConfirm(project.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first project</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-5 w-5 mr-2" />
                Create Project
              </Button>
            </div>
          )}
        </>
      )}

      {/* Project Form Modal */}
      <ProjectForm
        isOpen={showForm || !!editingProject}
        onClose={closeForm}
        onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
        project={editingProject}
        isLoading={isLoading}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Project</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this project? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteProject(showDeleteConfirm)}
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
}
