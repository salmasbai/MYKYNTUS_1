import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
}

export const Select: React.FC<SelectProps> = ({ label, className, children, ...rest }) => (
  <div className="space-y-1.5">
    <label className="text-xs text-slate-400">{label}</label>
    <select
      {...rest}
      className={`w-full rounded-md border border-navy-800 bg-navy-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 ${className ?? ''}`}
    >
      {children}
    </select>
  </div>
);

