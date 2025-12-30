
import React, { useState } from 'react';
import { Project, ProjectStatus } from '../types';
import { Icons } from '../constants';

const initialProjects: Project[] = [
  { id: '1', title: 'A様邸 外部改修工事', customerId: 'C001', customerName: '佐藤 健一', status: ProjectStatus.IN_PROGRESS, budget: 1500000, startDate: '2024-03-01', endDate: '2024-03-31', progress: 65 },
  { id: '2', title: '株式会社テック オフィス移転工事', customerId: 'C002', customerName: '株式会社テック', status: ProjectStatus.CONTRACTED, budget: 4200000, startDate: '2024-04-15', endDate: '2024-05-30', progress: 0 },
  { id: '3', title: 'マンション共用部LED化', customerId: 'C003', customerName: 'シティハイツ', status: ProjectStatus.COMPLETED, budget: 850000, startDate: '2024-01-10', endDate: '2024-02-15', progress: 100 },
];

const ProjectManagement: React.FC = () => {
  const [projects] = useState<Project[]>(initialProjects);
  const [filter, setFilter] = useState<ProjectStatus | 'ALL'>('ALL');

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-700 border-blue-200';
      case ProjectStatus.COMPLETED: return 'bg-green-100 text-green-700 border-green-200';
      case ProjectStatus.CONTRACTED: return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const filteredProjects = filter === 'ALL' ? projects : projects.filter(p => p.status === filter);

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            AI案件管理
            <span className="text-[10px] bg-[#c9a227] text-white px-2 py-0.5 rounded-full font-bold">Predictive</span>
          </h2>
          <p className="text-slate-500 mt-1">AIが遅延リスクを常時監視中</p>
        </div>
        <button className="bg-[#1e3a5f] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold hover:shadow-lg transition-all">
          <Icons.Plus className="w-5 h-5" />
          新規案件作成
        </button>
      </div>

      <div className="flex overflow-x-auto pb-4 gap-2 no-scrollbar">
        {['ALL', ...Object.values(ProjectStatus)].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as any)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
              filter === status 
                ? 'bg-[#1e3a5f] text-white border-[#1e3a5f] shadow-md' 
                : 'bg-white text-slate-600 border-slate-200 hover:border-[#1e3a5f]'
            }`}
          >
            {status === 'ALL' ? 'すべて' : status}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all group">
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${project.progress > 50 ? 'bg-green-500' : 'bg-amber-500'} animate-pulse`}></div>
                  <span className="text-[10px] font-bold text-slate-400">AI HEALTH: {project.progress > 50 ? 'GOOD' : 'ALERT'}</span>
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1 leading-tight group-hover:text-[#1e3a5f] transition-colors">{project.title}</h3>
              <p className="text-sm text-slate-500 mb-4">{project.customerName} 様</p>
              
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-[10px] mb-2 font-black uppercase tracking-widest text-slate-400">
                    <span>PROGRESS</span>
                    <span className="text-[#1e3a5f]">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 p-0.5">
                    <div 
                      className={`h-2 rounded-full transition-all duration-1000 ${project.progress === 100 ? 'bg-green-500' : 'bg-[#c9a227]'}`} 
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-100 shadow-sm">
                    <span className="text-xs font-bold text-[#c9a227]">AI</span>
                  </div>
                  <p className="text-[10px] text-slate-600 leading-relaxed font-medium">
                    {project.status === ProjectStatus.IN_PROGRESS 
                      ? "この進捗ペースなら3/28に完工予定です。資材搬入の再確認を。" 
                      : "契約済みの資材価格上昇リスクを検知しました。早めの発注を推奨。"}
                  </p>
                </div>
              </div>
            </div>
            <div className="px-5 py-3 bg-slate-50 flex justify-between items-center border-t border-slate-100">
               <span className="text-sm font-bold text-slate-800">¥{project.budget.toLocaleString()}</span>
               <div className="flex gap-4">
                 <button className="text-sm font-bold text-[#1e3a5f] hover:underline">管理</button>
                 <button className="text-sm font-bold text-[#c9a227] hover:underline">日報</button>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectManagement;
