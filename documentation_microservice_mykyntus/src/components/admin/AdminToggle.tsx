import React from 'react';

export function AdminToggle(props: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  disabled?: boolean;
  title?: string;
}) {
  const { checked, onChange, label, disabled, title } = props;

  return (
    <label
      className={`flex items-center gap-3 ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      title={title}
    >
      <span className="relative inline-flex items-center">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span
          className={`w-11 h-6 rounded-full transition-colors ${
            checked ? 'bg-blue-600' : 'bg-navy-800'
          }`}
        >
          <span
            className={`absolute top-0 left-0 w-6 h-6 rounded-full bg-navy-900 border border-navy-800 transition-transform ${
              checked ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </span>
      </span>
      {label && <span className="text-sm text-slate-300">{label}</span>}
    </label>
  );
}

