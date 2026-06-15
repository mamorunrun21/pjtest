/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Task, Member, TaskStatus } from '../types.js';
import { X, Trash2, Calendar } from 'lucide-react';

interface TaskEditModalProps {
  task: Task | null; // null means adding a new task
  members: Member[];
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => void;
  onDelete?: (id: string) => void;
}

export const TaskEditModal: React.FC<TaskEditModalProps> = ({
  task,
  members,
  onClose,
  onSave,
  onDelete,
}) => {
  const isEditing = !!task;
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('木工事');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<TaskStatus>('not_started');
  const [assignees, setAssignees] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [order, setOrder] = useState<number>(1);

  // Default preset categories for easy quick choice
  const categoriesList = [
    '仮設足場',
    '解体工事',
    '下地工事',
    '防水工事',
    '木工事',
    '配管工事',
    '電気工事',
    '断熱工事',
    '内装工事',
    '左官・タイル',
    '住宅設備',
    '外部足場',
    '検査クリーニング',
    'その他',
  ];

  // Initialize fields on mount or task change
  useEffect(() => {
    setConfirmDelete(false);
    if (task) {
      setTitle(task.title);
      setCategory(task.category);
      setStartDate(task.startDate);
      setEndDate(task.endDate);
      setProgress(task.progress);
      setStatus(task.status);
      setAssignees(task.assignees || []);
      setNotes(task.notes || '');
      setOrder(task.order !== undefined ? task.order : 1);
    } else {
      // Set future-centric dates for new tasks by default centered on our active period
      setTitle('');
      setCategory('木工事');
      setStartDate('2026-06-16');
      setEndDate('2026-06-19');
      setProgress(0);
      setStatus('not_started');
      setAssignees([]);
      setNotes('');
      setOrder(1);
    }
  }, [task]);

  const handleToggleAssignee = (mId: string) => {
    setAssignees((prev) =>
      prev.includes(mId) ? prev.filter((id) => id !== mId) : [...prev, mId]
    );
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextProg = Number(e.target.value);
    setProgress(nextProg);
    
    // Automatically match Status with Progress
    if (nextProg === 100) {
      setStatus('completed');
    } else if (nextProg > 0 && status === 'not_started') {
      setStatus('in_progress');
    } else if (nextProg === 0 && status === 'in_progress') {
      setStatus('not_started');
    }
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    setStatus(newStatus);
    
    // Automatically match Progress with Status
    if (newStatus === 'completed') {
      setProgress(100);
    } else if (newStatus === 'not_started') {
      setProgress(0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: task?.id,
      title: title.trim(),
      category,
      startDate,
      endDate,
      progress,
      status,
      assignees,
      notes: notes.trim(),
      order,
    });
  };

  return (
    <div id="edit-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
      {/* Container: elegant popup sheet */}
      <div
        id="edit-modal-sheet"
        className="relative w-full max-w-lg bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col overflow-hidden max-h-[90vh]"
      >
        {/* Header toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <div>
            <span className="text-[10px] font-bold tracking-wider text-blue-600 uppercase">
              ホワイトボード・付箋カード
            </span>
            <h3 className="text-sm font-extrabold text-slate-800">
              {isEditing ? '工程詳細・変更' : '新規工程の追加配置'}
            </h3>
          </div>
          
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable form container */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 custom-scrollbar space-y-4">
          {/* Title input */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 block">工程タイトル (例: システムキッチン設置)</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="作業内容を分かりやすく入力..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Category Quick Choices */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 block">工種（カテゴリー）</label>
            <div className="flex flex-wrap gap-1">
              {categoriesList.map((catName) => (
                <button
                  key={catName}
                  type="button"
                  onClick={() => setCategory(catName)}
                  className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold transition ${category === catName ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                >
                  {catName}
                </button>
              ))}
            </div>
          </div>

          {/* Start and End date row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 block">着手(開始)予定日</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 block">完了予定日</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          {/* Whiteboard listing order option */}
          <div className="space-y-1.5 bg-blue-50/20 p-2.5 rounded-lg border border-blue-100/50">
            <label className="text-[11px] font-bold text-blue-700 block">ホワイトボード表示順 (縦方向の並び順)</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="100"
                value={order}
                onChange={(e) => setOrder(Math.max(1, Number(e.target.value)))}
                className="w-24 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-[10px] text-slate-400 font-bold leading-normal">
                ※ 数値が小さいタスクほどガントチャート上でより上部に並びます (例: 1, 2, 3...)
              </span>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Quick status badges */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 block">現在のステータス</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { s: 'not_started', label: '未着手', col: 'emerald' },
                { s: 'in_progress', label: '着手中', col: 'blue' },
                { s: 'completed', label: '完了済', col: 'emerald' },
                { s: 'delayed', label: '調整・遅れ', col: 'rose' },
              ].map((item) => (
                <button
                  key={item.s}
                  type="button"
                  onClick={() => handleStatusChange(item.s as TaskStatus)}
                  className={`py-2 text-center text-xs font-bold rounded-lg border transition ${status === item.s ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Progress Slider */}
          <div className="space-y-1 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
            <div className="flex justify-between text-[11px] font-bold mb-1.5">
              <span className="text-slate-500">進捗度合い (%)</span>
              <span className="text-blue-600 font-bold font-mono text-xs">{progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={progress}
              onChange={handleProgressChange}
              className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-400 font-bold pt-0.5">
              <span>0% (未)</span>
              <span>25%</span>
              <span>50% (中盤)</span>
              <span>75%</span>
              <span>100% (完了)</span>
            </div>
          </div>

          {/* Multiple select assignees */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 block">
              担当者 (複数選択マグネット)
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {members.map((m) => {
                const isSelected = assignees.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleToggleAssignee(m.id)}
                    className={`flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-full border text-xs font-bold transition-all ${isSelected ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' : 'bg-slate-50 border-slate-150 text-slate-600 hover:bg-slate-100'}`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${m.color}`} />
                    <span>{m.name}</span>
                    <span className="text-[9px] text-slate-400">({m.role.substring(0,2)})</span>
                  </button>
                );
              })}
              {members.length === 0 && (
                <p className="text-xs text-rose-500">
                  先にメンバーを設定してください。
                </p>
              )}
            </div>
          </div>

          {/* Notes description text */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 block">現場への引き継ぎメモ・注意等</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="進捗遅延の理由や、後工程への引継ぎ条件（例: 床下点検口の位置確認、等）を記載してください..."
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Bottom actions row */}
          <div className="flex justify-between items-center pt-3 border-t border-slate-100">
            {isEditing && onDelete ? (
              confirmDelete ? (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl p-2 animate-[fadeIn_0.15s_ease-out]">
                  <span className="text-[11px] font-bold text-rose-700">工程を削除しますか？</span>
                  <button
                    type="button"
                    onClick={() => onDelete(task.id)}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold text-[10px]"
                  >
                    はい
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded font-bold text-[10px]"
                  >
                    いいえ
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-2 rounded-xl border border-rose-100 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>削除</span>
                </button>
              )
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 border border-slate-200 rounded-lg"
              >
                戻る
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow cursor-pointer transition active:scale-95"
              >
                ホワイトボードに貼る
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
