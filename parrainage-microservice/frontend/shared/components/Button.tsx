import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ loading, children, className, ...rest }) => (
  <button
    {...rest}
    disabled={loading || rest.disabled}
    className={`inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className ?? ''}`}
  >
    {loading ? '...' : children}
  </button>
);

