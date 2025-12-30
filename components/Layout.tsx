
import React, { useState } from 'react';
import { Icons, COLORS } from '../constants';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, userRole, setUserRole }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'AIダッシュボード', icon: Icons.Dashboard, roles: [UserRole.ADMIN] },
    { id: 'crm', label: '顧客管理', icon: Icons.CRM, roles: [UserRole.ADMIN, UserRole.SALES] },
    { id: 'projects', label: 'AI案件管理', icon: Icons.Project, roles: [UserRole.ADMIN, UserRole.SALES, UserRole.SITE_MANAGER] },
    { id: 'estimates', label: '見積・請求', icon: Icons.Estimates, roles: [UserRole.ADMIN, UserRole.SALES, UserRole.BACK_OFFICE] },
    { id: 'reports', label: 'AI現場日報', icon: Icons.Reports, roles: [UserRole.ADMIN, UserRole.SITE_MANAGER] },
    { id: 'payments', label: '入金・会計', icon: Icons.Payments, roles: [UserRole.ADMIN, UserRole.BACK_OFFICE] },
  ];

  const visibleMenuItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc]">
      {/* Sidebar Desktop */}
      <aside className="no-print hidden md:flex flex-col w-64 bg-[#1e3a5f] text-white shrink-0 sticky top-0 h-screen">
        <div className="p-6 border-b border-[#ffffff10]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#c9a227] rounded-lg flex items-center justify-center font-bold text-lg">A</div>
            <h1 className="text-xl font-bold tracking-tight">ConsFlow <span className="text-[#c9a227]">AIX</span></h1>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">AI-DRIVEN CONSTRUCTION ERP</p>
        </div>
        <nav className="flex-1 mt-6 px-3 space-y-1">
          {visibleMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-[#c9a227] text-white shadow-lg shadow-[#c9a22740]' 
                  : 'hover:bg-[#ffffff08] text-slate-300'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-slate-400'}`} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 mt-auto">
          <div className="bg-[#162a45] rounded-xl p-3 border border-[#ffffff10]">
            <div className="text-[10px] text-slate-400 mb-2 uppercase font-bold tracking-widest">USER MODE</div>
            <select 
              value={userRole} 
              onChange={(e) => setUserRole(e.target.value as UserRole)}
              className="w-full bg-transparent text-xs font-bold border-none focus:ring-0 cursor-pointer"
            >
              <option value={UserRole.ADMIN}>管理者 (経営・全機能)</option>
              <option value={UserRole.SALES}>営業担当 (顧客・見積)</option>
              <option value={UserRole.SITE_MANAGER}>現場担当 (日報・進捗)</option>
              <option value={UserRole.BACK_OFFICE}>事務局 (入金・請求)</option>
            </select>
          </div>
        </div>
      </aside>

      {/* Mobile Nav */}
      <header className="no-print md:hidden bg-[#1e3a5f] text-white p-4 flex justify-between items-center sticky top-0 z-50 border-b border-[#ffffff10]">
        <div className="flex items-center gap-2">
           <span className="text-lg font-bold">ConsFlow <span className="text-[#c9a227]">AIX</span></span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
        </button>
      </header>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-[#1e3a5f] z-[60] md:hidden p-6">
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-2xl font-bold">ConsFlow <span className="text-[#c9a227]">AIX</span></h1>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <nav className="space-y-4">
            {visibleMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-lg ${
                  activeTab === item.id ? 'bg-[#c9a227] text-white' : 'text-slate-300'
                }`}
              >
                <item.icon className="w-6 h-6" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
