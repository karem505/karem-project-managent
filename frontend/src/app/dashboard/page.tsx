/**
 * Dashboard Page
 */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { analyticsAPI } from '@/lib/api/endpoints';
import type { DashboardData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/ui/loading';
import { formatCurrency, formatRelativeTime, getStatusColor } from '@/lib/utils';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Users,
} from 'lucide-react';

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
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    {
      title: 'Total Projects',
      value: data.projects.total,
      icon: FolderKanban,
      color: 'text-accent-600',
      bgColor: 'bg-accent-50',
    },
    {
      title: 'Active Projects',
      value: data.projects.active,
      icon: Clock,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      title: 'Completed Tasks',
      value: data.tasks.completed,
      icon: CheckCircle2,
      color: 'text-success-600',
      bgColor: 'bg-success-50',
    },
    {
      title: 'Overdue Tasks',
      value: data.tasks.overdue,
      icon: AlertCircle,
      color: 'text-destructive-600',
      bgColor: 'bg-destructive-50',
    },
  ];

  const costVariance = data.financial.total_budget - data.financial.total_actual_cost;
  const costVariancePercent =
    data.financial.total_budget > 0
      ? ((costVariance / data.financial.total_budget) * 100).toFixed(1)
      : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Welcome back! Here's what's happening with your projects.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="elevation-2 hover:elevation-3 transition-elevation border-0 overflow-hidden group animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-foreground group-hover:scale-105 transition-transform">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-4 rounded-2xl ${stat.bgColor} group-hover:scale-110 transition-all duration-300`}>
                    <Icon className={`h-7 w-7 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="elevation-2 border-0 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-accent-50">
                <DollarSign className="h-5 w-5 text-accent-600" />
              </div>
              <CardTitle className="text-xl">Financial Overview</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-primary-700">Total Budget</span>
                  <span className="text-xl font-bold text-primary-900">
                    {formatCurrency(data.financial.total_budget)}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-secondary-50 to-secondary-100/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-secondary-700">Actual Cost</span>
                  <span className="text-xl font-bold text-secondary-900">
                    {formatCurrency(data.financial.total_actual_cost)}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className={`h-5 w-5 ${costVariance >= 0 ? 'text-success-600' : 'text-destructive-600'}`} />
                    <span className="text-sm font-medium text-foreground">Cost Variance</span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xl font-bold ${
                        costVariance >= 0 ? 'text-success-600' : 'text-destructive-600'
                      }`}
                    >
                      {formatCurrency(Math.abs(costVariance))}
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {costVariance >= 0 ? 'Under' : 'Over'} budget by {costVariancePercent}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="elevation-2 border-0 animate-slide-up" style={{ animationDelay: '250ms' }}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary-50">
                <CheckCircle2 className="h-5 w-5 text-primary-600" />
              </div>
              <CardTitle className="text-xl">Task Overview</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <span className="text-sm font-medium text-muted-foreground">Total Tasks</span>
                <span className="text-lg font-bold text-foreground">{data.tasks.total}</span>
              </div>
              <div className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-success-50/50 transition-colors">
                <span className="text-sm font-medium text-muted-foreground">Completed</span>
                <Badge className="bg-success-100 text-success-700 hover:bg-success-200 border-success-200">
                  {data.tasks.completed}
                </Badge>
              </div>
              <div className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-accent-50/50 transition-colors">
                <span className="text-sm font-medium text-muted-foreground">In Progress</span>
                <Badge className="bg-accent-100 text-accent-700 hover:bg-accent-200 border-accent-200">
                  {data.tasks.in_progress}
                </Badge>
              </div>
              <div className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-destructive-50/50 transition-colors">
                <span className="text-sm font-medium text-muted-foreground">Overdue</span>
                <Badge className="bg-destructive-100 text-destructive-700 hover:bg-destructive-200 border-destructive-200">
                  {data.tasks.overdue}
                </Badge>
              </div>
              <div className="pt-3 mt-2 border-t border-border">
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-sm font-medium text-foreground">Completion Rate</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-success-500 transition-all duration-500"
                        style={{
                          width: `${data.tasks.total > 0 ? (data.tasks.completed / data.tasks.total) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-lg font-bold text-primary-600 min-w-[3rem] text-right">
                      {data.tasks.total > 0
                        ? Math.round((data.tasks.completed / data.tasks.total) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="elevation-2 border-0 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary-50">
                  <FolderKanban className="h-5 w-5 text-primary-600" />
                </div>
                <CardTitle className="text-xl">Recent Projects</CardTitle>
              </div>
              <Link
                href="/projects"
                className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors flex items-center gap-1 group"
              >
                View all
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {Array.isArray(data.recent_projects) && data.recent_projects.length > 0 ? (
              <div className="space-y-2">
                {data.recent_projects.map((project) => (
                  <Link
                    key={String(project.id)}
                    href={`/projects/${project.id}`}
                    className="block p-4 rounded-xl hover:bg-muted/50 transition-all duration-200 hover:elevation-1 group"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground group-hover:text-primary-600 transition-colors truncate">
                          {project.name}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatRelativeTime(project.created_at)}
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(project.status)} shrink-0`}>
                        {project.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FolderKanban className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No recent projects</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="elevation-2 border-0 animate-slide-up" style={{ animationDelay: '350ms' }}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-accent-50">
                  <CheckCircle2 className="h-5 w-5 text-accent-600" />
                </div>
                <CardTitle className="text-xl">Recent Tasks</CardTitle>
              </div>
              <Link
                href="/projects"
                className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors flex items-center gap-1 group"
              >
                View all
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {Array.isArray(data.recent_tasks) && data.recent_tasks.length > 0 ? (
              <div className="space-y-2">
                {data.recent_tasks.map((task) => (
                  <div
                    key={String(task.id)}
                    className="p-4 rounded-xl hover:bg-muted/50 transition-all duration-200 hover:elevation-1 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground group-hover:text-primary-600 transition-colors">
                          {task.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {task.project} • {formatRelativeTime(task.created_at)}
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(task.status)} shrink-0`}>
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No recent tasks</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
