import React from 'react';
import { ICONS, Role } from '../types';
import { MOCK_REQUESTS } from '../mockData';
import { Badge } from './Badge';
import { filterByEmployeeScope } from '../lib/documentationFilters';
import { useDocumentationHierarchyDrill } from '../contexts/DocumentationHierarchyDrillContext';
import { DocDrillBar } from './DocDrillBar';

export const TeamRequests: React.FC<{ role: Role }> = ({ role }) => {
  const { drill } = useDocumentationHierarchyDrill();
  const teamReqs = filterByEmployeeScope(
    MOCK_REQUESTS,
    role,
    role === 'Manager' || role === 'RP' ? drill : undefined,
  );
  return (
    <div className="space-y-6">
      {(role === 'Manager' || role === 'RP') && <DocDrillBar role={role} />}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white">Team Document Requests</h3>
          <p className="text-sm text-slate-500">
            Consulter les demandes de vos collaborateurs directs. Seuls les RH approuvent ou rejettent.
          </p>
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
            {teamReqs.map((req) => (
              <tr key={req.id} className="hover:bg-navy-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-navy-800 flex items-center justify-center text-xs font-bold text-blue-400 border border-navy-700">
                      {req.employeeName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-sm font-semibold text-slate-200">{req.employeeName}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-300">{req.type}</td>
                <td className="px-6 py-4 text-sm text-slate-400">{req.requestDate}</td>
                <td className="px-6 py-4">
                  <Badge status={req.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      className="p-2 text-slate-500 hover:text-white transition-colors"
                      title="Détails"
                    >
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
