import React from 'react';
import { ICONS, Role } from '../types';
import { MOCK_REQUESTS } from '../mockData';
import { Badge } from './Badge';

export const HRManagement: React.FC<{ role: Role }> = ({ role }) => {
  const canApproveReject = role === 'RH';
  const canGenerate = role === 'RH' || role === 'Admin';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white">Document Requests Queue</h3>
          <p className="text-sm text-slate-500">Manage and process employee document requests</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-navy-900 border border-navy-800 rounded-lg text-sm text-slate-300 hover:bg-navy-800 transition-all">
            <ICONS.Filter className="w-4 h-4" />
            Advanced Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-sm font-semibold text-white hover:bg-blue-500 transition-all">
            <ICONS.Upload className="w-4 h-4" />
            Upload Document
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="card-navy p-4 border-l-4 border-amber-500">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Pending</p>
          <h4 className="text-2xl font-bold text-white">12</h4>
        </div>
        <div className="card-navy p-4 border-l-4 border-blue-500">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Approved</p>
          <h4 className="text-2xl font-bold text-white">28</h4>
        </div>
        <div className="card-navy p-4 border-l-4 border-emerald-500">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Generated</p>
          <h4 className="text-2xl font-bold text-white">145</h4>
        </div>
        <div className="card-navy p-4 border-l-4 border-red-500">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Rejected</p>
          <h4 className="text-2xl font-bold text-white">5</h4>
        </div>
      </div>

      <div className="card-navy overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-navy-800/50 border-b border-navy-800">
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Employee</th>
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
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-navy-800 flex items-center justify-center text-xs font-bold text-blue-400 border border-navy-700">
                      {req.employeeName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{req.employeeName}</p>
                      <p className="text-[10px] text-slate-500 uppercase">Engineering</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-300">{req.type}</span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">{req.requestDate}</td>
                <td className="px-6 py-4">
                  <Badge status={req.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {req.status === 'Pending' && canApproveReject && (
                      <>
                        <button className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all" title="Approve">
                          <ICONS.Check className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all" title="Reject">
                          <ICONS.X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {req.status === 'Approved' && canGenerate && (
                      <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 text-blue-500 border border-blue-500/20 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition-all">
                        <ICONS.Edit className="w-3 h-3" />
                        Generate
                      </button>
                    )}
                    <button className="p-2 text-slate-500 hover:text-white hover:bg-navy-700 rounded-lg transition-all">
                      <ICONS.More className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
