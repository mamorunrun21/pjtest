
import React, { useState } from 'react';
import { EstimationItem } from '../types';
import { Icons } from '../constants';

const Estimation: React.FC = () => {
  const [items, setItems] = useState<EstimationItem[]>([
    { id: '1', name: '仮設工事', quantity: 1, unit: '一式', unitPrice: 150000, cost: 100000 },
    { id: '2', name: '外壁塗装工事', quantity: 120, unit: '㎡', unitPrice: 4500, cost: 3000 },
    { id: '3', name: '屋根防水工事', quantity: 80, unit: '㎡', unitPrice: 6000, cost: 4200 },
  ]);

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const totalCost = items.reduce((sum, item) => sum + (item.quantity * item.cost), 0);
  const profit = totalAmount - totalCost;
  const profitMargin = (profit / totalAmount) * 100;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="no-print flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">見積作成・管理</h2>
          <p className="text-slate-500 mt-1">原価・粗利の自動計算</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="bg-white border border-[#1e3a5f] text-[#1e3a5f] px-4 py-2 rounded-lg flex items-center gap-2 font-medium hover:bg-slate-50">
            <Icons.Download className="w-5 h-5" />
            PDF出力 (印刷)
          </button>
          <button className="bg-[#1e3a5f] text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium">
            <Icons.Plus className="w-5 h-5" />
            項目追加
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 no-print">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 font-medium">見積総額</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">¥{totalAmount.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 font-medium">原価合計</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">¥{totalCost.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm text-slate-500 font-medium">粗利 / 粗利率</p>
              <p className="text-3xl font-bold text-[#c9a227] mt-1">¥{profit.toLocaleString()}</p>
            </div>
            <span className="text-xl font-bold text-slate-400">{profitMargin.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden print:shadow-none print:border-none">
        <div className="p-8 hidden print:block">
           <div className="flex justify-between items-start mb-12">
              <div>
                <h1 className="text-4xl font-bold text-[#1e3a5f]">御見積書</h1>
                <p className="mt-4 text-slate-600">株式会社テック 様</p>
                <p className="mt-1 text-slate-600">下記の通り御見積申し上げます。</p>
              </div>
              <div className="text-right">
                <p className="font-bold">ConsFlow 建設株式会社</p>
                <p className="text-sm text-slate-500">東京都港区南青山 1-2-3</p>
                <p className="text-sm text-slate-500">TEL: 03-1234-5678</p>
                <div className="mt-4 w-16 h-16 border border-slate-200 ml-auto flex items-center justify-center text-[8px] text-slate-400">社印</div>
              </div>
           </div>
           <div className="text-2xl font-bold border-b-2 border-[#1e3a5f] pb-2 mb-8">
             見積金額: ¥{totalAmount.toLocaleString()} (税込)
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">品名・項目</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">数量</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">単位</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">単価</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider no-print">原価単価</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">金額</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-600">{item.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-slate-600">{item.unit}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-600">¥{item.unitPrice.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-400 italic no-print">¥{item.cost.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-slate-900">¥{(item.quantity * item.unitPrice).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50">
                <tr>
                   <td colSpan={4} className="px-6 py-4 text-right font-bold text-slate-600">小計</td>
                   <td colSpan={2} className="px-6 py-4 text-right font-bold text-slate-900">¥{totalAmount.toLocaleString()}</td>
                </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Estimation;
