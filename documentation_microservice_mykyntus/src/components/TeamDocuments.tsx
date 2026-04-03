import React from 'react';
import { ICONS, Role } from '../types';
import { MOCK_TEAM_DOCS } from '../mockData';
import { Badge } from './Badge';
import { filterByEmployeeScope } from '../lib/documentationFilters';
import { useDocumentationHierarchyDrill } from '../contexts/DocumentationHierarchyDrillContext';
import { DocDrillBar } from './DocDrillBar';

export const TeamDocuments: React.FC<{ role: Role }> = ({ role }) => {
  const { drill } = useDocumentationHierarchyDrill();
  const teamDocs = filterByEmployeeScope(
    MOCK_TEAM_DOCS,
    role,
    role === 'Manager' || role === 'RP' ? drill : undefined,
  );
  return (
    <div className="space-y-6">
      {(role === 'Manager' || role === 'RP') && <DocDrillBar role={role} />}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white">Documents de l’équipe</h3>
          <p className="text-sm text-slate-500">
            Consulter et valider les documents de vos collaborateurs directs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <ICONS.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher un collaborateur…"
              className="bg-navy-900 border border-navy-800 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-300 focus:outline-none focus:border-blue-500 w-64 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="card-navy overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-navy-800/50 border-b border-navy-800">
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Collaborateur
              </th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Document
              </th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Service
              </th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-800">
            {teamDocs.map((doc) => (
              <tr key={doc.id} className="hover:bg-navy-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center text-xs font-bold text-blue-500">
                      {doc.employeeName?.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <span className="text-sm font-semibold text-slate-200">
                      {doc.employeeName}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <ICONS.Documents className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-300">{doc.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">{doc.department}</td>
                <td className="px-6 py-4">
                  <Badge status={doc.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 text-slate-500 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all">
                      <ICONS.Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-500 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all">
                      <ICONS.Download className="w-4 h-4" />
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
