
import React, { useState } from 'react';
import { Customer } from '../types';
import { Icons } from '../constants';

const mockCustomers: Customer[] = [
  { id: 'C001', name: '佐藤 健一', representative: '佐藤 健一', address: '東京都新宿区...', phone: '090-1234-5678', email: 'sato@example.com', lastContact: '2024-03-10' },
  { id: 'C002', name: '株式会社テック', representative: '田中 太郎', address: '神奈川県横浜市...', phone: '045-987-6543', email: 'info@tech-corp.jp', lastContact: '2024-03-12' },
  { id: 'C003', name: 'シティハイツ管理組合', representative: '理事長 鈴木', address: '千葉県浦安市...', phone: '047-111-2222', email: 'kanri@city-heights.com', lastContact: '2024-02-28' },
];

const CRM: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = mockCustomers.filter(c => 
    c.name.includes(searchTerm) || c.id.includes(searchTerm)
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">顧客管理</h2>
          <p className="text-slate-500 mt-1">顧客情報の一元管理</p>
        </div>
        <button className="bg-[#1e3a5f] text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium">
          <Icons.Plus className="w-5 h-5" />
          新規顧客登録
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <div className="relative max-w-sm">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </span>
            <input
              type="text"
              placeholder="顧客名、IDで検索..."
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1e3a5f] focus:border-[#1e3a5f] sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">顧客ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">顧客名 / 代表者</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">連絡先</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">最終接触日</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">アクション</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filtered.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1e3a5f]">{customer.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-slate-800">{customer.name}</div>
                    <div className="text-xs text-slate-500">{customer.representative}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600">{customer.phone}</div>
                    <div className="text-xs text-slate-400">{customer.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{customer.lastContact}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-[#1e3a5f] hover:text-[#2c4e7a] font-bold">編集</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CRM;
