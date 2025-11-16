/**
 * Gantt Chart Component with DHTMLX Gantt
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import { gantt } from 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import { useTaskStore } from '@/lib/store/task-store';
import { Loading } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';
import type { Task } from '@/types';

interface GanttChartProps {
  projectId: string;
}

export const GanttChart: React.FC<GanttChartProps> = ({ projectId }) => {
  const ganttContainer = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [zoomLevel, setZoomLevel] = useState('day');

  const { fetchGanttData, isLoading, error } = useTaskStore();

  useEffect(() => {
    if (!ganttContainer.current || isInitialized) return;

    // Configure Gantt
    configureGantt();

    // Initialize Gantt
    gantt.init(ganttContainer.current);
    setIsInitialized(true);

    return () => {
      gantt.clearAll();
    };
  }, [isInitialized]);

  useEffect(() => {
    if (isInitialized && projectId) {
      loadGanttData();
    }
  }, [projectId, isInitialized]);

  const configureGantt = () => {
    // Basic configuration
    gantt.config.date_format = '%Y-%m-%d';
    gantt.config.scale_height = 90;
    gantt.config.row_height = 40;
    gantt.config.bar_height = 24;
    gantt.config.min_column_width = 50;
    gantt.config.auto_scheduling = true;
    gantt.config.auto_scheduling_strict = true;
    gantt.config.work_time = true;
    gantt.config.correct_work_time = true;

    // Enable drag and drop
    gantt.config.drag_progress = false;
    gantt.config.drag_resize = true;
    gantt.config.drag_links = true;
    gantt.config.drag_move = true;

    // Enable critical path
    gantt.config.highlight_critical_path = true;

    // Configure columns
    gantt.config.columns = [
      {
        name: 'text',
        label: 'Task Name',
        tree: true,
        width: 250,
        resize: true,
      },
      {
        name: 'start_date',
        label: 'Start Date',
        align: 'center',
        width: 100,
        resize: true,
      },
      {
        name: 'duration',
        label: 'Duration',
        align: 'center',
        width: 70,
        resize: true,
      },
      {
        name: 'progress',
        label: 'Progress',
        align: 'center',
        width: 80,
        template: (task: any) => {
          return Math.round(task.progress * 100) + '%';
        },
      },
      {
        name: 'add',
        label: '',
        width: 44,
      },
    ];

    // Configure time scale
    setTimeScale(zoomLevel);

    // Configure task template for critical path highlighting
    gantt.templates.task_class = function (start, end, task) {
      if (task.is_critical) {
        return 'critical-task';
      }
      return '';
    };

    // Configure link template for critical path
    gantt.templates.link_class = function (link) {
      const task = gantt.getTask(link.target);
      if (task.is_critical) {
        return 'critical-link';
      }
      return '';
    };

    // Add custom styling
    const style = document.createElement('style');
    style.innerHTML = `
      .gantt_task_line.critical-task {
        background-color: #ef4444 !important;
        border-color: #dc2626 !important;
      }
      .gantt_task_line.critical-task .gantt_task_progress {
        background-color: #991b1b !important;
      }
      .gantt_line.critical-link {
        background-color: #ef4444 !important;
      }
      .gantt_line.critical-link .gantt_link_arrow {
        border-color: #ef4444 !important;
      }
    `;
    document.head.appendChild(style);
  };

  const setTimeScale = (scale: string) => {
    switch (scale) {
      case 'hour':
        gantt.config.scales = [
          { unit: 'day', step: 1, format: '%d %M' },
          { unit: 'hour', step: 1, format: '%H' },
        ];
        break;
      case 'day':
        gantt.config.scales = [
          { unit: 'month', step: 1, format: '%F %Y' },
          { unit: 'day', step: 1, format: '%d' },
        ];
        break;
      case 'week':
        gantt.config.scales = [
          { unit: 'month', step: 1, format: '%F %Y' },
          { unit: 'week', step: 1, format: 'Week #%W' },
        ];
        break;
      case 'month':
        gantt.config.scales = [
          { unit: 'year', step: 1, format: '%Y' },
          { unit: 'month', step: 1, format: '%M' },
        ];
        break;
      default:
        gantt.config.scales = [
          { unit: 'month', step: 1, format: '%F %Y' },
          { unit: 'day', step: 1, format: '%d' },
        ];
    }
  };

  const loadGanttData = async () => {
    try {
      const data = await fetchGanttData(projectId);

      if (data && Array.isArray(data)) {
        // Transform tasks for Gantt
        const ganttTasks = {
          data: data.map((task: Task) => ({
            id: task.id,
            text: task.title,
            start_date: task.start_date,
            duration: task.duration || 1,
            progress: task.progress ? task.progress / 100 : 0,
            parent: task.parent || 0,
            is_critical: task.is_critical || false,
            slack: task.slack || 0,
          })),
          links: data
            .filter((task: Task) => task.dependencies && Array.isArray(task.dependencies) && task.dependencies.length > 0)
            .flatMap((task: Task) =>
              (task.dependencies || []).map((dep: any) => ({
                id: `${dep.predecessor}-${task.id}`,
                source: dep.predecessor,
                target: task.id,
                type: getLinkType(dep.dependency_type),
              }))
            ),
        };

        gantt.clearAll();
        gantt.parse(ganttTasks);
      }
    } catch (err) {
      console.error('Failed to load Gantt data:', err);
    }
  };

  const getLinkType = (type: string): string => {
    // DHTMLX Gantt link types:
    // "0" - Finish to Start
    // "1" - Start to Start
    // "2" - Finish to Finish
    // "3" - Start to Finish
    switch (type) {
      case 'FS':
        return '0';
      case 'SS':
        return '1';
      case 'FF':
        return '2';
      case 'SF':
        return '3';
      default:
        return '0';
    }
  };

  const handleZoomIn = () => {
    const levels = ['month', 'week', 'day', 'hour'];
    const currentIndex = levels.indexOf(zoomLevel);
    if (currentIndex < levels.length - 1) {
      const newLevel = levels[currentIndex + 1];
      setZoomLevel(newLevel);
      setTimeScale(newLevel);
      gantt.render();
    }
  };

  const handleZoomOut = () => {
    const levels = ['month', 'week', 'day', 'hour'];
    const currentIndex = levels.indexOf(zoomLevel);
    if (currentIndex > 0) {
      const newLevel = levels[currentIndex - 1];
      setZoomLevel(newLevel);
      setTimeScale(newLevel);
      gantt.render();
    }
  };

  const handleRefresh = () => {
    loadGanttData();
  };

  if (isLoading && !isInitialized) {
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Gantt Chart</h3>
        <div className="flex items-center gap-2">
          <Button onClick={handleZoomOut} size="sm" variant="outline" disabled={zoomLevel === 'month'}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button onClick={handleZoomIn} size="sm" variant="outline" disabled={zoomLevel === 'hour'}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button onClick={handleRefresh} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-blue-600 mt-0.5">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm text-blue-800 font-medium">
              Critical Path Highlighting Enabled
            </p>
            <p className="text-sm text-blue-700 mt-1">
              Tasks in red are on the critical path. Any delay in these tasks will delay the entire project.
            </p>
          </div>
        </div>
      </div>

      {/* Gantt Container */}
      <div
        ref={ganttContainer}
        className="bg-white border border-gray-200 rounded-lg overflow-hidden"
        style={{ width: '100%', height: '600px' }}
      />
    </div>
  );
};
