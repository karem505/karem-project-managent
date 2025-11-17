/**
 * Dashboard Page - Enhanced with Data Visualization
 */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { analyticsAPI } from '@/lib/api/endpoints';
import type { DashboardData } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { formatCurrency, formatRelativeTime, getStatusColor } from '@/lib/utils';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertCircle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Plus,
  ArrowRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      const response = await analyticsAPI.getDashboard();
      setData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loading size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
        <p className="font-medium">Error loading dashboard</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const costVariance = data.financial.total_budget - data.financial.total_actual_cost;
  const costVariancePercent =
    data.financial.total_budget > 0
      ? ((costVariance / data.financial.total_budget) * 100).toFixed(1)
      : 0;

  // Prepare chart data
  const taskStatusData = [
    { name: 'Completed', value: data.tasks.completed, color: '#22c55e' },
    { name: 'In Progress', value: data.tasks.in_progress, color: '#3b82f6' },
    { name: 'Overdue', value: data.tasks.overdue, color: '#ef4444' },
    { name: 'Pending', value: data.tasks.total - data.tasks.completed - data.tasks.in_progress - data.tasks.overdue, color: '#94a3b8' },
  ];

  const projectStatusData = [
    { name: 'Planning', value: data.projects.planning || 0 },
    { name: 'Active', value: data.projects.active },
    { name: 'Completed', value: data.projects.completed || 0 },
    { name: 'On Hold', value: data.projects.on_hold || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's an overview of your projects and tasks.
          </p>
        </div>
        <Link href="/projects">
          <Button size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.projects.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.projects.active} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.tasks.in_progress}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.tasks.total} total tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.tasks.total > 0
                ? Math.round((data.tasks.completed / data.tasks.total) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.tasks.completed} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Status</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.financial.total_budget)}
            </div>
            <div className="flex items-center text-xs mt-1">
              {costVariance >= 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-success mr-1" />
                  <span className="text-success">Under budget</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 text-destructive mr-1" />
                  <span className="text-destructive">Over budget</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Task Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Task Distribution</CardTitle>
            <CardDescription>Overview of task status breakdown</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Project Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Projects by Status</CardTitle>
            <CardDescription>Distribution of project statuses</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectStatusData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Financial Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
          <CardDescription>Budget allocation and spending</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Budget</p>
              <p className="text-2xl font-bold">{formatCurrency(data.financial.total_budget)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Actual Cost</p>
              <p className="text-2xl font-bold">{formatCurrency(data.financial.total_actual_cost)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Variance</p>
              <p className={`text-2xl font-bold ${costVariance >= 0 ? 'text-success' : 'text-destructive'}`}>
                {costVariance >= 0 ? '+' : ''}{formatCurrency(costVariance)}
              </p>
              <p className="text-xs text-muted-foreground">
                {costVariancePercent}% {costVariance >= 0 ? 'under' : 'over'} budget
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Projects</CardTitle>
              <Link href="/projects">
                <Button variant="ghost" size="sm" className="gap-1">
                  View all
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {Array.isArray(data.recent_projects) && data.recent_projects.length > 0 ? (
              <div className="space-y-3">
                {data.recent_projects.map((project) => (
                  <Link
                    key={String(project.id)}
                    href={`/projects/${project.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{project.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatRelativeTime(project.created_at)}
                      </p>
                    </div>
                    <Badge variant="secondary" className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FolderKanban className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent projects</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Tasks</CardTitle>
              <Link href="/projects">
                <Button variant="ghost" size="sm" className="gap-1">
                  View all
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {Array.isArray(data.recent_tasks) && data.recent_tasks.length > 0 ? (
              <div className="space-y-3">
                {data.recent_tasks.map((task) => (
                  <div
                    key={String(task.id)}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{task.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {task.project} • {formatRelativeTime(task.created_at)}
                      </p>
                    </div>
                    <Badge variant="secondary" className={getStatusColor(task.status)}>
                      {task.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent tasks</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Overdue Tasks Alert */}
      {data.tasks.overdue > 0 && (
        <Card className="border-destructive">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">Attention Required</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              You have <strong>{data.tasks.overdue} overdue task{data.tasks.overdue !== 1 ? 's' : ''}</strong> that need immediate attention.
            </p>
            <Link href="/projects">
              <Button variant="destructive" size="sm" className="mt-3">
                View Overdue Tasks
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
