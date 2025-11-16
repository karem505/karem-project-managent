/**
 * Task Card Component for Kanban Board
 */
'use client';

import type { Task } from '@/types';
import { Badge } from '@/components/ui/badge';
import { getStatusColor, getPriorityIcon, formatDate } from '@/lib/utils';
import { Calendar, Clock, MoreVertical } from 'lucide-react';
import { useState } from 'react';

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onClick?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onClick }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
            {task.title}
          </h4>
        </div>

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="h-4 w-4 text-gray-500" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                }}
              />
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
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

      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center gap-2 mb-3">
        <Badge className={getStatusColor(task.priority)} variant="default">
          {getPriorityIcon(task.priority)} {task.priority}
        </Badge>

        {task.is_critical && (
          <Badge variant="danger" className="text-xs">
            Critical Path
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatDate(task.end_date)}
        </div>

        {task.estimated_hours > 0 && (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {task.estimated_hours}h
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>Progress</span>
          <span className="font-medium">{task.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-primary-600 h-1.5 rounded-full transition-all"
            style={{ width: `${task.progress}%` }}
          />
        </div>
      </div>

      {/* Assigned members (if any) */}
      {task.assigned_to_list && task.assigned_to_list.length > 0 && (
        <div className="mt-3 flex items-center gap-1">
          {task.assigned_to_list.slice(0, 3).map((member) => (
            <div
              key={member.id}
              className="h-6 w-6 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-medium"
              title={member.full_name}
            >
              {member.full_name[0]}
            </div>
          ))}
          {task.assigned_to_list.length > 3 && (
            <div className="h-6 w-6 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium">
              +{task.assigned_to_list.length - 3}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
