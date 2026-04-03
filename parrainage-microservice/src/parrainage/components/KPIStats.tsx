import React from 'react';
import { motion } from 'motion/react';

interface KPIStatsProps {
  items: { label: string; value: string | number; accent?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'orange'; icon?: React.ComponentType<{ className?: string }> }[];
}

const accentClass = (accent?: string) => {
  switch (accent) {
    case 'green': return 'text-emerald-500 bg-emerald-500/10';
    case 'yellow': return 'text-amber-500 bg-amber-500/10';
    case 'orange': return 'text-amber-500 bg-amber-500/10';
    case 'red': return 'text-red-500 bg-red-500/10';
    case 'purple': return 'text-indigo-500 bg-indigo-500/10';
    default: return 'text-blue-500 bg-blue-500/10';
  }
};

/** Matches Documentation PiloteDashboard KPI cards */
export const KPIStats: React.FC<KPIStatsProps> = ({ items }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
    {items.map((item, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.05 }}
        className="card-navy p-6 flex items-center justify-between"
      >
        <div>
          <p className="text-sm text-slate-400 font-medium mb-1">{item.label}</p>
          <h3 className="text-3xl font-bold text-white">{item.value}</h3>
        </div>
        {item.icon && (
          <div className={`w-12 h-12 ${accentClass(item.accent)} rounded-xl flex items-center justify-center shrink-0`}>
            <item.icon className="w-6 h-6" />
          </div>
        )}
      </motion.div>
    ))}
  </div>
);
