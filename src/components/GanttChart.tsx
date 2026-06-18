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
    if (task.startDate === '1970-01-01' || task.endDate === '1970-01-01') {
      return null;
    }

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
            {tasks.filter((t) => t.startDate !== '1970-01-01').length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">
                現在、期間予定のある工程は登録されていません。上の「工程追加」か下の未定項目にて日程をセットしてください。
              </div>
            ) : (
              tasks
                .filter((t) => t.startDate !== '1970-01-01')
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
                      <div className="p-3 pl-4 flex flex-col justify-center gap-1.5">
                        <div className="flex flex-wrap gap-1 items-center">
                          {task.category.split(',').map((cat) => (
                            <span key={cat} className="text-[9.5px] bg-slate-100 text-slate-650 px-1.5 py-0.5 rounded font-extrabold border border-slate-200">
                              {cat}
                            </span>
                          ))}
                          <span className="text-[10px] text-slate-400 font-bold font-mono ml-1">
                            {Math.round(task.progress)}%
                          </span>
                        </div>
                        <div className="font-extrabold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition truncate" title={task.title}>
                          {task.title}
                        </div>
                        <div className="text-[9px] text-slate-450 font-semibold font-mono">
                          {task.startDate.substring(5).replace('-', '/')} 〜 {task.endDate.substring(5).replace('-', '/')}
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

      {/* 📌 New Section: Undecided/TBD Tasks Magnet Board */}
      <div id="undecided-tasks-board" className="mt-6 pt-5 border-t border-slate-200">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <span className="p-1 px-1.5 text-xs bg-amber-100 text-amber-800 rounded-lg font-bold">📌 着手日未定</span>
            <h3 className="text-sm font-extrabold text-slate-850">
              日程未定項目・マグネットボード
            </h3>
            <span className="text-[10.5px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-205">
              {tasks.filter((t) => t.startDate === '1970-01-01').length} 件
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-bold hidden sm:block">
            ※ タップすると、日程（予定日）の割り当てや進捗状態の編集ができます。
          </p>
        </div>

        {tasks.filter((t) => t.startDate === '1970-01-01').length === 0 ? (
          <div className="bg-slate-50 rounded-xl p-5 text-center text-xs text-slate-400 border border-dashed border-slate-200">
            着手日未定に登録された工程はありません。「工程追加」または既存工程の編集から「着手日未定」にチェックを入れてこちらに仮置きできます。
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {tasks
              .filter((t) => t.startDate === '1970-01-01')
              .sort((a, b) => a.order - b.order)
              .map((undecidedTask) => {
                const statusConfig: Record<TaskStatus, { label: string; text: string; bg: string; border: string }> = {
                  not_started: { label: '未着手', text: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200' },
                  in_progress: { label: '着手中', text: 'text-blue-600', bg: 'bg-blue-50/60', border: 'border-blue-200' },
                  completed: { label: '完了', text: 'text-emerald-700', bg: 'bg-emerald-50/60', border: 'border-emerald-200' },
                  delayed: { label: '調整中', text: 'text-rose-600', bg: 'bg-rose-50/60 border-rose-200', border: 'border-rose-450' },
                };
                const config = statusConfig[undecidedTask.status];

                return (
                  <div
                    key={undecidedTask.id}
                    onClick={() => onEditTask(undecidedTask)}
                    className="group bg-amber-50/20 hover:bg-amber-50/40 border-2 border-dashed border-amber-200 hover:border-amber-300 rounded-xl p-3.5 cursor-pointer shadow-sm transition hover:scale-[1.01] active:scale-95 flex flex-col justify-between min-h-[115px]"
                  >
                    <div>
                      {/* Categories row */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {undecidedTask.category.split(',').map((cat) => (
                          <span key={cat} className="text-[9px] bg-white border border-amber-200 text-amber-800 font-extrabold px-1.5 py-0.5 rounded">
                            {cat}
                          </span>
                        ))}
                      </div>
                      
                      {/* Title */}
                      <h4 className="text-xs font-extrabold text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition mb-2">
                        {undecidedTask.title}
                      </h4>
                    </div>

                    {/* Footer assignees & info */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100/60 text-[10px] text-slate-400">
                      <div className="flex items-center gap-1">
                        <div className="flex -space-x-1.5">
                          {undecidedTask.assignees.length === 0 ? (
                            <span className="w-4 h-4 rounded-full border border-slate-200 bg-white text-slate-400 flex items-center justify-center text-[8px] font-bold">
                              未
                            </span>
                          ) : (
                            undecidedTask.assignees.map((aId) => (
                              <div
                                key={aId}
                                className={`w-4.5 h-4.5 rounded-full text-white font-black flex items-center justify-center text-[7.5px] border border-white uppercase ${getMemberColor(aId)}`}
                                title={getMemberName(aId)}
                              >
                                {getMemberInitials(aId)}
                              </div>
                            ))
                          )}
                        </div>
                        {undecidedTask.assignees.length > 0 && (
                          <span className="text-[9px] text-slate-500 font-bold truncate max-w-[60px]">
                            {getMemberName(undecidedTask.assignees[0]).split(' ')[0]}
                          </span>
                        )}
                      </div>

                      <span className={`px-1.5 py-0.5 text-[9px] font-extrabold rounded-md border ${config.bg} ${config.text} ${config.border}`}>
                        {undecidedTask.status === 'in_progress' ? `${undecidedTask.progress}%` : config.label}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};
