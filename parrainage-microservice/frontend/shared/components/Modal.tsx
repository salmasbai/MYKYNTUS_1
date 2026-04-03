import React from 'react';

interface ModalProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ open, title, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="card-navy w-full max-w-lg p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="text-sm font-semibold text-slate-50">{title}</h3>}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 text-xs"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

