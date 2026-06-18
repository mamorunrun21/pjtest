/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Task, Member, TaskStatus } from '../types.js';
import { formatJapaneseDateWithDay, relativeTimeJapanese } from '../utils/dateHelpers.js';
import { Phone, CheckCircle2, Circle, AlertTriangle, Play, ChevronRight, User, HelpCircle, Edit } from 'lucide-react';

interface MobileTaskListProps {
  tasks: Task[];
  members: Member[];
  onUpdateStatus: (taskId: string, progress: number, status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
}

export const MobileTaskList: React.FC<MobileTaskListProps> = ({
  tasks,
  members,
  onUpdateStatus,
  onEditTask,
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getMember = (id: string): Member | undefined => {
    return members.find((m) => m.id === id);
  };

  const getMemberInitials = (id: string) => {
    const m = getMember(id);
    return m ? m.name.substring(0, 2) : '未';
  };

  // Filter tasks based on filters selected
  const filteredTasks = tasks
    .sort((a, b) => a.order - b.order)
    .filter((task) => {
      // Member Filter
      if (selectedMemberId !== 'all') {
        if (!task.assignees.includes(selectedMemberId)) return false;
      }
      // Status Filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'active' && (task.status === 'completed' || task.status === 'not_started')) return false;
        if (statusFilter === 'not_completed' && task.status === 'completed') return false;
        if (statusFilter === 'delayed' && task.status !== 'delayed') return false;
      }
      return true;
    });

  // Tap handlers for simple, instant updates from field workers
  const handleQuickComplete = (task: Task) => {
    onUpdateStatus(task.id, 100, 'completed');
  };

  const handleQuickStart = (task: Task) => {
    onUpdateStatus(task.id, 20, 'in_progress');
  };

  const handleIncrementProgress = (task: Task, amount: number) => {
    const nextProgress = Math.min(100, Math.max(0, task.progress + amount));
    const nextStatus = nextProgress === 100 ? 'completed' : 'in_progress';
    onUpdateStatus(task.id, nextProgress, nextStatus);
  };

  return (
    <div id="mobile-task-list-root" className="block md:hidden space-y-4">
      {/* 🔴 Mobile Friendly Sticky Filter Section */}
      <div className="bg-slate-950 text-white p-4 rounded-xl space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold tracking-wider text-slate-300 uppercase">
            📱 現場スマホ専用パネル
          </span>
          <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded">
            かんたん3秒タップ更新
          </span>
        </div>

        {/* Member Selector: simulates "Whose screen is this?" */}
        <div className="space-y-1.5">
          <label className="text-xs text-slate-300 font-bold block">
            だれが作業していますか？ (担当者で絞り込み)
          </label>
          <div className="flex items-center gap-2">
            <div className="relative w-full">
              <select
                id="mobile-member-filter"
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full bg-slate-850 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">全員の工程を表示 ({tasks.length}件)</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    【{m.role}】{m.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                ▼
              </div>
            </div>
          </div>
        </div>

        {/* State filters */}
        <div className="grid grid-cols-4 gap-1">
          <button
            onClick={() => setStatusFilter('all')}
            className={`py-1.5 px-2 rounded text-[11px] font-bold text-center transition ${statusFilter === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            全工程
          </button>
          <button
            onClick={() => setStatusFilter('not_completed')}
            className={`py-1.5 px-2 rounded text-[11px] font-bold text-center transition ${statusFilter === 'not_completed' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            未完了
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`py-1.5 px-2 rounded text-[11px] font-bold text-center transition ${statusFilter === 'active' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            進行中
          </button>
          <button
            onClick={() => setStatusFilter('delayed')}
            className={`py-1.5 px-2 rounded text-[11px] font-bold text-center transition ${statusFilter === 'delayed' ? 'bg-rose-600 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            遅れ🔥
          </button>
        </div>
      </div>

      {/* 🟢 Mobile Tasks Stack */}
      <div id="mobile-tasks-stack" className="space-y-3.5">
        {filteredTasks.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-sm">
            該当する工程が見つかりません。
          </div>
        ) : (
          filteredTasks.map((task) => {
            const statusConfig: Record<TaskStatus, { label: string; bg: string; text: string; border: string }> = {
              not_started: { label: '未着手', bg: 'bg-slate-150', text: 'text-slate-500', border: 'border-slate-200' },
              in_progress: { label: '着手中', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-150' },
              completed: { label: '完了済', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-150' },
              delayed: { label: '調整・遅れ', bg: 'bg-rose-50 animate-pulse', text: 'text-rose-600', border: 'border-rose-150' },
            };

            const config = statusConfig[task.status];

            return (
              <div
                key={task.id}
                className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 relative overflow-hidden"
              >
                {/* Visual marker ribbon based on status */}
                <div className={`absolute top-0 left-0 bottom-0 w-1 ${task.status === 'completed' ? 'bg-emerald-500' : task.status === 'delayed' ? 'bg-red-500' : task.status === 'in_progress' ? 'bg-blue-500' : 'bg-slate-350'}`} />

                {/* Card Top: Details, Date, Assignees */}
                <div className="pl-1.5 font-sans">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex flex-wrap gap-1 max-w-[170px]">
                      {task.category.split(',').map((cat) => (
                        <span key={cat} className="text-[9.5px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-850 select-none">
                          {cat}
                        </span>
                      ))}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${config.bg} ${config.text} ${config.border} shrink-0`}>
                      {config.label} ({task.progress}%)
                    </span>
                  </div>

                  {/* Task Main Title */}
                  <h3 className="text-sm font-extrabold text-slate-800 mt-2 leading-snug">
                    {task.title}
                  </h3>

                  {/* Dates Banner or Undecided banner */}
                  {task.startDate === '1970-01-01' ? (
                    <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-amber-700/90 mt-1 bg-amber-50/70 border border-amber-200/50 p-1 px-2 rounded-lg w-fit">
                      <span>📌</span>
                      <span>着手日未定 (日程未定項目)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[11px] text-slate-505 font-medium mt-1">
                      <span className="font-bold text-blue-600">
                        {formatJapaneseDateWithDay(task.startDate)}
                      </span>
                      <span className="font-bold text-slate-400">〜</span>
                      <span className="font-bold text-blue-600">
                        {formatJapaneseDateWithDay(task.endDate)}
                      </span>
                    </div>
                  )}

                  {/* Assignee badges layout with Call shortcuts */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className="flex -space-x-1.5">
                        {task.assignees.map((aId) => {
                          const m_info = getMember(aId);
                          return (
                            <div
                              key={aId}
                              className={`w-5 h-5 rounded-full text-white font-extrabold text-[8px] flex items-center justify-center border border-white ${m_info?.color || 'bg-slate-400'}`}
                            >
                              {getMemberInitials(aId)}
                            </div>
                          );
                        })}
                      </div>
                      <span className="text-xs text-slate-600 font-bold">
                        {task.assignees.map((aId) => getMember(aId)?.name.split(' ')[0]).join(', ') || '未指定'}
                      </span>
                    </div>

                    {/* Team Members Telephone Contacts */}
                    <div className="flex gap-1.5">
                      {task.assignees.map((aId) => {
                        const m = getMember(aId);
                        if (!m || !m.phone) return null;
                        return (
                          <a
                            key={`phone-${aId}`}
                            href={`tel:${m.phone}`}
                            className="bg-sky-50 border border-sky-200/80 text-sky-600 p-1 rounded-full flex items-center justify-center hover:bg-sky-100 transition active:scale-90"
                            title={`${m.name}に電話をかける`}
                          >
                            <Phone className="w-3 h-3" />
                          </a>
                        );
                      })}
                    </div>
                  </div>

                  {/* Task notes helper if present */}
                  {task.notes && (
                    <div className="bg-slate-50 rounded-lg p-2.5 text-[11px] text-slate-500 mt-2 border border-slate-100">
                      <span className="font-bold text-slate-600">現場メモ: </span>
                      {task.notes}
                    </div>
                  )}
                </div>

                {/* Card Bottom: Tactile Buttons specifically for fat fingers on mobile */}
                <div className="pl-1.5 pt-2.5 border-t border-slate-100 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">
                      ワンタップ進捗変更
                    </span>
                    <button
                      onClick={() => onEditTask(task)}
                      className="text-xs font-bold text-slate-500 flex items-center gap-1 bg-slate-50 hover:bg-slate-100 px-2 py-1 rounded-lg border border-slate-200"
                    >
                      <Edit className="w-3 h-3" />
                      詳細編集
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {task.status !== 'in_progress' && task.status !== 'completed' ? (
                      <button
                        onClick={() => handleQuickStart(task)}
                        className="col-span-1 py-2 px-1 text-center font-bold text-xs bg-blue-50 border border-blue-200 text-blue-600 rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                      >
                        <Play className="w-3 h-3 shrink-0" />
                        <span>作業開始</span>
                      </button>
                    ) : (
                      <div className="col-span-1 grid grid-cols-2 gap-1">
                        <button
                          onClick={() => handleIncrementProgress(task, -20)}
                          className="py-2 text-center font-extrabold text-xs bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl active:scale-95 transition-all cursor-pointer"
                        >
                          -20%
                        </button>
                        <button
                          onClick={() => handleIncrementProgress(task, 20)}
                          className="py-2 text-center font-extrabold text-xs bg-blue-50 border border-blue-250 text-blue-600 hover:bg-blue-100 rounded-xl active:scale-95 transition-all cursor-pointer"
                        >
                          +20%
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => onUpdateStatus(task.id, task.progress, 'delayed')}
                      className={`col-span-1 py-1 px-1 text-center font-extrabold text-xs rounded-xl flex flex-col justify-center items-center gap-0.5 active:scale-95 transition-all cursor-pointer border ${task.status === 'delayed' ? 'bg-red-600 text-white border-red-600' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'}`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>調整・遅れ</span>
                    </button>

                    <button
                      onClick={() => handleQuickComplete(task)}
                      className={`col-span-1 py-1 px-1 text-center font-extrabold text-xs rounded-xl flex flex-col justify-center items-center gap-0.5 active:scale-95 transition-all cursor-pointer border ${task.status === 'completed' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'}`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>100% 完了</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
