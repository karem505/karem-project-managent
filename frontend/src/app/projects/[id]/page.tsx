/**
 * Project Detail Page
 */
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProjectStore } from '@/lib/store/project-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { Loading } from '@/components/ui/loading';
import { ProjectForm } from '@/components/projects/project-form';
import { KanbanBoard } from '@/components/kanban/kanban-board';
import { GanttChart as GanttChartComponent } from '@/components/gantt/gantt-chart';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import {
  ArrowLeft,
  Edit,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  LayoutGrid,
  GanttChart,
  BarChart3,
  Settings,
} from 'lucide-react';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const { currentProject, isLoading, fetchProject, updateProject } = useProjectStore();
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
    }
  }, [projectId, fetchProject]);

  const handleUpdate = async (data: any) => {
    try {
      await updateProject(projectId, data);
      setShowEditForm(false);
    } catch (error) {
      // Error handled by store
    }
  };

  if (isLoading && !currentProject) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loading size="lg" />
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Project not found</h3>
        <Button onClick={() => router.push('/projects')}>Back to Projects</Button>
      </div>
    );
  }

  const costVariance = currentProject.cost_variance || 0;
  const progress = currentProject.progress_percentage || 0;

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutGrid className="h-4 w-4" />,
      content: (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Budget</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {formatCurrency(currentProject.budget)}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Actual Cost</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {formatCurrency(currentProject.actual_cost)}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Variance</p>
                    <p
                      className={`text-2xl font-bold mt-1 ${
                        costVariance >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {formatCurrency(Math.abs(costVariance))}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${costVariance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    <TrendingUp className={`h-6 w-6 ${costVariance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Progress</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{progress}%</p>
                  </div>
                  <div className="p-3 bg-primary-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Description</label>
                  <p className="text-gray-900 mt-1">{currentProject.description || 'No description'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Start Date</label>
                    <p className="text-gray-900 mt-1">{formatDate(currentProject.start_date, 'long')}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">End Date</label>
                    <p className="text-gray-900 mt-1">{formatDate(currentProject.end_date, 'long')}</p>
                  </div>
                </div>

                {currentProject.client && (
                  <div>
                    <label className="text-sm text-gray-600">Client</label>
                    <p className="text-gray-900 mt-1">{currentProject.client.name}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                {Array.isArray(currentProject.team_members) && currentProject.team_members.length > 0 ? (
                  <div className="space-y-3">
                    {currentProject.team_members.map((member) => (
                      <div key={String(member.id)} className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                          {member.full_name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{member.full_name}</p>
                          <p className="text-sm text-gray-500">{member.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No team members assigned</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: 'kanban',
      label: 'Kanban Board',
      icon: <LayoutGrid className="h-4 w-4" />,
      content: <KanbanBoard projectId={projectId} />,
    },
    {
      id: 'gantt',
      label: 'Gantt Chart',
      icon: <GanttChart className="h-4 w-4" />,
      content: <GanttChartComponent projectId={projectId} />,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="h-4 w-4" />,
      content: (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Analytics coming soon...</p>
          <p className="text-sm text-gray-400">This will display project analytics and reports</p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/projects')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{currentProject.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getStatusColor(currentProject.status)}>
                {currentProject.status.replace('_', ' ')}
              </Badge>
              {currentProject.client && (
                <span className="text-sm text-gray-500">
                  <Users className="inline h-4 w-4 mr-1" />
                  {currentProject.client.name}
                </span>
              )}
            </div>
          </div>
        </div>

        <Button onClick={() => setShowEditForm(true)}>
          <Edit className="h-5 w-5 mr-2" />
          Edit Project
        </Button>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-semibold text-gray-900">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-primary-600 h-3 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs tabs={tabs} defaultTab="overview" />

      {/* Edit Form Modal */}
      <ProjectForm
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSubmit={handleUpdate}
        project={currentProject}
        isLoading={isLoading}
      />
    </div>
  );
}
