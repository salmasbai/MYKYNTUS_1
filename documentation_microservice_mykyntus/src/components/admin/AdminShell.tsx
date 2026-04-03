import React from 'react';
import { ICONS } from '../../types';

type AdminShellIcon = any;

export function AdminShell(props: {
  title: string;
  description: string;
  icon?: AdminShellIcon;
  children: React.ReactNode;
}) {
  const { title, description, icon, children } = props;
  const Icon = icon ?? ICONS.Config;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

