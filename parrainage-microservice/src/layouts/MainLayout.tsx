import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Role } from '../types';

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [role, setRole] = useState<Role>('Collaborateur');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  return (
    <div className="min-h-screen bg-navy-950 flex transition-colors duration-300">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        role={role}
        setRole={setRole}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      <main
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-[70px]' : 'ml-64'
        } min-h-screen flex flex-col`}
      >
        <Header title="Parrainage des collaborateurs" setActiveTab={setActiveTab} />

        <div className="p-6 md:p-8 flex-1">{children}</div>

        <footer className="p-6 md:p-8 border-t border-navy-800 text-center text-xs text-slate-600">
          &copy; 2024 MyKyntus. Parrainage des collaborateurs.
        </footer>
      </main>
    </div>
  );
};

