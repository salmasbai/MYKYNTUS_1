import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input: React.FC<InputProps> = ({ label, className, ...rest }) => (
  <div className="space-y-1.5">
    <label className="text-xs text-slate-400">{label}</label>
    <input
      {...rest}
      className={`w-full rounded-md border border-navy-800 bg-navy-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 ${className ?? ''}`}
    />
  </div>
);

