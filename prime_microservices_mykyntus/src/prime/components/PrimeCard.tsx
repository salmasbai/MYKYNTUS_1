import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PrimeCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function PrimeCard({ title, description, children, className, action }: PrimeCardProps) {
  return (
    <div className={cn("bg-card border border-default rounded-xl shadow-sm overflow-hidden", className)}>
      {(title || description || action) && (
        <div className="px-6 py-4 border-b border-default flex justify-between items-center">
          <div>
            {title && <h3 className="text-lg font-semibold text-primary">{title}</h3>}
            {description && <p className="text-sm text-muted mt-1">{description}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6 text-primary">
        {children}
      </div>
    </div>
  );
}
