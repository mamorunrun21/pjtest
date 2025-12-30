
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyzeBusinessStatus } from '../services/geminiService';
import { Icons } from '../constants';

const mockData = [
  { month: '1月', sales: 1200, profit: 450 },
  { month: '2月', sales: 900, profit: 320 },
  { month: '3月', sales: 1500, profit: 580 },
  { month: '4月', sales: 1100, profit: 410 },
  { month: '5月', sales: 1800, profit: 720 },
  { month: '6月', sales: 2100, profit: 890 },
];

const Dashboard: React.FC = () => {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAnalysis = async () => {
    setIsLoading(true);
    const result = await analyzeBusinessStatus({ 
      revenue_ytd: 86000000, 
      active_projects: 12, 
      delay_risk_projects: 2,
      margin_avg: 0.28
    });
    setAiAnalysis(result);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">AIX Dashboard</h2>
          <p className="text-slate-500 font-medium text-sm">リアルタイム経営指標とAIインサイト</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />)}
            </div>
            <span className="text-xs font-bold text-slate-400">3名のメンバーが稼働中</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: '売上予測 (今期)', value: '¥1.24億', trend: '+15%', icon: Icons.Payments, color: 'blue' },
          { label: '営業利益率', value: '28.4%', trend: '+2.1%', icon: Icons.Estimates, color: 'emerald' },
          { label: '稼働案件', value: '12', trend: '+1', icon: Icons.Project, color: 'amber' },
          { label: 'AI Risk Alert', value: '2', trend: 'LOWER', icon: Icons.Dashboard, color: 'rose' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className={`text-xs font-black px-2 py-1 rounded-full ${stat.trend === 'LOWER' || stat.trend.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-3xl font-black text-slate-800 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">Revenue & Profit AI Projection</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#1e3a5f]" /><span className="text-xs font-bold text-slate-500">Sales</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#c9a227]" /><span className="text-xs font-bold text-slate-500">Profit</span></div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e3a5f" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold', fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold', fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} 
                />
                <Area type="monotone" dataKey="sales" stroke="#1e3a5f" fillOpacity={1} fill="url(#colorSales)" strokeWidth={4} name="売上" />
                <Area type="monotone" dataKey="profit" stroke="#c9a227" fillOpacity={0} strokeWidth={3} strokeDasharray="5 5" name="利益" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-[#1e3a5f] text-white p-8 rounded-3xl shadow-2xl flex flex-col relative overflow-hidden">
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#c9a227] to-[#e6bc3e] flex items-center justify-center shadow-lg">
                <span className="text-white text-lg font-black italic">AI</span>
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight leading-none">ConsFlow AIX <span className="text-[#c9a227]">Advisor</span></h3>
                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">Powered by Gemini 3.0 Flash</p>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <div className="w-12 h-12 border-4 border-[#c9a227] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Analyzing Big Data...</p>
                </div>
              ) : (
                <div className="space-y-6 text-sm leading-relaxed text-slate-200">
                  <p className="font-medium">{aiAnalysis || "データを読み込んでいます..."}</p>
                  
                  <div className="pt-6 border-t border-[#ffffff10] space-y-3">
                    <p className="text-[10px] font-black text-[#c9a227] uppercase tracking-widest">Recommended Actions</p>
                    <button className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold transition-all flex items-center justify-between group">
                      <span>案件Aの資材コスト再見積</span>
                      <Icons.Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <button className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold transition-all flex items-center justify-between group">
                      <span>顧客満足度向上に向けた自動メール</span>
                      <Icons.Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button 
              onClick={fetchAnalysis}
              className="mt-8 w-full py-4 bg-[#c9a227] text-white rounded-2xl font-black text-sm hover:bg-[#b89120] active:scale-[0.98] transition-all shadow-xl shadow-[#c9a22730]"
            >
              再分析を実行する
            </button>
          </div>
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-[#c9a227] opacity-10 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
