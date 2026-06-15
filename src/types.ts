/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'delayed';

export interface Member {
  id: string;
  name: string;
  role: string;
  color: string; // Tailwind bg color class (e.g., 'bg-blue-500') or Hex code
  phone?: string;
}

export interface Task {
  id: string;
  title: string;
  category: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  progress: number; // 0 to 100
  status: TaskStatus;
  assignees: string[]; // Member IDs
  notes?: string;
  order: number;
}

export interface UpdateLog {
  id: string;
  taskId: string;
  taskTitle: string;
  memberName: string;
  prevStatus: TaskStatus;
  newStatus: TaskStatus;
  prevProgress: number;
  newProgress: number;
  timestamp: string;
}

export interface BoardData {
  tasks: Task[];
  members: Member[];
  logs: UpdateLog[];
}
