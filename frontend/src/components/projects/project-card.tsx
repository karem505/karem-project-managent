/**
 * Project Card Component
 */
'use client';

import Link from 'next/link';
import type { Project } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { Calendar, DollarSign, TrendingUp, Users, MoreVertical } from 'lucide-react';
import { useState } from 'react';

interface ProjectCardProps {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  const costVariance = project.cost_variance || 0;
  const progress = project.progress_percentage || 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <Link href={`/projects/${project.id}`} className="group">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                {project.name}
              </h3>
            </Link>
            {project.client && (
              <p className="text-sm text-gray-500 mt-1">
                <Users className="inline h-3 w-3 mr-1" />
                {project.client.name}
              </p>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <MoreVertical className="h-5 w-5 text-gray-500" />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  <button
                    onClick={() => {
                      onEdit();
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      onDelete();
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mb-4">
          <Badge className={getStatusColor(project.status)}>
            {project.status.replace('_', ' ')}
          </Badge>
        </div>

        {project.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="flex items-center text-xs text-gray-500 mb-1">
              <Calendar className="h-3 w-3 mr-1" />
              Start Date
            </div>
            <div className="text-sm font-medium">{formatDate(project.start_date)}</div>
          </div>

          <div>
            <div className="flex items-center text-xs text-gray-500 mb-1">
              <Calendar className="h-3 w-3 mr-1" />
              End Date
            </div>
            <div className="text-sm font-medium">{formatDate(project.end_date)}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="flex items-center text-xs text-gray-500 mb-1">
              <DollarSign className="h-3 w-3 mr-1" />
              Budget
            </div>
            <div className="text-sm font-medium">{formatCurrency(project.budget)}</div>
          </div>

          <div>
            <div className="flex items-center text-xs text-gray-500 mb-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              Variance
            </div>
            <div className={`text-sm font-medium ${costVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {costVariance >= 0 ? '+' : ''}{formatCurrency(costVariance)}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
