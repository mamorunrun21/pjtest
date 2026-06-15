/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { Task, Member, TaskStatus } from '../types.js';
import { getDatesInRange, getDaysCount, formatJapaneseDateWithDay, isTodayStr } from '../utils/dateHelpers.js';
import { Calendar, UserPlus, ChevronLeft, ChevronRight, Plus, HelpCircle } from 'lucide-react';

interface GanttChartProps {
  tasks: Task[];
  members: Member[];
  onEditTask: (task: Task) => void;
  onAddTask: () => void;
}

export const GanttChart: React.FC<GanttChartProps> = ({
  tasks,
  members,
  onEditTask,
  onAddTask,
}) => {
  // Set start of timeline visualization (by default June 8th, 2026 for construction demo)
  const [timelineStart, setTimelineStart] = useState<string>('2026-06-08');
  const [timelineEnd, setTimelineEnd] = useState<string>('2026-07-05');

  const timelineContainerRef = useRef<HTMLDivElement>(null);

  // Generate date columns
  const dateColumns = useMemo(() => {
    return getDatesInRange(timelineStart, timelineEnd);
  }, [timelineStart, timelineEnd]);

  // Status mapping
  const statusLabels: Record<TaskStatus, { label: string; textClass: string; bgClass: string; borderClass: string }> = {
    not_started: { label: '未着手', textClass: 'text-slate-500', bgClass: 'bg-slate-100', borderClass: 'border-slate-300' },
    in_progress: { label: '着手中', textClass: 'text-blue-600 font-bold', bgClass: 'bg-blue-50', borderClass: 'border-blue-400' },
    completed: { label: '完了', textClass: 'text-emerald-700 font-bold', bgClass: 'bg-emerald-50 border-emerald-200', borderClass: 'border-emerald-500' },
    delayed: { label: '遅れ発生', textClass: 'text-rose-600 font-bold', bgClass: 'bg-rose-50 border-rose-200 animate-pulse', borderClass: 'border-rose-500' },
  };

  const getMemberInitials = (id: string) => {
    const member = members.find((m) => m.id === id);
    if (!member) return '未';
    return member.name.trim().substring(0, 2);
  };

  const getMemberColor = (id: string) => {
    const member = members.find((m) => m.id === id);
    return member ? member.color : 'bg-slate-500';
  };

  const getMemberName = (id: string) => {
    const member = members.find((m) => m.id === id);
    return member ? member.name : '不明';
  };

  // Adjust dates helper to shift timeline window
  const shiftTimeline = (days: number) => {
    const shiftDate = (dateStr: string, amount: number) => {
      const d = new Date(dateStr);
      d.setDate(d.getDate() + amount);
      return d.toISOString().split('T')[0];
    };
    setTimelineStart((prev) => shiftDate(prev, days));
    setTimelineEnd((prev) => shiftDate(prev, days));
  };

  // Check overlap helper to place bar
  const calculateTaskSpan = (task: Task) => {
    const startIndex = dateColumns.indexOf(task.startDate);
    const endIndex = dateColumns.indexOf(task.endDate);

    // If starts before our current timeline view
    let startCell = startIndex;
    let overflowLeft = false;
    if (startIndex === -1) {
      if (new Date(task.startDate) < new Date(timelineStart)) {
        startCell = 0;
        overflowLeft = true;
      } else {
        return null; // outside range entirely on right
      }
    }

    // If ends after our current timeline view
    let endCell = endIndex;
    let overflowRight = false;
    if (endIndex === -1) {
      if (new Date(task.endDate) > new Date(timelineEnd)) {
        endCell = dateColumns.length - 1;
        overflowRight = true;
      } else {
        return null; // outside range entirely on left
      }
    }

    const span = endCell - startCell + 1;

    return {
      startCell,
      span,
      overflowLeft,
      overflowRight,
    };
  };

  return (
    <div id="gantt-board-root" className="bg-white rounded-xl border border-slate-200 p-5 mb-6 overflow-hidden">
      {/* Chart Control Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 mb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-1.5">
            <Calendar className="w-5 h-5 text-blue-500" />
            マグネット式工程表 (ガントチャート)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            現場監督や事務所で全体俯瞰するビジュアル工程表。各タスクをタップして詳細確認・編集ができます。
          </p>
        </div>

        {/* Pan Controls / Date Range Header */}
        <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 gap-1">
            <button
              onClick={() => shiftTimeline(-7)}
              className="p-1.5 hover:bg-white rounded-lg text-slate-500 hover:text-slate-800 transition active:scale-90"
              title="1週間戻る"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold px-2 font-mono text-slate-700">
              {timelineStart.substring(5)} 〜 {timelineEnd.substring(5)}
            </span>
            <button
              onClick={() => shiftTimeline(7)}
              className="p-1.5 hover:bg-white rounded-lg text-slate-500 hover:text-slate-800 transition active:scale-90"
              title="1週間進む"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onAddTask}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-sm cursor-pointer transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>工程追加</span>
          </button>
        </div>
      </div>

      {/* Gantt Container with double scrolls inside wrapper */}
      <div className="overflow-x-auto custom-scrollbar border border-slate-150 rounded-xl" ref={timelineContainerRef}>
        <div className="min-w-[900px] bg-slate-50/50">
          {/* Timeline Grids Header */}
          <div className="grid grid-cols-[200px_100px_1fr] border-b border-slate-200 text-center font-bold text-xs bg-slate-100 text-slate-600 divide-x divide-slate-200">
            <div className="p-3 text-left pl-4">工程名 / 工種</div>
            <div className="p-3">担当者・技能</div>
            <div className="grid overflow-hidden" style={{ gridTemplateColumns: `repeat(${dateColumns.length}, minmax(0, 1fr))` }}>
              {dateColumns.map((date) => {
                const isToday = isTodayStr(date);
                const isSat = new Date(date).getDay() === 6;
                const isSun = new Date(date).getDay() === 0;
                
                let dayBg = 'bg-transparent';
                if (isToday) dayBg = 'bg-amber-100 font-extrabold text-amber-700 border-b-2 border-b-amber-500';
                else if (isSat) dayBg = 'bg-blue-50/70 text-blue-600';
                else if (isSun) dayBg = 'bg-rose-50/70 text-rose-600';

                return (
                  <div key={date} className={`p-1.5 text-[10px] flex flex-col justify-center items-center h-12 leading-tight select-none border-r border-slate-200/50 last:border-0 ${dayBg}`}>
                    <span className="opacity-70">{date.substring(8)}</span>
                    <span className="text-[9px] font-semibold">
                      {['日', '月', '火', '水', '木', '金', '土'][new Date(date).getDay()]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rows of tasks */}
          <div className="divide-y divide-slate-150 bg-white">
            {tasks.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">
                工程が登録されていません。「工程追加」ボタンから最初の工程を設置してください。
              </div>
            ) : (
              tasks
                .sort((a, b) => a.order - b.order)
                .map((task) => {
                  const spanInfo = calculateTaskSpan(task);

                  return (
                    <div
                      key={task.id}
                      onClick={() => onEditTask(task)}
                      className="grid grid-cols-[200px_100px_1fr] leading-none text-xs hover:bg-slate-50/60 divide-x divide-slate-100 group transition-all duration-300 relative cursor-pointer"
                    >
                      {/* Task Info Cell */}
                      <div className="p-3 pl-4 flex flex-col justify-center gap-1">
                        <div className="inline-flex items-center gap-1">
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono font-medium border border-slate-250">
                            {task.category}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium font-mono">
                            {Math.round(task.progress)}%
                          </span>
                        </div>
                        <div className="font-semibold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition truncate" title={task.title}>
                          {task.title}
                        </div>
                        <div className="text-[9px] text-slate-400">
                          {task.startDate.substring(5)} 〜 {task.endDate.substring(5)}
                        </div>
                      </div>

                      {/* Primary Assignee Status Column */}
                      <div className="p-2 flex flex-col items-center justify-center gap-1 text-center">
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {task.assignees.length === 0 ? (
                            <span className="w-5 h-5 rounded-full border border-slate-200 bg-slate-100 text-slate-400 flex items-center justify-center text-[9px] font-bold">
                              未
                            </span>
                          ) : (
                            task.assignees.map((aId) => (
                              <div
                                key={aId}
                                className={`w-6 h-6 rounded-full text-white font-extrabold flex items-center justify-center text-[9px] border-2 border-white uppercase shadow-sm ${getMemberColor(aId)}`}
                                title={`${getMemberName(aId)}`}
                              >
                                {getMemberInitials(aId)}
                              </div>
                            ))
                          )}
                        </div>
                        <span className="text-[9px] text-slate-400 font-medium truncate max-w-[80px]">
                          {task.assignees.map((aId) => getMemberName(aId).split(' ')[0]).join(', ') || '未設定'}
                        </span>
                      </div>

                      {/* Timeline cells with absolute overlay bar */}
                      <div className="relative h-14 w-full grid" style={{ gridTemplateColumns: `repeat(${dateColumns.length}, minmax(0, 1fr))` }}>
                        {/* Render vertical dotted column lines matching days */}
                        {dateColumns.map((date) => (
                          <div
                            key={`grid-${task.id}-${date}`}
                            className={`border-r border-slate-100/75 last:border-0 h-full w-full ${isTodayStr(date) ? 'bg-amber-50/20' : ''}`}
                          />
                        ))}

                        {/* Render task bar in grid offset */}
                        {spanInfo && (
                          <div
                            className="absolute top-1/2 -translate-y-1/2 h-8 rounded-lg flex items-center select-none font-bold"
                            style={{
                              gridColumnStart: spanInfo.startCell + 1,
                              gridColumnEnd: `span ${spanInfo.span}`,
                              left: '3px',
                              right: '3px',
                            }}
                          >
                            {/* Visual background container matching state */}
                            <div
                              className={`w-full h-full relative rounded-lg border-2 flex items-center shadow-sm overflow-hidden p-1.5 transition-all group-hover:scale-[1.01] ${statusLabels[task.status].bgClass} ${statusLabels[task.status].borderClass}`}
                            >
                              {/* Left & Right overflows */}
                              {spanInfo.overflowLeft && (
                                <span className="absolute left-0 top-0 bottom-0 flex items-center justify-center text-[10px] text-slate-400 bg-slate-100/85 border-r border-slate-200 px-0.5 z-10 select-none">
                                  ◀
                                </span>
                              )}
                              {spanInfo.overflowRight && (
                                <span className="absolute right-0 top-0 bottom-0 flex items-center justify-center text-[10px] text-slate-400 bg-slate-100/85 border-l border-slate-200 px-0.5 z-10 select-none">
                                  ▶
                                </span>
                              )}

                              {/* Progress bar fill layer (only for in_progress status and partially complete) */}
                              {task.status === 'in_progress' && (
                                <div
                                  className="absolute left-0 top-0 bottom-0 bg-blue-500/25 transition-all duration-300 pointer-events-none"
                                  style={{ width: `${task.progress}%` }}
                                />
                              )}
                              {task.status === 'completed' && (
                                <div className="absolute left-0 top-0 bottom-0 bg-emerald-500/15 transition-all duration-300 pointer-events-none w-full" />
                              )}

                              {/* Text layout inner bar */}
                              <div className="flex items-center justify-between w-full h-full z-10 px-1">
                                <span className="text-[10px] font-extrabold text-slate-700 truncate block">
                                  {task.title}
                                </span>
                                
                                <span className={`text-[9px] font-extrabold px-1 py-0.5 rounded ${statusLabels[task.status].textClass}`}>
                                  {task.status === 'in_progress' ? `${Math.round(task.progress)}%` : statusLabels[task.status].label}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }))}
          </div>
        </div>
      </div>
    </div>
  );
};
