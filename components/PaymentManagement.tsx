
import React from 'react';
import { Icons } from '../constants';

const PaymentManagement: React.FC = () => {
  const payments = [
    { id: 'INV-001', project: 'A様邸 外部改修工事', amount: 1650000, status: 'PAID', dueDate: '2024-03-25' },
    { id: 'INV-002', project: 'テックオフィス移転(着工金)', amount: 2100000, status: 'PENDING', dueDate: '2024-04-10' },
    { id: 'INV-003', project: 'マンション共用部LED', amount: 935000, status: 'OVERDUE', dueDate: '2024-03-15' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">入金・会計管理</h2>
          <p className="text-slate-500 mt-1">請求ステータスと入金確認</p>
        </div>
        <div className="flex gap-2">
            <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium">CSVエクスポート</button>
            <button className="bg-[#1e3a5f] text-white px-4 py-2 rounded-lg font-medium">新規請求発行</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <div className="text-slate-400 text-xs font-bold uppercase mb-1">未入金総額</div>
            <div className="text-2xl font-bold text-slate-800">¥3,035,000</div>
        </div>
        <div className="bg-red-50 p-6 rounded-xl border border-red-100">
            <div className="text-red-400 text-xs font-bold uppercase mb-1">期限超過</div>
            <div className="text-2xl font-bold text-red-600">¥935,000</div>
        </div>
        <div className="bg-green-50 p-6 rounded-xl border border-green-100">
            <div className="text-green-400 text-xs font-bold uppercase mb-1">今月入金済</div>
            <div className="text-2xl font-bold text-green-600">¥1,650,000</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">請求書番号</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">対象案件</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">金額</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">支払期限</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">ステータス</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="px-6 py-4 text-sm font-bold text-[#1e3a5f]">{p.id}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{p.project}</td>
                  <td className="px-6 py-4 text-sm text-right font-bold text-slate-800">¥{p.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{p.dueDate}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      p.status === 'PAID' ? 'bg-green-100 text-green-700' :
                      p.status === 'OVERDUE' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {p.status === 'PAID' ? '入金済' : p.status === 'OVERDUE' ? '期限超過' : '未入金'}
                    </span>
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

export default PaymentManagement;
