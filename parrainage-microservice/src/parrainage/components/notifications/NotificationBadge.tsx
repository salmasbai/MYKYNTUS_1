import React from 'react';

export const NotificationBadge: React.FC<{ count: number; className?: string }> = ({ count, className }) => {
  if (count <= 0) return null;
  return (
    <span
      className={`absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold border border-blue-500/30 flex items-center justify-center ${className ?? ''}`}
    >
      {count}
    </span>
  );
};

