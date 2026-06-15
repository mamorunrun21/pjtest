/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Member } from '../types.js';
import { Users, Plus, Trash2, Edit2, Phone, Save, X } from 'lucide-react';

interface MemberManagerProps {
  members: Member[];
  onAddMember: (name: string, role: string, phone: string, color?: string) => void;
  onUpdateMember: (id: string, name: string, role: string, phone: string, color?: string) => void;
  onDeleteMember: (id: string) => void;
}

export const MemberManager: React.FC<MemberManagerProps> = ({
  members,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);

  // Form states for adding
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newColor, setNewColor] = useState('bg-blue-600');

  // Form states for editing
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editColor, setEditColor] = useState('bg-blue-600');

  const availableColors = [
    { bg: 'bg-slate-600', label: 'グレー' },
    { bg: 'bg-rose-600', label: 'レッド' },
    { bg: 'bg-amber-600', label: 'オレンジ' },
    { bg: 'bg-emerald-600', label: 'グリーン' },
    { bg: 'bg-blue-600', label: 'ブルー' },
    { bg: 'bg-indigo-600', label: 'ディープ' },
    { bg: 'bg-purple-600', label: 'パープル' },
    { bg: 'bg-yellow-500', label: 'イエロー' },
    { bg: 'bg-teal-600', label: 'ティール' },
    { bg: 'bg-pink-600', label: 'ピンク' },
  ];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddMember(
      newName.trim(),
      newRole.trim() || '大工・技術員',
      newPhone.trim(),
      newColor
    );
    setNewName('');
    setNewRole('');
    setNewPhone('');
    setNewColor('bg-blue-600');
    setIsAdding(false);
  };

  const startEditing = (m: Member) => {
    setEditingId(m.id);
    setEditName(m.name);
    setEditRole(m.role);
    setEditPhone(m.phone || '');
    setEditColor(m.color || 'bg-blue-600');
  };

  const handleEditSubmit = (id: string) => {
    if (!editName.trim()) return;
    onUpdateMember(id, editName.trim(), editRole.trim(), editPhone.trim(), editColor);
    setEditingId(null);
  };

  return (
    <div id="member-manager-root" className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
      <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-1.5">
            <Users className="w-5 h-5 text-blue-500" />
            担当メンバー管理 (現場スタッフ名簿)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            現場で稼働する大工職人や協力会社の登録。ホワイトボード上の丸マグネット（イニシャル付き）として全画面で連携します。
          </p>
        </div>

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold px-3 py-2 rounded-xl border border-slate-250 cursor-pointer active:scale-95 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            メンバー追加
          </button>
        )}
      </div>

      {/* 🔴 Expand Add Member Form */}
      {isAdding && (
        <form onSubmit={handleAddSubmit} className="bg-slate-50 border border-slate-150 p-4 rounded-xl mb-4 space-y-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-slate-600">新規メンバーの登録</span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">お名前 (必須)</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="例: 佐藤 省吾"
                required
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">職種・役割 (例: 棟梁, 電気技師)</label>
              <input
                type="text"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                placeholder="例: 給排水工"
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">連絡先電話番号 (任意)</label>
              <input
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="例: 090-0000-0000"
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Color magnet select */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-500">
              マーカー・マグネットの色を選択
            </label>
            <div className="flex flex-wrap gap-1.5 py-1">
              {availableColors.map((col) => {
                const isSelected = newColor === col.bg;
                return (
                  <button
                    key={col.bg}
                    type="button"
                    onClick={() => setNewColor(col.bg)}
                    className={`w-7 h-7 rounded-full text-white font-black flex items-center justify-center transition border-2 ${isSelected ? 'border-amber-400 scale-110 shadow-md ring-2 ring-blue-400/30' : 'border-transparent opacity-85 hover:opacity-100'} ${col.bg}`}
                    title={col.label}
                  >
                    {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-200 rounded-lg border border-slate-200"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
            >
              保存する
            </button>
          </div>
        </form>
      )}

      {/* 🟢 Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {members.map((member) => {
          const isEditing = editingId === member.id;
          const initials = member.name.trim().substring(0, 2);

          if (isEditing) {
            return (
              <div key={member.id} className="bg-white border-2 border-blue-500 rounded-xl p-3 space-y-2.5 shadow-md">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold">お名前</span>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 font-bold"
                    placeholder="お名前"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold">役割・職種</span>
                  <input
                    type="text"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-650"
                    placeholder="役割"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold">電話番号</span>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-650"
                    placeholder="電話番号"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold block">色</span>
                  <div className="flex flex-wrap gap-1.5 py-0.5">
                    {availableColors.map((col) => {
                      const isSelected = editColor === col.bg;
                      return (
                        <button
                          key={col.bg}
                          type="button"
                          onClick={() => setEditColor(col.bg)}
                          className={`w-5.5 h-5.5 rounded-full text-white text-[9px] font-black flex items-center justify-center transition border ${isSelected ? 'border-amber-400 scale-105 shadow ring-1 ring-blue-300' : 'border-transparent opacity-85'} ${col.bg}`}
                          title={col.label}
                        >
                          {isSelected && '✓'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-1.5 pt-1.5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="p-1 px-2.5 text-[10px] font-bold text-slate-500 hover:bg-slate-100 border border-slate-200 rounded"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEditSubmit(member.id)}
                    className="p-1 px-3 text-[10px] bg-blue-600 hover:bg-blue-700 text-white rounded font-bold"
                  >
                    保存
                  </button>
                </div>
              </div>
            );
          }

          if (deletingMemberId === member.id) {
            return (
              <div key={member.id} className="bg-rose-50 border border-rose-250 rounded-xl p-3 flex flex-col justify-between h-full min-h-[110px] shadow-sm animate-[fadeIn_0.15s_ease-out]">
                <div className="space-y-1">
                  <div className="font-extrabold text-rose-800 text-xs">
                    {member.name}さんを削除
                  </div>
                  <div className="text-[10px] text-rose-600 font-bold leading-tight">
                    全工程の割り当てから解除されます。実行しますか？
                  </div>
                </div>
                <div className="flex justify-end gap-1.5 pt-2 border-t border-rose-100 mt-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setDeletingMemberId(null)}
                    className="px-2 py-1 text-[10px] font-bold text-slate-500 hover:bg-slate-100 bg-white border border-slate-200 rounded"
                  >
                    戻る
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteMember(member.id);
                      setDeletingMemberId(null);
                    }}
                    className="px-2.5 py-1 text-[10px] bg-rose-600 hover:bg-rose-700 text-white rounded font-bold"
                  >
                    はい、削除
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={member.id}
              className="bg-slate-50/50 border border-slate-200 rounded-xl p-3 flex items-start gap-2.5 relative group hover:bg-slate-55"
            >
              {/* Initials Magnet Avatar */}
              <div
                className={`w-9 h-9 rounded-full text-white font-extrabold flex items-center justify-center text-xs shadow-sm shadow-black/5 shrink-0 transition-transform group-hover:scale-[1.05] ${member.color}`}
              >
                {initials}
              </div>

              {/* Text Meta Container */}
              <div className="space-y-0.5 min-w-0 pr-6 flex-grow font-sans">
                <div className="font-bold text-slate-800 text-xs truncate">
                  {member.name}
                </div>
                <div className="text-[10px] text-slate-400 font-bold">
                  {member.role}
                </div>
                {member.phone ? (
                  <a
                    href={`tel:${member.phone}`}
                    className="inline-flex items-center gap-0.5 text-[9px] text-sky-600 font-semibold hover:underline"
                  >
                    <Phone className="w-2.5 h-2.5" />
                    {member.phone}
                  </a>
                ) : (
                  <span className="text-[9px] text-slate-350">連絡先未登録</span>
                )}
              </div>

              {/* Action Anchors - always visible on touch/mobile, hoverable on desktop */}
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => startEditing(member)}
                  className="p-1 text-slate-400 hover:text-blue-600 rounded bg-white hover:bg-slate-100 border border-slate-200 transition"
                  title="変更"
                >
                  <Edit2 className="w-2.5 h-2.5" />
                </button>
                <button
                  onClick={() => setDeletingMemberId(member.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded bg-white hover:bg-slate-100 border border-slate-200 transition"
                  title="削除"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
