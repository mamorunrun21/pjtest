/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { BoardData, Task, Member, UpdateLog, TaskStatus } from './types';
import { DashboardStats } from './components/DashboardStats';
import { GanttChart } from './components/GanttChart';
import { MobileTaskList } from './components/MobileTaskList';
import { MemberManager } from './components/MemberManager';
import { TaskEditModal } from './components/TaskEditModal';
import { relativeTimeJapanese, formatTimestamp } from './utils/dateHelpers';
import { ClipboardList, LayoutGrid, Users, History, Layers, CheckCircle2, CloudLightning, Info, Database, Settings } from 'lucide-react';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';

export default function App() {
  const [boardData, setBoardData] = useState<BoardData>({ tasks: [], members: [], logs: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncTime, setSyncTime] = useState<string>('');

  // Active view tab state (main board vs staff config vs updates index)
  const [activeTab, setActiveTab] = useState<'board' | 'members' | 'logs'>('board');

  // Manual view override for demo testing on single screens
  const [viewOverride, setViewOverride] = useState<'auto' | 'desktop' | 'mobile'>('auto');

  // Task Edit Modal control
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Status Notification popup
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Trigger brief alert
  const triggerToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Fetch all board sync info
  const fetchBoardData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setSyncing(true);
    
    try {
      if (isSupabaseConfigured && supabase) {
        // Fetch tasks, members, and logs from Supabase database directly
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .order('order', { ascending: true });
        if (tasksError) throw tasksError;

        const { data: membersData, error: membersError } = await supabase
          .from('members')
          .select('*')
          .order('created_at', { ascending: true });
        if (membersError) throw membersError;

        const { data: logsData, error: logsError } = await supabase
          .from('update_logs')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(100);
        if (logsError) throw logsError;

        // Map Supabase DB schemas to local matching Typescript structures
        const formattedTasks: Task[] = (tasksData || []).map((t: any) => ({
          id: t.id,
          title: t.title,
          category: t.category,
          startDate: t.start_date,
          endDate: t.end_date,
          progress: t.progress,
          status: t.status,
          assignees: t.assignees || [],
          notes: t.notes || '',
          order: t.order || 1,
        }));

        const formattedMembers: Member[] = (membersData || []).map((m: any) => ({
          id: m.id,
          name: m.name,
          role: m.role,
          color: m.color,
          phone: m.phone || '',
        }));

        const formattedLogs: UpdateLog[] = (logsData || []).map((l: any) => ({
          id: l.id,
          taskId: l.task_id,
          taskTitle: l.task_title,
          memberName: l.member_name,
          prevStatus: l.prev_status,
          newStatus: l.new_status,
          prevProgress: l.prev_progress,
          newProgress: l.new_progress,
          timestamp: l.timestamp,
        }));

        setBoardData({
          tasks: formattedTasks,
          members: formattedMembers,
          logs: formattedLogs,
        });
        setErrorMsg(null);
        setSyncTime(new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } else {
        // Supabase未設定時は、初回のロード時のみ初期ダミーデータをセットし、それ以外は何もしない（ローカルステートをそのまま使う）
        if (boardData.tasks.length === 0 && boardData.members.length === 0 && !silent) {
          setBoardData({
            tasks: [
              {
                id: 'task-1',
                title: '基礎工事（コンクリート打設）',
                category: '一般工事',
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                progress: 30,
                status: 'in_progress',
                assignees: ['member-1'],
                notes: '養生期間を考慮しつつ円滑に進める。',
                order: 1
              },
              {
                id: 'task-2',
                title: '鉄骨建て方・外壁下地',
                category: '鉄骨工事',
                startDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                progress: 0,
                status: 'not_started',
                assignees: ['member-2'],
                notes: '高所作業のため安全帯の使用を徹底。',
                order: 2
              }
            ],
            members: [
              { id: 'member-1', name: '佐藤 健二', role: '現場監督', color: 'bg-blue-600', phone: '090-1234-5678' },
              { id: 'member-2', name: '鈴木 祥太', role: '大工職長', color: 'bg-rose-600', phone: '080-9876-5432' }
            ],
            logs: []
          });
        }
        setErrorMsg(null);
        setSyncTime(new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('データ通信に問題が発生しました。インターネット接続と、サーバー起動をご確認ください。');
      triggerToast('サーバーとの同期に失敗しました', 'error');
    } finally {
      if (!silent) setLoading(false);
      else setSyncing(false);
    }
  };

  // Lifecycle initial loader
  useEffect(() => {
    fetchBoardData();
    // Intelligent auto-sync polling every 8 seconds to allow multi-user updates reflection ("進捗共有をする")
    const interval = setInterval(() => {
      fetchBoardData(true);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Task: Add or update handler
  const handleSaveTask = async (taskData: Partial<Task>) => {
    setIsEditModalOpen(false);
    setSyncing(true);
    
    const isEditing = !!taskData.id;

    try {
      if (isSupabaseConfigured && supabase) {
        if (isEditing) {
          // Adjust Status based on Progress update
          let finalStatus = taskData.status;
          let finalProgress = taskData.progress;
          const oldTask = boardData.tasks.find(t => t.id === taskData.id);
          const oldStatus = oldTask ? oldTask.status : 'not_started';
          const oldProgress = oldTask ? oldTask.progress : 0;

          if (taskData.progress !== undefined && taskData.status === undefined) {
            if (taskData.progress === 100) {
              finalStatus = 'completed';
            } else if (taskData.progress > 0 && oldStatus === 'not_started') {
              finalStatus = 'in_progress';
            } else if (taskData.progress === 0 && oldStatus === 'in_progress') {
              finalStatus = 'not_started';
            }
          } else if (taskData.status !== undefined && taskData.progress === undefined) {
            if (taskData.status === 'completed') {
              finalProgress = 100;
            } else if (taskData.status === 'not_started') {
              finalProgress = 0;
            }
          }

          const { error } = await supabase
            .from('tasks')
            .update({
              title: taskData.title,
              category: taskData.category,
              start_date: taskData.startDate,
              end_date: taskData.endDate,
              progress: finalProgress !== undefined ? Number(finalProgress) : undefined,
              status: finalStatus,
              assignees: taskData.assignees,
              notes: taskData.notes,
              order: taskData.order !== undefined ? Number(taskData.order) : undefined,
            })
            .eq('id', taskData.id);
          if (error) throw error;

          // Push logging trigger to DB
          const statusChanged = oldStatus !== finalStatus && finalStatus !== undefined;
          const progressChanged = oldProgress !== finalProgress && finalProgress !== undefined;
          if (statusChanged || progressChanged) {
            let editorName = '現場チーム員';
            if (taskData.assignees && taskData.assignees.length > 0) {
              const primaryAssignee = boardData.members.find(m => m.id === taskData.assignees![0]);
              if (primaryAssignee) editorName = primaryAssignee.name;
            }

            await supabase.from('update_logs').insert([{
              task_id: taskData.id,
              task_title: taskData.title || oldTask?.title || '工程',
              member_name: editorName,
              prev_status: oldStatus,
              new_status: finalStatus || oldStatus,
              prev_progress: oldProgress,
              new_progress: finalProgress !== undefined ? finalProgress : oldProgress,
            }]);
          }
        } else {
          // INSERT task
          const nextOrder = boardData.tasks.length > 0 ? Math.max(...boardData.tasks.map(t => t.order)) + 1 : 1;
          const { error } = await supabase
            .from('tasks')
            .insert([{
              title: taskData.title || '新しい工程',
              category: taskData.category || '一般工事',
              start_date: taskData.startDate || new Date().toISOString().split('T')[0],
              end_date: taskData.endDate || new Date().toISOString().split('T')[0],
              progress: Number(taskData.progress) || 0,
              status: taskData.status || 'not_started',
              assignees: taskData.assignees || [],
              notes: taskData.notes || '',
              order: nextOrder,
            }]);
          if (error) throw error;
        }

        triggerToast(isEditing ? '工程を更新しました！' : '新しい工程をホワイトボードに貼り付けました！', 'success');
        fetchBoardData(true);
      } else {
        // Local in-memory fallback
        let updatedTasks = [...boardData.tasks];
        let finalStatus = taskData.status;
        let finalProgress = taskData.progress;
        
        if (isEditing) {
          const oldTask = boardData.tasks.find(t => t.id === taskData.id);
          const oldStatus = oldTask ? oldTask.status : 'not_started';
          const oldProgress = oldTask ? oldTask.progress : 0;

          if (taskData.progress !== undefined && taskData.status === undefined) {
            if (taskData.progress === 100) {
              finalStatus = 'completed';
            } else if (taskData.progress > 0 && oldStatus === 'not_started') {
              finalStatus = 'in_progress';
            } else if (taskData.progress === 0 && oldStatus === 'in_progress') {
              finalStatus = 'not_started';
            }
          } else if (taskData.status !== undefined && taskData.progress === undefined) {
            if (taskData.status === 'completed') {
              finalProgress = 100;
            } else if (taskData.status === 'not_started') {
              finalProgress = 0;
            }
          }

          updatedTasks = updatedTasks.map(t => {
            if (t.id === taskData.id) {
              return {
                ...t,
                ...taskData,
                status: finalStatus || t.status,
                progress: finalProgress !== undefined ? Number(finalProgress) : t.progress,
              } as Task;
            }
            return t;
          });

          // Create localized in-memory update logs
          const statusChanged = oldStatus !== finalStatus && finalStatus !== undefined;
          const progressChanged = oldProgress !== finalProgress && finalProgress !== undefined;
          let newLogs = [...boardData.logs];
          
          if (statusChanged || progressChanged) {
            let editorName = '現場チーム員';
            if (taskData.assignees && taskData.assignees.length > 0) {
              const primaryAssignee = boardData.members.find(m => m.id === taskData.assignees![0]);
              if (primaryAssignee) editorName = primaryAssignee.name;
            }

            const newLog: UpdateLog = {
              id: 'log-' + Math.random().toString(36).substring(2, 9),
              taskId: taskData.id!,
              taskTitle: taskData.title || oldTask?.title || '工程',
              memberName: editorName,
              prevStatus: oldStatus,
              newStatus: finalStatus || oldStatus,
              prevProgress: oldProgress,
              newProgress: finalProgress !== undefined ? finalProgress : oldProgress,
              timestamp: new Date().toISOString()
            };
            newLogs = [newLog, ...newLogs].slice(0, 100);
          }

          setBoardData(prev => ({
            ...prev,
            tasks: updatedTasks,
            logs: newLogs
          }));
        } else {
          const nextOrder = boardData.tasks.length > 0 ? Math.max(...boardData.tasks.map(t => t.order)) + 1 : 1;
          const newTask: Task = {
            id: 'task-' + Math.random().toString(36).substring(2, 9),
            title: taskData.title || '新しい工程',
            category: taskData.category || '一般工事',
            startDate: taskData.startDate || new Date().toISOString().split('T')[0],
            endDate: taskData.endDate || new Date().toISOString().split('T')[0],
            progress: Number(taskData.progress) || 0,
            status: taskData.status || 'not_started',
            assignees: taskData.assignees || [],
            notes: taskData.notes || '',
            order: nextOrder
          };
          setBoardData(prev => ({
            ...prev,
            tasks: [...prev.tasks, newTask]
          }));
        }

        triggerToast(isEditing ? '工程を更新しました！' : '新しい工程をホワイトボードに貼り付けました！', 'success');
      }
    } catch (err: any) {
      triggerToast(err.message || '保存できませんでした。', 'error');
    } finally {
      setSyncing(false);
    }
  };

  // Task: Quick status updater for mobile views (instant tap)
  const handleQuickStatusUpdate = async (taskId: string, progress: number, status: TaskStatus) => {
    setSyncing(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const oldTask = boardData.tasks.find(t => t.id === taskId);
        const oldStatus = oldTask ? oldTask.status : 'not_started';
        const oldProgress = oldTask ? oldTask.progress : 0;

        const { error } = await supabase
          .from('tasks')
          .update({ progress, status })
          .eq('id', taskId);
        if (error) throw error;

        // Push quick logging trace
        let editorName = '現場チーム員';
        if (oldTask && oldTask.assignees.length > 0) {
          const primaryAssignee = boardData.members.find(m => m.id === oldTask.assignees[0]);
          if (primaryAssignee) editorName = primaryAssignee.name;
        }

        await supabase.from('update_logs').insert([{
          task_id: taskId,
          task_title: oldTask ? oldTask.title : '工程',
          member_name: editorName,
          prev_status: oldStatus,
          new_status: status,
          prev_progress: oldProgress,
          new_progress: progress,
        }]);

        triggerToast('現場からの進捗を即時保存・共有しました！', 'success');
        fetchBoardData(true);
      } else {
        // Local in-memory quick status update
        const oldTask = boardData.tasks.find(t => t.id === taskId);
        const oldStatus = oldTask ? oldTask.status : 'not_started';
        const oldProgress = oldTask ? oldTask.progress : 0;

        const updatedTasks = boardData.tasks.map(t => {
          if (t.id === taskId) {
            return { ...t, progress, status };
          }
          return t;
        });

        let editorName = '現場チーム員';
        if (oldTask && oldTask.assignees.length > 0) {
          const primaryAssignee = boardData.members.find(m => m.id === oldTask.assignees[0]);
          if (primaryAssignee) editorName = primaryAssignee.name;
        }

        const newLog: UpdateLog = {
          id: 'log-' + Math.random().toString(36).substring(2, 9),
          taskId: taskId,
          taskTitle: oldTask ? oldTask.title : '工程',
          memberName: editorName,
          prevStatus: oldStatus,
          newStatus: status,
          prevProgress: oldProgress,
          newProgress: progress,
          timestamp: new Date().toISOString()
        };

        setBoardData(prev => ({
          ...prev,
          tasks: updatedTasks,
          logs: [newLog, ...prev.logs].slice(0, 100)
        }));

        triggerToast('現場からの進捗を即時保存・共有しました！', 'success');
      }
    } catch (err: any) {
      triggerToast('更新に失敗しました。', 'error');
    } finally {
      setSyncing(false);
    }
  };

  // Task: Delete handler
  const handleDeleteTask = async (id: string) => {
    setIsEditModalOpen(false);
    setSyncing(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', id);
        if (error) throw error;

        triggerToast('工程をホワイトボードから取り外しました。', 'info');
        fetchBoardData(true);
      } else {
        // Local in-memory delete
        setBoardData(prev => ({
          ...prev,
          tasks: prev.tasks.filter(t => t.id !== id)
        }));
        triggerToast('工程をホワイトボードから取り外しました。', 'info');
      }
    } catch (err: any) {
      triggerToast('削除に失敗しました。', 'error');
    } finally {
      setSyncing(false);
    }
  };

  // Staff Member: Create handler
  const handleAddMember = async (name: string, role: string, phone: string, color?: string) => {
    setSyncing(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const colors = [
          'bg-slate-600',
          'bg-rose-600',
          'bg-amber-600',
          'bg-emerald-600',
          'bg-blue-600',
          'bg-indigo-600',
          'bg-purple-600',
          'bg-pink-600',
          'bg-yellow-500',
          'bg-teal-600',
        ];
        const usedColors = boardData.members.map((m) => m.color);
        const availableColors = colors.filter((c) => !usedColors.includes(c));
        const chosenColor = color || (availableColors.length > 0 ? availableColors[0] : colors[Math.floor(Math.random() * colors.length)]);

        const { error } = await supabase
          .from('members')
          .insert([{ name, role, phone, color: chosenColor }]);
        if (error) throw error;

        triggerToast(`${name}さんを現場名簿に登録しました！`, 'success');
        fetchBoardData(true);
      } else {
        // Local in-memory member add
        const colors = [
          'bg-slate-600',
          'bg-rose-600',
          'bg-amber-600',
          'bg-emerald-600',
          'bg-blue-600',
          'bg-indigo-600',
          'bg-purple-600',
          'bg-pink-600',
          'bg-yellow-500',
          'bg-teal-600',
        ];
        const usedColors = boardData.members.map((m) => m.color);
        const availableColors = colors.filter((c) => !usedColors.includes(c));
        const chosenColor = color || (availableColors.length > 0 ? availableColors[0] : colors[Math.floor(Math.random() * colors.length)]);

        const newMember: Member = {
          id: 'member-' + Math.random().toString(36).substring(2, 9),
          name: name,
          role: role,
          phone: phone || '',
          color: chosenColor
        };

        setBoardData(prev => ({
          ...prev,
          members: [...prev.members, newMember]
        }));

        triggerToast(`${name}さんを現場名簿に登録しました！`, 'success');
      }
    } catch (err: any) {
      triggerToast('追加に失敗しました。', 'error');
    } finally {
      setSyncing(false);
    }
  };

  // Staff Member: Update handler
  const handleUpdateMember = async (id: string, name: string, role: string, phone: string, color?: string) => {
    setSyncing(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('members')
          .update({ name, role, phone, color })
          .eq('id', id);
        if (error) throw error;

        triggerToast('メンバー情報を変更しました。', 'success');
        fetchBoardData(true);
      } else {
        // Local in-memory member update
        const updatedMembers = boardData.members.map(m => {
          if (m.id === id) {
            return { ...m, name, role, phone, color: color || m.color };
          }
          return m;
        });

        setBoardData(prev => ({
          ...prev,
          members: updatedMembers
        }));

        triggerToast('メンバー情報を変更しました。', 'success');
      }
    } catch (err: any) {
      triggerToast('更新に失敗しました。', 'error');
    } finally {
      setSyncing(false);
    }
  };

  // Staff Member: Delete handler
  const handleDeleteMember = async (id: string) => {
    setSyncing(true);
    try {
      if (isSupabaseConfigured && supabase) {
        // Delete member directly
        const { error: deleteError } = await supabase
          .from('members')
          .delete()
          .eq('id', id);
        if (deleteError) throw deleteError;

        // Unlink assignees mapping
        const relevantTasks = boardData.tasks.filter(t => t.assignees.includes(id));
        for (const task of relevantTasks) {
          await supabase
            .from('tasks')
            .update({
              assignees: task.assignees.filter(memberId => memberId !== id),
            })
            .eq('id', task.id);
        }

        triggerToast('メンバーを削除し、工程の割り当てを解除しました。', 'info');
        fetchBoardData(true);
      } else {
        // Local in-memory member delete & unlink from tasks
        const updatedMembers = boardData.members.filter(m => m.id !== id);
        const updatedTasks = boardData.tasks.map(t => {
          if (t.assignees.includes(id)) {
            return {
              ...t,
              assignees: t.assignees.filter(memberId => memberId !== id)
            };
          }
          return t;
        });

        setBoardData(prev => ({
          ...prev,
          members: updatedMembers,
          tasks: updatedTasks
        }));

        triggerToast('メンバーを削除し、工程の割り当てを解除しました。', 'info');
      }
    } catch (err: any) {
      triggerToast('削除に失敗しました。', 'error');
    } finally {
      setSyncing(false);
    }
  };

  // Reset demo defaults state in one click (for showcasing and diagnostics)
  const handleResetDemo = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        // Safe clear logic in dev playground
        await supabase.from('tasks').delete().neq('id', 'dummy');
        await supabase.from('members').delete().neq('id', 'dummy');
        await supabase.from('update_logs').delete().neq('id', 'dummy');

        setBoardData({ tasks: [], members: [], logs: [] });
        triggerToast('工程表の全データをクリアしました。', 'success');
      } else {
        // Reset local memory board completely back to empty
        setBoardData({ tasks: [], members: [], logs: [] });
        triggerToast('工程表の全データをクリアしました。', 'success');
      }
    } catch (err: any) {
      triggerToast('初期化に失敗しました。', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Clear all log history from server database
  const handleClearLogs = async () => {
    setSyncing(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('update_logs').delete().neq('id', 'dummy');
        if (error) throw error;
        triggerToast('すべての進捗履歴ログを消去しました。', 'info');
        fetchBoardData(true);
      } else {
        setBoardData(prev => ({
          ...prev,
          logs: []
        }));
        triggerToast('すべての進捗履歴ログを消去しました。', 'info');
      }
    } catch (err: any) {
      triggerToast('ログの消去に失敗しました。', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const startAddTask = () => {
    setSelectedTask(null);
    setIsEditModalOpen(true);
  };

  const startEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans select-none whiteboard-bg pb-12">
      
      {/* 🔴 Clean Tactile Engineering Banner Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-sm shadow-sm">
              DX
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-800 tracking-tight">
                  スマート工程管理 V2
                </h1>
                <div className="h-4 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>
                <span className="text-xs text-slate-500 font-medium italic hidden sm:inline">
                  ホワイトボード工程表 共同稼働中
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-wider">
                渋谷マンション修繕プロジェクト &middot; 小規模工事現場向けDX
              </p>
            </div>
          </div>

          {/* Sync status pills & Manual View overrides */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            {/* Supabase Database Connection Status */}
            {isSupabaseConfigured && (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-extrabold border bg-emerald-50 text-emerald-800 border-emerald-200"
                style={{ contentVisibility: 'auto' }}
                title="Supabaseリアルタイムデータベース連携中"
              >
                <Database className="w-3.5 h-3.5 shrink-0" />
                <span>Supabase同期中</span>
              </div>
            )}

            {/* Sync diagnostics tag */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className={`inline-block w-2 h-2 rounded-full ${syncing ? 'bg-blue-500 animate-ping' : 'bg-emerald-500'}`} />
              <span className="font-semibold text-[10px] sm:text-xs">
                {syncing ? '同期中...' : syncTime ? `同期済 ${syncTime}` : '同期中'}
              </span>
            </div>

            {/* Manual screen override buttons for evaluation */}
            <div className="bg-slate-100 p-1 rounded-md flex items-center gap-1 text-[10px] sm:text-xs font-bold text-slate-600">
              <button
                onClick={() => setViewOverride('auto')}
                className={`px-3 py-1 rounded text-[11px] ${viewOverride === 'auto' ? 'bg-white text-slate-800 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                自動
              </button>
              <button
                onClick={() => setViewOverride('desktop')}
                className={`px-3 py-1 rounded text-[11px] ${viewOverride === 'desktop' ? 'bg-white text-slate-800 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                title="PC用のガントチャートを強制表示"
              >
                PC用
              </button>
              <button
                onClick={() => setViewOverride('mobile')}
                className={`px-3 py-1 rounded text-[11px] ${viewOverride === 'mobile' ? 'bg-white text-slate-800 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                title="現場スマホ用のタスクカードを強制表示"
              >
                スマホ用
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* 🟢 Toast Feedbacks Popups */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-[slideUp_0.2s_ease-out] flex items-center gap-2.5 bg-slate-800 border border-slate-700 font-bold text-white px-4 py-3 rounded-2xl shadow-xl">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs">{toast.message}</span>
        </div>
      )}

      {/* 🔵 Main App Container Canvas */}
      <main className="max-w-7xl mx-auto px-4 pt-5 w-full flex-grow">
        
        {/* Banner Announcement of Priority Goals */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-5 flex flex-col md:flex-row items-start md:items-center gap-4 shadow-sm">
          <div className="bg-blue-50 border border-blue-100 p-2.5 rounded-lg shrink-0 text-blue-600">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-700">
              スマート工程管理 V2 の優先ゴール
            </h4>
            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
              <span className="text-[11px] text-slate-500 font-bold flex items-center gap-1.5">
                <span className="text-blue-600">✔</span> 【工程の見える化】マグネット配置の直感ガントチャート
              </span>
              <span className="text-[11px] text-slate-500 font-bold flex items-center gap-1.5">
                <span className="text-blue-600">✔</span> 【現場から簡単報告】スマホから数秒・タップで進捗を同期
              </span>
              <span className="text-[11px] text-slate-500 font-bold flex items-center gap-1.5">
                <span className="text-blue-600">✔</span> 【自動の進捗共有】全員の画面に更新ログをリアルタイム配信
              </span>
            </div>
          </div>
        </div>

        {/* Real-time Project Dashboard Statistics Widget */}
        <DashboardStats
          tasks={boardData.tasks}
          members={boardData.members}
          logs={boardData.logs}
          onRefresh={() => fetchBoardData(false)}
          onResetDemo={handleResetDemo}
          onClearLogs={handleClearLogs}
        />

        {/* View Selection Category Tabs */}
        <div className="flex items-center gap-6 mb-5 border-b border-slate-200 pb-0">
          <button
            onClick={() => setActiveTab('board')}
            className={`flex items-center gap-1.5 pb-3 text-xs font-bold transition-all border-b-2 -mb-px ${activeTab === 'board' ? 'border-b-blue-600 text-blue-600 font-bold' : 'border-b-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>ガントチャート工程表</span>
          </button>
          
          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-1.5 pb-3 text-xs font-bold transition-all border-b-2 -mb-px ${activeTab === 'members' ? 'border-b-blue-600 text-blue-600 font-bold' : 'border-b-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <Users className="w-4 h-4" />
            <span>担当メンバー管理 ({boardData.members.length}名)</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-1.5 pb-3 text-xs font-bold transition-all border-b-2 -mb-px ${activeTab === 'logs' ? 'border-b-blue-600 text-blue-600 font-bold' : 'border-b-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <History className="w-4 h-4" />
            <span>日報ログ一覧</span>
          </button>
        </div>

        {/* 🟡 View: Active Board (Gantt Chart or Mobile Task List) */}
        {activeTab === 'board' && (
          <div className="space-y-4">
            
            {/* Desktop / Large Screen Gantt Layout */}
            {(viewOverride === 'desktop' || (viewOverride === 'auto' && true)) && (
              <div className={viewOverride === 'desktop' ? 'block' : 'hidden md:block'}>
                <GanttChart
                  tasks={boardData.tasks}
                  members={boardData.members}
                  onEditTask={startEditTask}
                  onAddTask={startAddTask}
                />
              </div>
            )}

            {/* Mobile / Screen Task List Cards */}
            {(viewOverride === 'mobile' || (viewOverride === 'auto' && true)) && (
              <div className={viewOverride === 'mobile' ? 'block' : 'block md:hidden'}>
                <MobileTaskList
                  tasks={boardData.tasks}
                  members={boardData.members}
                  onUpdateStatus={handleQuickStatusUpdate}
                  onEditTask={startEditTask}
                />
              </div>
            )}

            {/* Mobile instruction block only visible when auto */}
            {viewOverride === 'auto' && (
              <div className="md:hidden mt-2 text-center text-[10px] text-slate-400 font-medium">
                ※パソコンから開くと大画面用の美しいマグネットガントチャートが表示されます。
              </div>
            )}
          </div>
        )}

        {/* 🟡 View: Staff Members Management */}
        {activeTab === 'members' && (
          <MemberManager
            members={boardData.members}
            onAddMember={handleAddMember}
            onUpdateMember={handleUpdateMember}
            onDeleteMember={handleDeleteMember}
          />
        )}

        {/* 🟡 View: History Logs List */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-base font-bold text-slate-850 flex items-center gap-1.5 pb-3 border-b border-slate-100">
              <History className="w-5 h-5 text-blue-500" />
              現場作業日誌 & 日報ログ一覧
            </h2>
            
            <div className="divide-y divide-slate-100 mt-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
              {boardData.logs.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  まだ作業報告ログがありません。現場スマホから「100%完了」や「進捗変更」タップすると履歴が記録されます。
                </div>
              ) : (
                boardData.logs.map((log) => {
                  const statusDisplay: Record<string, string> = {
                    not_started: '未着手',
                    in_progress: '着手中',
                    completed: '完了済',
                    delayed: '遅れ・調整',
                  };
                  return (
                    <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:bg-slate-50 px-2 rounded-lg transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                           <span className="font-bold text-slate-800">{log.memberName}</span>
                          <span className="text-[10px] text-slate-400">{formatTimestamp(log.timestamp)}</span>
                        </div>
                        <div className="text-slate-600 font-semibold">{log.taskTitle}</div>
                      </div>
                      <div className="flex items-center gap-3 self-end sm:self-auto font-mono text-[11px]">
                        <span className="text-slate-400">{log.prevProgress}% → {log.newProgress}%</span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-400">状態:</span>
                        <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${log.newStatus === 'completed' ? 'bg-emerald-100 text-emerald-700' : log.newStatus === 'delayed' ? 'bg-rose-100 text-rose-700' : 'bg-blue-150 text-blue-700'}`}>
                          {statusDisplay[log.newStatus]}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

      </main>

      {/* 🔴 Edit/Add Task Popper Modal */}
      {isEditModalOpen && (
        <TaskEditModal
          task={selectedTask}
          members={boardData.members}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
        />
      )}

    </div>
  );
}
