/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { BoardData, Task, Member, UpdateLog, TaskStatus } from './src/types';

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(process.cwd(), 'data.json');

app.use(express.json());

// Helper to generate a random short ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// Initial setup / default data helper - empty by request to clear sample data
const getDefaultData = (): BoardData => {
  return { tasks: [], members: [], logs: [] };
};

// Data persistence helpers
const readData = (): BoardData => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading data file, using defaults.', err);
  }
  const defaultData = getDefaultData();
  saveData(defaultData);
  return defaultData;
};

const saveData = (data: BoardData) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing data file', err);
  }
};

// --- API ROTES ---

// 1. Get entire board data
app.get('/api/board', (req, res) => {
  res.json(readData());
});

// 2. Reset entire board data (perfect for a quick cleanup or showcase)
app.post('/api/reset', (req, res) => {
  const defaults = getDefaultData();
  saveData(defaults);
  res.json({ success: true, message: 'ホワイトボードを初期化しました。', data: defaults });
});

// 3. Create a task
app.post('/api/tasks', (req, res) => {
  const data = readData();
  const newTask: Task = {
    id: generateId(),
    title: req.body.title || '新しい工程',
    category: req.body.category || '一般工事',
    startDate: req.body.startDate || new Date().toISOString().split('T')[0],
    endDate: req.body.endDate || new Date().toISOString().split('T')[0],
    progress: Number(req.body.progress) || 0,
    status: (req.body.status as TaskStatus) || 'not_started',
    assignees: req.body.assignees || [],
    notes: req.body.notes || '',
    order: data.tasks.length > 0 ? Math.max(...data.tasks.map((t) => t.order)) + 1 : 1,
  };

  data.tasks.push(newTask);
  saveData(data);
  res.status(201).json(newTask);
});

// 4. Update a task (updates status, progress, attributes, and writes a log entry if progress/status changed)
app.put('/api/tasks/:id', (req, res) => {
  const data = readData();
  const taskIndex = data.tasks.findIndex((t) => t.id === req.params.id);

  if (taskIndex === -1) {
    return res.status(404).json({ error: '工程が見つかりませんでした。' });
  }

  const existingTask = data.tasks[taskIndex];
  const oldStatus = existingTask.status;
  const oldProgress = existingTask.progress;

  // New values
  const updatedTask: Task = {
    ...existingTask,
    title: req.body.title !== undefined ? req.body.title : existingTask.title,
    category: req.body.category !== undefined ? req.body.category : existingTask.category,
    startDate: req.body.startDate !== undefined ? req.body.startDate : existingTask.startDate,
    endDate: req.body.endDate !== undefined ? req.body.endDate : existingTask.endDate,
    progress: req.body.progress !== undefined ? Number(req.body.progress) : existingTask.progress,
    status: req.body.status !== undefined ? (req.body.status as TaskStatus) : existingTask.status,
    assignees: req.body.assignees !== undefined ? req.body.assignees : existingTask.assignees,
    notes: req.body.notes !== undefined ? req.body.notes : existingTask.notes,
    order: req.body.order !== undefined ? Number(req.body.order) : existingTask.order,
  };

  // Adjust Status based on Progress and vice-versa if changed directly
  if (req.body.progress !== undefined && req.body.status === undefined) {
    if (updatedTask.progress === 100) {
      updatedTask.status = 'completed';
    } else if (updatedTask.progress > 0 && updatedTask.status === 'not_started') {
      updatedTask.status = 'in_progress';
    } else if (updatedTask.progress === 0 && updatedTask.status === 'in_progress') {
      updatedTask.status = 'not_started';
    }
  } else if (req.body.status !== undefined && req.body.progress === undefined) {
    if (updatedTask.status === 'completed') {
      updatedTask.progress = 100;
    } else if (updatedTask.status === 'not_started') {
      updatedTask.progress = 0;
    }
  }

  data.tasks[taskIndex] = updatedTask;

  // Create a log entry if status or progress changed
  if (oldStatus !== updatedTask.status || oldProgress !== updatedTask.progress) {
    // Try to find the person who updated or the assignee's name for log context
    let editorName = '現場チーム員';
    if (req.body.editorMemberId) {
      const editor = data.members.find((m) => m.id === req.body.editorMemberId);
      if (editor) editorName = editor.name;
    } else if (updatedTask.assignees.length > 0) {
      const primaryAssignee = data.members.find((m) => m.id === updatedTask.assignees[0]);
      if (primaryAssignee) editorName = primaryAssignee.name;
    }

    const newLog: UpdateLog = {
      id: generateId(),
      taskId: updatedTask.id,
      taskTitle: updatedTask.title,
      memberName: editorName,
      prevStatus: oldStatus,
      newStatus: updatedTask.status,
      prevProgress: oldProgress,
      newProgress: updatedTask.progress,
      timestamp: new Date().toISOString(),
    };

    data.logs.unshift(newLog); // Push to beginning of logs
    // Limit logs length to 100 logs
    if (data.logs.length > 100) data.logs.pop();
  }

  saveData(data);
  res.json(updatedTask);
});

// 5. Delete a task
app.delete('/api/tasks/:id', (req, res) => {
  const data = readData();
  const initialLength = data.tasks.length;
  data.tasks = data.tasks.filter((t) => t.id !== req.params.id);

  if (data.tasks.length === initialLength) {
    return res.status(404).json({ error: '工程が見つかりませんでした。' });
  }

  saveData(data);
  res.json({ success: true, message: '工程を削除しました。' });
});

// 6. Create a member
app.post('/api/members', (req, res) => {
  const data = readData();
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
  // Select a color that isn't heavily used or random
  const usedColors = data.members.map((m) => m.color);
  const availableColors = colors.filter((c) => !usedColors.includes(c));
  const chosenColor = availableColors.length > 0 ? availableColors[0] : colors[Math.floor(Math.random() * colors.length)];

  const newMember: Member = {
    id: generateId(),
    name: req.body.name || '新しい担当者',
    role: req.body.role || '技能工',
    color: req.body.color || chosenColor,
    phone: req.body.phone || '',
  };

  data.members.push(newMember);
  saveData(data);
  res.status(201).json(newMember);
});

// 7. Update a member
app.put('/api/members/:id', (req, res) => {
  const data = readData();
  const index = data.members.findIndex((m) => m.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: '担当者が見つかりませんでした。' });
  }

  data.members[index] = {
    ...data.members[index],
    name: req.body.name !== undefined ? req.body.name : data.members[index].name,
    role: req.body.role !== undefined ? req.body.role : data.members[index].role,
    color: req.body.color !== undefined ? req.body.color : data.members[index].color,
    phone: req.body.phone !== undefined ? req.body.phone : data.members[index].phone,
  };

  saveData(data);
  res.json(data.members[index]);
});

// 8. Delete a member
app.delete('/api/members/:id', (req, res) => {
  const data = readData();
  const initialLength = data.members.length;
  data.members = data.members.filter((m) => m.id !== req.params.id);

  if (data.members.length === initialLength) {
    return res.status(404).json({ error: '担当者が見つかりませんでした。' });
  }

  // Remove this assignee from all tasks
  data.tasks = data.tasks.map((t) => ({
    ...t,
    assignees: t.assignees.filter((mId) => mId !== req.params.id),
  }));

  saveData(data);
  res.json({ success: true, message: '担当者を削除しました。' });
});

// 9. Delete all logs
app.delete('/api/logs', (req, res) => {
  const data = readData();
  data.logs = [];
  saveData(data);
  res.json({ success: true, message: 'すべての作業日誌ログを消去しました。' });
});

// Start server with Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
