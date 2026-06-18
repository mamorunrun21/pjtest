/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Task, Member, UpdateLog } from '../types.js';
import { relativeTimeJapanese, formatJapaneseDateWithDay } from '../utils/dateHelpers.js';
import { ListTodo, CheckCircle2, AlertTriangle, Play, RefreshCw, Clock } from 'lucide-react';

interface DashboardStatsProps {
  tasks: Task[];
  members: Member[];
  logs: UpdateLog[];
  onRefresh: () => void;
  onClearLogs: () => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  tasks,
  members,
  logs,
  onRefresh,
  onClearLogs,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Statistics Calculations
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const delayedTasks = tasks.filter((t) => t.status === 'delayed').length;
  const notStartedTasks = tasks.filter((t) => t.status === 'not_started').length;

  const getMemberName = (id: string) => {
    return members.find((m) => m.id === id)?.name || '未指定';
  };

  const getMemberInitials = (id: string) => {
    const name = getMemberName(id);
    return name.split(' ').join('').substring(0, 2);
  };

  const getMemberColor = (id: string) => {
    return members.find((m) => m.id === id)?.color || 'bg-slate-500';
  };

  // Weighted progress across all tasks
  const overallProgress = totalTasks
    ? Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / totalTasks)
    : 0;

  return (
    <div id="stats-dashboard" className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
      {/* 🔴 Left Column: Total Progress & Quick Status Tags */}
      <div id="progress-summary-card" className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-slate-500 flex items-center gap-1.5">
            <ListTodo className="w-4 h-4 text-slate-400" />
            全体の進捗状況
          </span>
          <div className="flex gap-2">
            <button
              onClick={onRefresh}
              className="p-1 px-2.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg flex items-center gap-1 border border-slate-200 bg-slate-50 active:scale-95 transition-all cursor-pointer"
              title="最新データに更新"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              同期
            </button>
          </div>
        </div>

        <div className="flex items-baseline gap-2 my-2">
          <span className="text-4xl font-extrabold text-slate-800 tracking-tight">{overallProgress}%</span>
          <span className="text-xs text-slate-400 font-semibold mb-1">完了率</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-3 mb-4 overflow-hidden border border-slate-200">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500 relative"
            style={{ width: `${overallProgress}%` }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)] bg-[length:16px_16px] animate-[shimmer_1s_infinite_linear]" />
          </div>
        </div>

        {/* Breakdown counters */}
        <div className="grid grid-cols-4 gap-1.5 text-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <div>
            <div className="text-xs text-slate-400">未着手</div>
            <div className="text-sm font-bold text-slate-600 mt-0.5">{notStartedTasks}</div>
          </div>
          <div>
            <div className="text-xs text-blue-500 font-medium">着手中</div>
            <div className="text-sm font-bold text-blue-600 mt-0.5">{inProgressTasks}</div>
          </div>
          <div>
            <div className="text-xs text-emerald-500 font-medium">完了</div>
            <div className="text-sm font-bold text-emerald-600 mt-0.5">{completedTasks}</div>
          </div>
          <div>
            <div className="text-xs text-red-500 font-medium">遅れ</div>
            <div className="text-sm font-bold text-red-600 mt-0.5">{delayedTasks}</div>
          </div>
        </div>
      </div>

      {/* 🟢 Middle Column: Active Board Details & Live Operational Team size */}
      <div id="team-summary-card" className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between columns-1">
        <div>
          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider mb-2">
            稼働メンバー (4〜10人規模)
          </span>
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-bold text-slate-700 flex items-center gap-1.5">
              <span>稼働中チーム:</span>
              <span className="text-slate-800 text-sm font-semibold bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                {members.length}名
              </span>
            </span>
          </div>

          {/* Quick list of members visually with colors */}
          <div className="flex flex-wrap gap-2 max-h-[105px] overflow-y-auto custom-scrollbar pr-1">
            {members.slice(0, 10).map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-full pl-1.5 pr-2.5 py-0.5 text-xs text-slate-700"
              >
                <span className={`w-2.5 h-2.5 rounded-full ${member.color}`} />
                <span className="font-semibold">{member.name}</span>
                <span className="text-[10px] text-slate-400 font-normal">({member.role})</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 text-xs bg-blue-50/50 border border-blue-100 p-2.5 rounded-lg text-blue-700 flex items-start gap-1.5">
          <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0 text-blue-500" />
          <span>
            スマートフォンのホーム画面に<strong>「ブックマーク登録（ホーム画面に追加）」</strong>すると、現場のショートカット看板としていつでもワンタップで開けます！
          </span>
        </div>
      </div>

      {/* 🔵 Right Column: Real-time Update Logs for Collaboration ("進捗共有をする") */}
      <div id="live-updates-log-card" className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col">
        <div className="flex justify-between items-center mb-2 shrink-0">
          <span className="text-sm font-semibold text-slate-500 flex items-center gap-1.5 font-sans">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 font-sans" />
            現場からのリアルタイム更新ログ
          </span>
          {logs.length > 0 && (
            showClearConfirm ? (
              <div className="flex items-center gap-1 bg-rose-50 border border-rose-150 p-1 py-0.5 rounded animate-[fadeIn_0.1s_ease-out]">
                <span className="text-[10px] text-rose-700 font-bold whitespace-nowrap">全履歴消去？</span>
                <button
                  type="button"
                  onClick={() => {
                    onClearLogs();
                    setShowClearConfirm(false);
                  }}
                  className="px-1.5 py-0.5 bg-rose-600 text-white hover:bg-rose-700 rounded font-bold text-[9.5px] cursor-pointer"
                >
                  はい
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="px-1.5 py-0.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded font-bold text-[9.5px] cursor-pointer"
                >
                  戻る
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="text-[10px] text-rose-500 font-bold hover:text-rose-700 hover:bg-rose-50 px-2 py-0.5 rounded border border-rose-100 cursor-pointer active:scale-95 transition"
                title="ログ履歴をすべて削除する"
              >
                ログ消去
              </button>
            )
          )}
        </div>

        {/* Scrollable list of actions */}
        <div className="overflow-y-auto max-h-[160px] md:max-h-[155px] custom-scrollbar space-y-2 flex-grow pr-1">
          {logs.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">
              まだ進捗の更新がありません。
            </div>
          ) : (
            logs.map((log) => {
              const statusColors: Record<string, string> = {
                not_started: 'text-slate-400 bg-slate-100',
                in_progress: 'text-blue-600 bg-blue-100',
                completed: 'text-emerald-600 bg-emerald-100',
                delayed: 'text-red-600 bg-red-100',
              };

              const statusLabels: Record<string, string> = {
                not_started: '未着手',
                in_progress: '着手中',
                completed: '完了',
                delayed: '遅れ',
              };

              return (
                <div key={log.id} className="text-xs bg-slate-50/80 p-2 rounded-lg border border-slate-100 flex flex-col gap-0.5 hover:bg-slate-50">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700 truncate max-w-[120px]">{log.memberName}</span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {relativeTimeJapanese(log.timestamp)}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 font-semibold truncate leading-snug">
                    {log.taskTitle}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                    <span className="text-slate-400 font-medium font-mono text-[9px]">
                      {log.prevProgress}% → {log.newProgress}%
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-400">状態:</span>
                    <span className={`px-1 rounded-sm font-bold text-[9px] ${statusColors[log.newStatus]}`}>
                      {statusLabels[log.newStatus]}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
