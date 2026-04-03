import React from 'react';
import { Sidebar } from '../../shared/components/Sidebar';
import { Header } from '../../shared/components/Header';

export const AdminLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <div className="min-h-screen flex bg-navy-950 text-slate-100">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} adminMode />
      <div className={`flex-1 flex flex-col transition-all ${isCollapsed ? 'ml-[70px]' : 'ml-64'}`}>
        <Header admin />
        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

