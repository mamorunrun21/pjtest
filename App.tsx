
import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ProjectManagement from './components/ProjectManagement';
import CRM from './components/CRM';
import Estimation from './components/Estimation';
import DailyReport from './components/DailyReport';
import PaymentManagement from './components/PaymentManagement';
import { UserRole } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole, setUserRole] = useState<UserRole>(UserRole.ADMIN);

  // Simple internal routing based on tab state
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'crm': return <CRM />;
      case 'projects': return <ProjectManagement />;
      case 'estimates': return <Estimation />;
      case 'reports': return <DailyReport />;
      case 'payments': return <PaymentManagement />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      userRole={userRole} 
      setUserRole={setUserRole}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
