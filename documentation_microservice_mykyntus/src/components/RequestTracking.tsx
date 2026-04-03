import React from 'react';
import { ICONS } from '../types';
import { MOCK_REQUESTS } from '../mockData';
import { Badge } from './Badge';

export const RequestTracking: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">My Request History</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Showing last 12 months</span>
          <button className="p-2 text-slate-400 hover:text-white transition-colors">
            <ICONS.Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="card-navy overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-navy-800/50 border-b border-navy-800">
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Request ID</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Document Type</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Request Date</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-800">
            {MOCK_REQUESTS.map((req) => (
              <tr key={req.id} className="hover:bg-navy-800/30 transition-colors">
                <td className="px-6 py-4">
                  <span className="text-sm font-mono text-blue-400">{req.id}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-slate-200">{req.type}</span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">{req.requestDate}</td>
                <td className="px-6 py-4">
                  <Badge status={req.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="text-xs font-semibold text-blue-500 hover:text-blue-400 px-3 py-1 rounded-md border border-blue-500/20 hover:bg-blue-500/10 transition-all">
                      Details
                    </button>
                    {req.status === 'Generated' && (
                      <button className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all">
                        <ICONS.Download className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Timeline View for selected request (Simplified) */}
      <div className="card-navy p-6">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Request Timeline: REQ-002</h4>
        <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-navy-800">
          <div className="flex gap-4 relative">
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center z-10 border-4 border-navy-900">
              <ICONS.Check className="w-3 h-3 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Request Submitted</p>
              <p className="text-xs text-slate-500">March 05, 2024 • 09:15 AM</p>
            </div>
          </div>
          <div className="flex gap-4 relative">
            <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center z-10 border-4 border-navy-900 animate-pulse">
              <ICONS.Clock className="w-3 h-3 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Pending HR Review</p>
              <p className="text-xs text-slate-500">Expected completion by March 08, 2024</p>
            </div>
          </div>
          <div className="flex gap-4 relative opacity-40">
            <div className="w-6 h-6 rounded-full bg-navy-800 flex items-center justify-center z-10 border-4 border-navy-900">
              <div className="w-2 h-2 rounded-full bg-slate-600"></div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400">Document Generation</p>
              <p className="text-xs text-slate-600">Pending approval</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
