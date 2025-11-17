/**
 * Enhanced Gantt Chart Component with DHTMLX Gantt
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import { gantt } from 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import { useTaskStore } from '@/lib/store/task-store';
import { Loading } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Download,
  Filter,
  Calendar,
  Info,
  Maximize2,
} from 'lucide-react';
import type { Task } from '@/types';

interface GanttChartProps {
  projectId: string;
}

export const GanttChart: React.FC<GanttChartProps> = ({ projectId }) => {
  const ganttContainer = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [zoomLevel, setZoomLevel] = useState('day');
  const [showCriticalPath, setShowCriticalPath] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  useEffect(() => {
    if (isInitialized) {
      gantt.config.highlight_critical_path = showCriticalPath;
      gantt.render();
    }
  }, [showCriticalPath, isInitialized]);

  const configureGantt = () => {
    // Basic configuration with professional styling
    gantt.config.date_format = '%Y-%m-%d';
    gantt.config.scale_height = 56;
    gantt.config.row_height = 36;
    gantt.config.bar_height = 20;
    gantt.config.min_column_width = 60;
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
    gantt.config.highlight_critical_path = showCriticalPath;

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
          const progressPercent = Math.round(task.progress * 100);
          return `<span class="font-medium">${progressPercent}%</span>`;
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
      return 'normal-task';
    };

    // Configure link template for critical path
    gantt.templates.link_class = function (link) {
      const task = gantt.getTask(link.target);
      if (task.is_critical) {
        return 'critical-link';
      }
      return '';
    };

    // Professional styling with new color scheme
    const style = document.createElement('style');
    style.innerHTML = `
      /* Professional Gantt Styling */
      .gantt_container {
        font-family: inherit;
        border-radius: 0.75rem;
        overflow: hidden;
      }

      .gantt_grid_scale,
      .gantt_task_scale {
        background: hsl(var(--muted));
        border-bottom: 1px solid hsl(var(--border));
        font-weight: 600;
        color: hsl(var(--foreground));
      }

      .gantt_grid_data .gantt_row:nth-child(odd) {
        background: hsl(var(--background));
      }

      .gantt_grid_data .gantt_row:nth-child(even) {
        background: hsl(var(--muted) / 0.3);
      }

      .gantt_task .gantt_task_row:nth-child(odd) {
        background: hsl(var(--background));
      }

      .gantt_task .gantt_task_row:nth-child(even) {
        background: hsl(var(--muted) / 0.3);
      }

      /* Normal tasks - Professional blue */
      .gantt_task_line.normal-task {
        background: hsl(var(--primary));
        border: 1px solid hsl(var(--primary));
        border-radius: 4px;
      }

      .gantt_task_line.normal-task .gantt_task_progress {
        background: hsl(var(--primary) / 0.7);
      }

      /* Critical tasks - Professional red */
      .gantt_task_line.critical-task {
        background: hsl(var(--destructive)) !important;
        border: 1px solid hsl(var(--destructive)) !important;
        border-radius: 4px;
      }

      .gantt_task_line.critical-task .gantt_task_progress {
        background: hsl(var(--destructive) / 0.7) !important;
      }

      /* Critical path links */
      .gantt_line.critical-link {
        background-color: hsl(var(--destructive)) !important;
      }

      .gantt_line.critical-link .gantt_link_arrow {
        border-color: hsl(var(--destructive)) !important;
      }

      /* Hover effects */
      .gantt_task_line:hover {
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      }

      /* Grid lines */
      .gantt_grid_scale,
      .gantt_grid_data,
      .gantt_task_scale,
      .gantt_task_bg {
        border-color: hsl(var(--border));
      }

      .gantt_cell {
        border-color: hsl(var(--border));
      }

      /* Today marker */
      .gantt_marker {
        background-color: hsl(var(--primary)) !important;
        opacity: 0.3;
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

        // Add today marker
        const dateToStr = gantt.date.date_to_str(gantt.config.task_date);
        const markerId = gantt.addMarker({
          start_date: new Date(),
          css: 'today',
          text: 'Today',
          title: 'Today: ' + dateToStr(new Date()),
        });
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

  const handleExport = () => {
    if (typeof gantt.exportToPDF !== 'undefined') {
      gantt.exportToPDF();
    }
  };

  const toggleCriticalPath = () => {
    setShowCriticalPath(!showCriticalPath);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
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
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
        <p className="font-medium">Error loading Gantt chart</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <Card className={isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gantt Chart</CardTitle>
            <CardDescription>Visual timeline of project tasks and dependencies</CardDescription>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-2">
            <Button
              onClick={toggleCriticalPath}
              size="sm"
              variant={showCriticalPath ? 'default' : 'outline'}
            >
              <Filter className="h-4 w-4 mr-2" />
              Critical Path
            </Button>

            <div className="flex items-center border rounded-md">
              <Button
                onClick={handleZoomOut}
                size="sm"
                variant="ghost"
                disabled={zoomLevel === 'month'}
                className="rounded-r-none border-r"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <div className="px-3 py-1 text-sm font-medium min-w-[60px] text-center">
                {zoomLevel.charAt(0).toUpperCase() + zoomLevel.slice(1)}
              </div>
              <Button
                onClick={handleZoomIn}
                size="sm"
                variant="ghost"
                disabled={zoomLevel === 'hour'}
                className="rounded-l-none border-l"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>

            <Button onClick={handleRefresh} size="sm" variant="outline">
              <RefreshCw className="h-4 w-4" />
            </Button>

            <Button onClick={toggleFullscreen} size="sm" variant="outline">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Info Banner */}
        {showCriticalPath && (
          <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-primary">
                  Critical Path Analysis Enabled
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Tasks highlighted in red are on the critical path. Any delay in these tasks will impact the project deadline.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Gantt Container */}
        <div
          ref={ganttContainer}
          className="rounded-lg border overflow-hidden bg-card"
          style={{ width: '100%', height: isFullscreen ? 'calc(100vh - 200px)' : '600px' }}
        />
      </CardContent>
    </Card>
  );
};
